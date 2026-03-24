import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import type { AppEnv } from "../src/config/env.js";

const baseEnv: AppEnv = {
  PORT: 8000,
  ALLOWED_ORIGINS: ["http://localhost:5173"],
  CONTACT_RECEIVER: "hello@example.com",
  CONTACT_STORAGE_PATH: "data/contact-submissions.ndjson",
  CONTACT_RATE_LIMIT_WINDOW_MS: 60_000,
  CONTACT_RATE_LIMIT_MAX: 2,
  TRUST_PROXY: true,
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
