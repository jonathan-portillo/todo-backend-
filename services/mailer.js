// Sends email through Resend's HTTP API. With no RESEND_API_KEY (local development)
// the message is printed to the console instead, so the flow can be tried without it.
const FROM = process.env.MAIL_FROM || "Task Note <onboarding@resend.dev>";

const appUrl = () =>
  (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");

async function sendMail({ to, subject, text }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n--- email (not sent: no RESEND_API_KEY) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n---\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend rejected the email (${res.status}): ${detail}`);
  }
}

// each returns a promise; callers decide whether a failure matters
const sendVerifyEmail = (to, username, token) =>
  module.exports.sendMail({
    to,
    subject: "Confirm your email for Task Note",
    text: `Hi ${username},\n\nConfirm this email address for your Task Note account:\n\n${appUrl()}/verify-email?token=${token}\n\nThe link works for 24 hours. If you didn't ask for this, you can ignore this email.`,
  });

const sendResetEmail = (to, username, token) =>
  module.exports.sendMail({
    to,
    subject: "Reset your Task Note password",
    text: `Hi ${username},\n\nSomeone asked to reset the password for your Task Note account. If that was you, choose a new password here:\n\n${appUrl()}/reset-password?token=${token}\n\nThe link works for one hour and only once. If you didn't ask for this, you can ignore this email and your password stays the same.`,
  });

module.exports = { sendMail, sendVerifyEmail, sendResetEmail };
