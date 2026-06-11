import type { EmailProviderSendVerificationRequestParams } from "@auth/core/providers/email";

export async function sendVerificationRequest({
  identifier: email,
  url,
}: EmailProviderSendVerificationRequestParams) {
  // Replace with your HTTP email provider (Resend, SendGrid, etc.) in production.
  console.log(`[auth] Sign-in link for ${email}: ${url}`);
}
