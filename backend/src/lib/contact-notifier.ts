import { Resend } from "resend";

import type { ContactSubmissionRecord } from "./contact-store.js";
import type { AppLogger } from "./logging.js";

export type ContactNotificationResult =
  | { status: "disabled" }
  | { status: "sent"; provider: "resend"; emailId?: string }
  | { status: "failed"; provider: "resend"; error: string };

export type ContactNotifier = {
  sendContactNotification(submission: ContactSubmissionRecord): Promise<ContactNotificationResult>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSubject(prefix: string, submission: ContactSubmissionRecord) {
  return `${prefix} ${submission.name} <${submission.email}>`;
}

function formatTextBody(submission: ContactSubmissionRecord) {
  return [
    "New portfolio contact submission",
    "",
    `Receipt ID: ${submission.id}`,
    `Received At: ${submission.receivedAt}`,
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Reply-To: ${submission.email}`,
    `Origin: ${submission.origin ?? "Unknown"}`,
    `IP: ${submission.ip ?? "Unknown"}`,
    `User Agent: ${submission.userAgent ?? "Unknown"}`,
    "",
    "Message:",
    submission.message,
  ].join("\n");
}

function formatHtmlBody(submission: ContactSubmissionRecord) {
  return `
    <div style="background:#f5f5f5;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;padding:32px;">
        <h1 style="margin:0 0 24px;font-size:24px;line-height:1.25;">New portfolio contact submission</h1>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tbody>
            <tr><td style="padding:8px 0;font-weight:700;">Receipt ID</td><td style="padding:8px 0;">${escapeHtml(submission.id)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Received At</td><td style="padding:8px 0;">${escapeHtml(submission.receivedAt)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Name</td><td style="padding:8px 0;">${escapeHtml(submission.name)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">Origin</td><td style="padding:8px 0;">${escapeHtml(submission.origin ?? "Unknown")}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700;">IP</td><td style="padding:8px 0;">${escapeHtml(submission.ip ?? "Unknown")}</td></tr>
          </tbody>
        </table>
        <h2 style="margin:0 0 12px;font-size:16px;">Message</h2>
        <div style="white-space:pre-wrap;line-height:1.6;border:1px solid #e5e7eb;padding:16px;background:#fafafa;">${escapeHtml(submission.message)}</div>
      </div>
    </div>
  `.trim();
}

export function createDisabledContactNotifier(): ContactNotifier {
  return {
    async sendContactNotification() {
      return { status: "disabled" };
    },
  };
}

export function createResendContactNotifier({
  apiKey,
  from,
  to,
  subjectPrefix,
  logger,
}: {
  apiKey: string;
  from: string;
  to: string;
  subjectPrefix: string;
  logger: AppLogger;
}): ContactNotifier {
  const resend = new Resend(apiKey);

  return {
    async sendContactNotification(submission) {
      try {
        const { data, error } = await resend.emails.send(
          {
            from,
            to,
            replyTo: submission.email,
            subject: formatSubject(subjectPrefix, submission),
            text: formatTextBody(submission),
            html: formatHtmlBody(submission),
            tags: [
              { name: "source", value: "portfolio-contact" },
              { name: "receiptId", value: submission.id },
            ],
          },
          {
            idempotencyKey: `portfolio-contact-${submission.id}`,
          },
        );

        if (error) {
          return {
            status: "failed",
            provider: "resend",
            error: error.message,
          };
        }

        return {
          status: "sent",
          provider: "resend",
          emailId: data?.id,
        };
      } catch (error) {
        logger.error("[contact] resend notification threw", {
          receiptId: submission.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        return {
          status: "failed",
          provider: "resend",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  };
}
