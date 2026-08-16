/**
 * Express-Führerschein
 * Password reset verification e-mail.
 *
 * IMPORTANT:
 * This module deliberately renders an HTML string itself.
 *
 * Why:
 * Next.js App Router Route Handlers must not import react-dom/server.
 * The Resend REST API accepts HTML directly, so keeping the renderer here
 * avoids react-dom/server while preserving a centralized e-mail template.
 */

export interface PasswordResetCodeEmailProps {
  firstName?: string | null;
  code: string;
  expiresInMinutes?: number;
  verificationUrl?: string;
  supportEmail?: string;
}

function escapeHtml(
  value: string,
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeCode(
  value: string,
): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 6);
}

function normalizeExpiration(
  value: number | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 10;
  }

  return Math.max(
    1,
    Math.floor(value),
  );
}

function normalizeOptionalUrl(
  value: string | undefined,
): string | null {
  const candidate =
    value?.trim();

  if (!candidate) {
    return null;
  }

  try {
    const url =
      new URL(candidate);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function renderPasswordResetCodeEmailHtml({
  firstName,
  code,
  expiresInMinutes = 10,
  verificationUrl,
  supportEmail =
    "support@express-fuhrerscheine.de",
}: PasswordResetCodeEmailProps): string {
  const safeName =
    escapeHtml(
      firstName?.trim() || "",
    );

  const safeCode =
    escapeHtml(
      normalizeCode(code),
    );

  const safeSupportEmail =
    escapeHtml(
      supportEmail.trim(),
    );

  const expires =
    normalizeExpiration(
      expiresInMinutes,
    );

  const safeVerificationUrl =
    normalizeOptionalUrl(
      verificationUrl,
    );

  const greeting =
    safeName
      ? `Hallo ${safeName},`
      : "Hallo,";

  const actionButton =
    safeVerificationUrl
      ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 0;">
          <tr>
            <td align="center">
              <a href="${escapeHtml(safeVerificationUrl)}" style="display:inline-block;min-width:220px;padding:14px 22px;border-radius:9px;background:#0878ff;color:#ffffff;text-decoration:none;font-size:14px;line-height:1.4;font-weight:700;text-align:center;">
                Passwort zurücksetzen
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Passwort zurücksetzen · Express-Führerschein</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172233;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f3f6fa;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e4eaf1;border-radius:16px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:24px 28px;background:#030b17;">
                <div style="font-size:22px;line-height:1.2;font-weight:800;letter-spacing:-0.4px;">
                  <span style="color:#1687ff;">Express-</span><span style="color:#ffffff;">Führerschein</span>
                </div>
                <div style="margin-top:6px;color:#91a4ba;font-size:12px;font-weight:500;">Schnell. Sicher. Strukturiert.</div>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 28px 28px;">
                <h1 style="margin:0 0 24px;color:#071426;font-size:25px;line-height:1.25;font-weight:800;text-align:center;letter-spacing:-0.4px;">
                  Passwort zurücksetzen
                </h1>

                <p style="margin:0 0 14px;color:#172233;font-size:15px;line-height:1.65;font-weight:600;">
                  ${greeting}
                </p>

                <p style="margin:0 0 14px;color:#4a5a6e;font-size:15px;line-height:1.7;">
                  wir haben eine Anfrage erhalten, das Passwort für dein <strong>Express-Führerschein</strong>-Konto zurückzusetzen.
                </p>

                <p style="margin:0 0 14px;color:#4a5a6e;font-size:15px;line-height:1.7;">
                  Verwende den folgenden Sicherheitscode, um deine Anfrage zu bestätigen:
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;background:#f7fafd;border:1px solid #dde7f1;border-radius:14px;">
                  <tr>
                    <td align="center" style="padding:22px;">
                      <div style="margin-bottom:12px;color:#718096;font-size:11px;font-weight:700;letter-spacing:1.2px;">DEIN SICHERHEITSCODE</div>
                      <div style="padding:16px 12px;border:1px dashed #1687ff;border-radius:10px;background:#ffffff;color:#0878ff;font-size:34px;line-height:1.2;font-weight:800;letter-spacing:8px;text-align:center;">
                        ${safeCode}
                      </div>
                      <div style="margin-top:13px;color:#53657a;font-size:13px;line-height:1.5;font-weight:600;">
                        Dieser Sicherheitscode ist ${expires} Minuten gültig.
                      </div>
                    </td>
                  </tr>
                </table>

                ${actionButton}

                <div style="margin-top:24px;padding:17px 18px;border:1px solid #d5e9ff;border-radius:11px;background:#f0f7ff;">
                  <div style="margin:0 0 7px;color:#0b4f94;font-size:13px;line-height:1.5;font-weight:700;">Wichtiger Sicherheitshinweis</div>
                  <p style="margin:0;color:#49657f;font-size:13px;line-height:1.65;">
                    Gib diesen Code niemals an andere Personen weiter. Express-Führerschein wird dich niemals telefonisch, per Chat oder per E-Mail nach diesem Sicherheitscode fragen.
                  </p>
                </div>

                <p style="margin:22px 0 0;color:#718096;font-size:13px;line-height:1.65;">
                  Wenn du diese Passwortänderung nicht angefordert hast, kannst du diese E-Mail ignorieren. Dein bestehendes Passwort bleibt unverändert.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:24px 28px;background:#f8fafc;border-top:1px solid #e4eaf1;">
                <div style="color:#071426;font-size:14px;line-height:1.5;font-weight:800;">Express-Führerschein</div>
                <div style="margin-top:3px;color:#718096;font-size:12px;">Dein Weg zum Führerschein.</div>
                <div style="width:40px;height:1px;margin:17px auto;background:#dce4ed;"></div>
                <div style="color:#718096;font-size:12px;line-height:1.5;">Bei Fragen sind wir für dich da:</div>
                <div style="margin-top:3px;color:#0878ff;font-size:12px;line-height:1.5;font-weight:600;">${safeSupportEmail}</div>
                <div style="margin-top:17px;color:#9aa8b8;font-size:11px;line-height:1.5;">Diese E-Mail enthält sicherheitsrelevante Informationen.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Default export kept for compatibility with earlier imports.
 *
 * Do not render this function through react-dom/server inside Next.js
 * Route Handlers. Use renderPasswordResetCodeEmailHtml() instead.
 */
export default function PasswordResetCodeEmail(
  props: PasswordResetCodeEmailProps,
): string {
  return renderPasswordResetCodeEmailHtml(
    props,
  );
}
