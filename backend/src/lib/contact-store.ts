import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export type ContactSubmissionRecord = {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  message: string;
  receiver: string;
  ip: string | null;
  userAgent: string | null;
  origin: string | null;
};

export type ContactSubmissionInput = Omit<
  ContactSubmissionRecord,
  "id" | "receivedAt"
>;

export type ContactSubmissionStore = {
  append(submission: ContactSubmissionRecord): Promise<void>;
};

export function createNdjsonContactSubmissionStore(storagePath: string): ContactSubmissionStore {
  const resolvedStoragePath = resolve(storagePath);

  return {
    async append(submission) {
      await mkdir(dirname(resolvedStoragePath), { recursive: true });
      await appendFile(
        resolvedStoragePath,
        `${JSON.stringify(submission)}\n`,
        "utf8",
      );
    },
  };
}

export function createContactSubmissionRecord({
  input,
  receiver,
  ip,
  userAgent,
  origin,
  receivedAt = new Date().toISOString(),
}: {
  input: Omit<ContactSubmissionInput, "receiver" | "ip" | "userAgent" | "origin">;
  receiver: string;
  ip: string | null;
  userAgent: string | null;
  origin: string | null;
  receivedAt?: string;
}): ContactSubmissionRecord {
  return {
    id: randomUUID(),
    receivedAt,
    ...input,
    receiver,
    ip,
    userAgent,
    origin,
  };
}
