import { Router } from "express";
import { z } from "zod";

import { type AppEnv } from "../config/env.js";
import {
  createContactSubmissionRecord,
  type ContactSubmissionStore,
} from "../lib/contact-store.js";
import {
  createFixedWindowRateLimiter,
  type ContactRateLimiter,
} from "../lib/contact-rate-limit.js";
import { defaultLogger, type AppLogger } from "../lib/logging.js";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  message: z.string().trim().min(10).max(4000),
});

export type ContactRouterDependencies = {
  env: AppEnv;
  store: ContactSubmissionStore;
  rateLimiter: ContactRateLimiter;
  logger?: AppLogger;
  now?: () => number;
};

export function createContactRouter({
  env,
  store,
  rateLimiter,
  logger = defaultLogger,
  now = Date.now,
}: ContactRouterDependencies) {
  const contactRouter = Router();

  contactRouter.post("/contact", async (request, response) => {
    const parsed = contactSchema.safeParse(request.body);

    if (!parsed.success) {
      logger.warn("[contact] rejected invalid payload", {
        ip: request.ip,
        issues: parsed.error.flatten().fieldErrors,
      });

      response.status(400).json({
        status: "error",
        message: "Invalid contact submission payload.",
        issues: parsed.error.flatten(),
      });
      return;
    }

    const clientIdentifier = request.ip || "unknown";
    const rateLimit = rateLimiter.check(clientIdentifier, now());

    response.setHeader("X-RateLimit-Limit", String(rateLimit.limit));
    response.setHeader("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.setHeader("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));

    if (!rateLimit.allowed) {
      if (rateLimit.retryAfterSeconds) {
        response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
      }

      logger.warn("[contact] rate limited submission", {
        ip: request.ip,
        email: parsed.data.email,
        limit: rateLimit.limit,
      });

      response.status(429).json({
        status: "error",
        message: "Too many contact submissions. Try again later.",
      });
      return;
    }

    const submission = createContactSubmissionRecord({
      input: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      },
      receiver: env.CONTACT_RECEIVER,
      ip: request.ip ?? null,
      userAgent: request.get("user-agent") ?? null,
      origin: request.get("origin") ?? null,
      receivedAt: new Date(now()).toISOString(),
    });

    try {
      await store.append(submission);
      logger.info("[contact] submission stored", {
        id: submission.id,
        ip: submission.ip,
        email: submission.email,
      });

      response.status(202).json({
        status: "accepted",
        receiptId: submission.id,
        receiver: env.CONTACT_RECEIVER,
        message: `Submission received for ${submission.name}. It has been stored for follow-up.`,
      });
    } catch (error) {
      logger.error("[contact] failed to persist submission", {
        ip: request.ip,
        email: parsed.data.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      response.status(500).json({
        status: "error",
        message: "Unable to persist contact submission right now. Please try again later.",
      });
    }
  });

  return contactRouter;
}
