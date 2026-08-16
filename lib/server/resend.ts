/**
 * Express-Führerschein
 * Resend email transport.
 *
 * Uses the Resend REST API directly, so no additional npm package is required.
 * Current verified sender domain: express-fuhrerscheine.de
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendVerificationEmailInput {
  to: string;
  firstName: string;
  code: string;
  expiresInMinutes: number;
}

export interface ResendSendResult {
  id: string;
}

function getResendApiKey(): string {
  const value = process.env.RESEND_API_KEY?.trim();

  if (!value) {
    throw new Error(
      "[Express-Führerschein] RESEND_API_KEY fehlt.",
    );
  }

  return value;
}

function getFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Express-Führerschein <noreply@express-fuhrerscheine.de>"
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function verificationEmailHtml({
  firstName,
  code,
  expiresInMinutes,
}: Omit<SendVerificationEmailInput, "to">): string {
  const safeName = escapeHtml(firstName);
  const safeCode = escapeHtml(code);

  return `
<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#071426;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e1e7ef;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#020914;padding:24px 28px;color:#ffffff;font-size:20px;font-weight:700;">
                Express-Führerschein
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0 0 10px;font-size:16px;">Hallo ${safeName},</p>

                <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;">
                  Bestätige deine E-Mail-Adresse
                </h1>

                <p style="margin:0 0 24px;color:#66758a;font-size:14px;line-height:1.6;">
                  Verwende den folgenden 6-stelligen Code, um deine Registrierung bei Express-Führerschein zu bestätigen.
                </p>

                <div style="margin:0 0 24px;padding:18px;text-align:center;background:#eef6ff;border:1px solid #d7e9ff;border-radius:12px;font-size:34px;letter-spacing:10px;font-weight:800;color:#0878ff;">
                  ${safeCode}
                </div>

                <p style="margin:0;color:#66758a;font-size:13px;line-height:1.6;">
                  Der Code ist ${expiresInMinutes} Minuten gültig. Wenn du diese Registrierung nicht gestartet hast, kannst du diese E-Mail ignorieren.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e8edf3;color:#7a889b;font-size:12px;">
                Express-Führerschein · Schnell. Sicher. Strukturiert.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export async function sendRegistrationVerificationEmail(
  input: SendVerificationEmailInput,
): Promise<ResendSendResult> {
  const response = await fetch(
    RESEND_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getResendApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [input.to],
        subject:
          "Dein Bestätigungscode für Express-Führerschein",
        html: verificationEmailHtml(input),
      }),
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | {
        id?: string;
        message?: string;
        name?: string;
      }
    | null;

  if (!response.ok) {
    const detail =
      payload?.message ??
      payload?.name ??
      `HTTP ${response.status}`;

    throw new Error(
      `[Express-Führerschein] Resend-Fehler: ${detail}`,
    );
  }

  if (!payload?.id) {
    throw new Error(
      "[Express-Führerschein] Resend hat keine E-Mail-ID zurückgegeben.",
    );
  }

  return { id: payload.id };
}
