import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";
import type { AppEnv } from "../src/config/env.js";
import type { ContactNotifier } from "../src/lib/contact-notifier.js";
import type { ContactSubmissionStore } from "../src/lib/contact-store.js";

const baseEnv: AppEnv = {
  PORT: 8000,
  ALLOWED_ORIGINS: ["http://localhost:5173"],
  CONTACT_RECEIVER: "hello@example.com",
  CONTACT_STORAGE_PATH: "data/contact-submissions.ndjson",
  CONTACT_RATE_LIMIT_WINDOW_MS: 60_000,
  CONTACT_RATE_LIMIT_MAX: 2,
  TRUST_PROXY: true,
  CORS_ALLOW_VERCEL_PREVIEW: false,
};

async function createTestApp(overrides: Partial<AppEnv> = {}) {
  const storageDir = await mkdtemp(join(tmpdir(), "layered-matrix-backend-"));
  const env = {
    ...baseEnv,
    CONTACT_STORAGE_PATH: join(storageDir, "contact-submissions.ndjson"),
    ...overrides,
  } satisfies AppEnv;

  return {
    app: createApp({ env }),
    env,
  };
}

describe("API", () => {
  it("returns health status", async () => {
    const { app } = await createTestApp();
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns CORS headers for configured origins", async () => {
    const { app } = await createTestApp({
      ALLOWED_ORIGINS: ["https://portfolio-exp.vercel.app"],
    });

    const response = await request(app)
      .options("/api/contact")
      .set("Origin", "https://portfolio-exp.vercel.app")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://portfolio-exp.vercel.app",
    );
  });

  it("allows Vercel preview origins when enabled", async () => {
    const { app } = await createTestApp({
      CORS_ALLOW_VERCEL_PREVIEW: true,
    });

    const response = await request(app)
      .options("/api/contact")
      .set("Origin", "https://portfolio-exp-git-main-shubham.vercel.app")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://portfolio-exp-git-main-shubham.vercel.app",
    );
  });

  it("omits CORS headers for disallowed origins", async () => {
    const { app } = await createTestApp();

    const response = await request(app)
      .options("/api/contact")
      .set("Origin", "https://malicious.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("accepts a valid contact submission and persists it", async () => {
    const { app, env } = await createTestApp();
    const payload = {
      name: "Alex Drake",
      email: "alex@example.com",
      message: "I would like to talk about a full-stack engineering role.",
    };

    const response = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "203.0.113.10")
      .send(payload);

    expect(response.status).toBe(202);
    expect(response.body.status).toBe("accepted");
    expect(response.body.receiptId).toEqual(expect.any(String));

    const storageContent = await readFile(env.CONTACT_STORAGE_PATH, "utf8");
    const persistedRecord = JSON.parse(storageContent.trim());

    expect(persistedRecord).toMatchObject({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      receiver: env.CONTACT_RECEIVER,
      ip: "203.0.113.10",
    });
    expect(persistedRecord.id).toBe(response.body.receiptId);
  });

  it("sends a notification email when a notifier is configured", async () => {
    const storageDir = await mkdtemp(join(tmpdir(), "layered-matrix-backend-"));
    const env = {
      ...baseEnv,
      CONTACT_STORAGE_PATH: join(storageDir, "contact-submissions.ndjson"),
    } satisfies AppEnv;
    const notifier: ContactNotifier = {
      sendContactNotification: vi.fn(async () => ({
        status: "sent",
        provider: "resend",
        emailId: "email_123",
      })),
    };

    const app = createApp({ env, contactNotifier: notifier });
    const payload = {
      name: "Alex Drake",
      email: "alex@example.com",
      message: "I would like to talk about a full-stack engineering role.",
    };

    const response = await request(app).post("/api/contact").send(payload);

    expect(response.status).toBe(202);
    expect(response.body.delivery).toBe("email_sent");
    expect(response.body.message).toContain("notification email has been sent");
    expect(notifier.sendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        name: payload.name,
        email: payload.email,
        message: payload.message,
      }),
    );
  });

  it("accepts the submission when storage fails but email delivery succeeds", async () => {
    const notifier: ContactNotifier = {
      sendContactNotification: vi.fn(async () => ({
        status: "sent",
        provider: "resend",
        emailId: "email_456",
      })),
    };
    const store: ContactSubmissionStore = {
      append: vi.fn(async () => {
        throw new Error("EACCES: permission denied, mkdir '/var/data'");
      }),
    };
    const app = createApp({
      env: baseEnv,
      contactNotifier: notifier,
      contactStore: store,
    });
    const payload = {
      name: "Alex Drake",
      email: "alex@example.com",
      message: "I would like to talk about a full-stack engineering role.",
    };

    const response = await request(app).post("/api/contact").send(payload);

    expect(response.status).toBe(202);
    expect(response.body.delivery).toBe("email_sent");
    expect(response.body.message).toContain("notification email has been sent");
  });

  it("rate limits repeated contact submissions from the same client", async () => {
    const { app } = await createTestApp({
      CONTACT_RATE_LIMIT_MAX: 1,
      CONTACT_RATE_LIMIT_WINDOW_MS: 60_000,
    });

    const payload = {
      name: "Alex Drake",
      email: "alex@example.com",
      message: "I would like to talk about a full-stack engineering role.",
    };

    await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "198.51.100.25")
      .send(payload);

    const response = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "198.51.100.25")
      .send(payload);

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      status: "error",
      message: "Too many contact submissions. Try again later.",
    });
    expect(response.headers["retry-after"]).toEqual(expect.any(String));
  });

  it("rejects invalid contact submissions", async () => {
    const { app } = await createTestApp();

    const response = await request(app).post("/api/contact").send({
      name: "A",
      email: "alex@example.com",
      message: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Invalid contact submission payload.");
  });
});
