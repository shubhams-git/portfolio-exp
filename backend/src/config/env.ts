import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function optionalStringSchema() {
  return z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    });
}

export function normalizeOrigin(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Origin value cannot be empty.");
  }

  const normalizedValue = trimmed.replace(/\/+$/, "");
  const parsed = new URL(normalizedValue);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Origin must use http or https: ${value}`);
  }

  return parsed.origin;
}

function parseBooleanString(value: string) {
  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean environment value: ${value}`);
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .transform((origins) => origins.map((origin) => normalizeOrigin(origin)))
    .refine((origins) => origins.length > 0, {
      message: "At least one allowed origin must be configured.",
    }),
  CONTACT_RECEIVER: z.email().default("hello@example.com"),
  RESEND_API_KEY: optionalStringSchema(),
  CONTACT_EMAIL_FROM: optionalStringSchema(),
  CONTACT_EMAIL_SUBJECT_PREFIX: z.string().trim().default("[Portfolio Contact]"),
  CONTACT_STORAGE_PATH: z.string().trim().min(1).default("data/contact-submissions.ndjson"),
  CONTACT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  TRUST_PROXY: z
    .string()
    .default("true")
    .transform((value) => parseBooleanString(value)),
  /** When true, allow browser requests from https://*.vercel.app (preview and production project URLs). */
  CORS_ALLOW_VERCEL_PREVIEW: z
    .string()
    .default("false")
    .transform((value) => parseBooleanString(value)),
}).superRefine((value, context) => {
  if (value.RESEND_API_KEY && !value.CONTACT_EMAIL_FROM) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["CONTACT_EMAIL_FROM"],
      message: "CONTACT_EMAIL_FROM is required when RESEND_API_KEY is set.",
    });
  }

  if (value.CONTACT_EMAIL_FROM && !value.RESEND_API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RESEND_API_KEY"],
      message: "RESEND_API_KEY is required when CONTACT_EMAIL_FROM is set.",
    });
  }
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(rawEnv: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(rawEnv);
}

export const env = loadEnv();
