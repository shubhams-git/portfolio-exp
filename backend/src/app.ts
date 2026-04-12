import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { env, normalizeOrigin, type AppEnv } from "./config/env.js";
import {
  createNdjsonContactSubmissionStore,
  type ContactSubmissionStore,
} from "./lib/contact-store.js";
import {
  createFixedWindowRateLimiter,
  type ContactRateLimiter,
} from "./lib/contact-rate-limit.js";
import { defaultLogger, type AppLogger } from "./lib/logging.js";
import { createContactRouter } from "./routes/contact.js";
import { healthRouter } from "./routes/health.js";

export type AppDependencies = {
  env?: AppEnv;
  logger?: AppLogger;
  contactStore?: ContactSubmissionStore;
  rateLimiter?: ContactRateLimiter;
};

/** Vercel deployment URLs (preview and production) use this host pattern. */
const VERCEL_APP_ORIGIN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function createCorsOriginDelegate(env: AppEnv, logger: AppLogger) {
  const allowed = new Set(env.ALLOWED_ORIGINS);

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    let normalizedOrigin: string;

    try {
      normalizedOrigin = normalizeOrigin(origin);
    } catch {
      logger.warn("[cors] rejected malformed origin", { origin });
      callback(null, false);
      return;
    }

    if (allowed.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    if (env.CORS_ALLOW_VERCEL_PREVIEW && VERCEL_APP_ORIGIN.test(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    logger.warn("[cors] rejected origin", { origin: normalizedOrigin });
    callback(null, false);
  };
}

export function createApp(dependencies: AppDependencies = {}) {
  const runtimeEnv = dependencies.env ?? env;
  const logger = dependencies.logger ?? defaultLogger;
  const contactStore =
    dependencies.contactStore ??
    createNdjsonContactSubmissionStore(runtimeEnv.CONTACT_STORAGE_PATH);
  const rateLimiter =
    dependencies.rateLimiter ??
    createFixedWindowRateLimiter({
      limit: runtimeEnv.CONTACT_RATE_LIMIT_MAX,
      windowMs: runtimeEnv.CONTACT_RATE_LIMIT_WINDOW_MS,
    });

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", runtimeEnv.TRUST_PROXY);

  app.use(
    cors({
      origin: createCorsOriginDelegate(runtimeEnv, logger),
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_request, response) => {
    response.json({ service: "the-layered-matrix-api", status: "online" });
  });

  app.use("/api", healthRouter);
  app.use(
    "/api",
    createContactRouter({
      env: runtimeEnv,
      store: contactStore,
      rateLimiter,
      logger,
    }),
  );

  app.use(
    (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
      logger.error("[api] unhandled error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      response.status(500).json({
        status: "error",
        message: "Unexpected server error.",
      });
    },
  );

  return app;
}
