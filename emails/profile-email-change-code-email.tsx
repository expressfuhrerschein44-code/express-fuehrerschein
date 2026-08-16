/**
 * Express-Führerschein
 * Profile e-mail change verification e-mail.
 *
 * Goals:
 * - no Prisma dependency;
 * - no react-dom/server dependency;
 * - no @react-email dependency;
 * - compatible with Resend through a ready-to-send HTML/text builder;
 * - safe escaping for all dynamic values;
 * - German production copy matching the Profile workflow.
 */

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface ProfileEmailChangeCodeEmailProps {
  firstName:
    string;

  code:
    string;

  expiresInMinutes:
    number;

  supportEmail?:
    string;
}

export interface ProfileEmailChangeCodeEmailPayload {
  subject:
    string;

  html:
    string;

  text:
    string;
}

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

export const PROFILE_EMAIL_CHANGE_SUBJECT =
  "Bestätige deine neue E-Mail-Adresse";

const DEFAULT_SUPPORT_EMAIL =
  "support@express-fuhrerscheine.de";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function escapeHtml(
  value:
    string,
): string {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

function normalizeFirstName(
  value:
    string,
): string {
  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " ",
      )
      .slice(
        0,
        80,
      );

  return normalized ||
    "Fahrschüler";
}

function normalizeCode(
  value:
    string,
): string {
  const normalized =
    value
      .replace(
        /\D/g,
        "",
      )
      .slice(
        0,
        6,
      );

  if (
    !/^\d{6}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      "[Express-Führerschein] Profile e-mail change code must contain exactly 6 digits.",
    );
  }

  return normalized;
}

function normalizeExpiryMinutes(
  value:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 10;
  }

  return Math.max(
    1,
    Math.min(
      60,
      Math.round(
        value,
      ),
    ),
  );
}

function normalizeSupportEmail(
  value:
    string | undefined,
): string {
  const normalized =
    value
      ?.trim()
      .toLowerCase();

  if (
    normalized &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalized,
    )
  ) {
    return normalized;
  }

  return DEFAULT_SUPPORT_EMAIL;
}

/* ==========================================================================
   REACT E-MAIL COMPONENT
   ========================================================================== */

/**
 * Optional JSX representation.
 *
 * This component is useful if the project later adopts a React-email renderer.
 * The production Resend route can already use buildProfileEmailChangeCodeEmail()
 * below without adding another dependency.
 */
export function ProfileEmailChangeCodeEmail({
  firstName,
  code,
  expiresInMinutes,
  supportEmail,
}: ProfileEmailChangeCodeEmailProps) {
  const safeFirstName =
    normalizeFirstName(
      firstName,
    );

  const safeCode =
    normalizeCode(
      code,
    );

  const safeExpiry =
    normalizeExpiryMinutes(
      expiresInMinutes,
    );

  const safeSupportEmail =
    normalizeSupportEmail(
      supportEmail,
    );

  return (
    <html
      lang="de"
    >
      <body
        style={{
          margin:
            0,

          padding:
            0,

          backgroundColor:
            "#f4f7fb",

          fontFamily:
            "Arial, Helvetica, sans-serif",

          color:
            "#111c2b",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            backgroundColor:
              "#f4f7fb",

            padding:
              "32px 16px",
          }}
        >
          <tbody>
            <tr>
              <td
                align="center"
              >
                <table
                  role="presentation"
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    maxWidth:
                      "600px",

                    backgroundColor:
                      "#ffffff",

                    border:
                      "1px solid #e3e8ef",

                    borderRadius:
                      "18px",

                    overflow:
                      "hidden",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding:
                            "24px 28px",

                          background:
                            "linear-gradient(135deg,#031426 0%,#07315a 100%)",

                          color:
                            "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "22px",

                            fontWeight:
                              800,

                            letterSpacing:
                              "-0.4px",
                          }}
                        >
                          Express-Führerschein
                        </div>

                        <div
                          style={{
                            marginTop:
                              "6px",

                            fontSize:
                              "12px",

                            color:
                              "#bfd7f4",
                          }}
                        >
                          Sicher zu deinem Führerschein.
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding:
                            "32px 28px 12px",
                        }}
                      >
                        <h1
                          style={{
                            margin:
                              0,

                            fontSize:
                              "24px",

                            lineHeight:
                              1.3,

                            letterSpacing:
                              "-0.4px",
                          }}
                        >
                          Neue E-Mail-Adresse bestätigen
                        </h1>

                        <p
                          style={{
                            margin:
                              "18px 0 0",

                            fontSize:
                              "15px",

                            lineHeight:
                              1.7,

                            color:
                              "#45556a",
                          }}
                        >
                          Hallo{" "}
                          <strong>
                            {safeFirstName}
                          </strong>
                          ,
                        </p>

                        <p
                          style={{
                            margin:
                              "12px 0 0",

                            fontSize:
                              "15px",

                            lineHeight:
                              1.7,

                            color:
                              "#45556a",
                          }}
                        >
                          verwende den folgenden Sicherheitscode, um deine neue
                          E-Mail-Adresse bei Express-Führerschein zu bestätigen.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding:
                            "16px 28px",
                        }}
                      >
                        <div
                          style={{
                            border:
                              "1px solid #d7e8ff",

                            backgroundColor:
                              "#eef5ff",

                            borderRadius:
                              "14px",

                            padding:
                              "20px",

                            textAlign:
                              "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "12px",

                              fontWeight:
                                700,

                              color:
                                "#52657d",

                              marginBottom:
                                "10px",
                            }}
                          >
                            Sicherheitscode
                          </div>

                          <div
                            style={{
                              fontSize:
                                "36px",

                              lineHeight:
                                1,

                              fontWeight:
                                900,

                              letterSpacing:
                                "10px",

                              color:
                                "#0878ff",
                            }}
                          >
                            {safeCode}
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding:
                            "6px 28px 28px",
                        }}
                      >
                        <p
                          style={{
                            margin:
                              0,

                            fontSize:
                              "13px",

                            lineHeight:
                              1.7,

                            color:
                              "#5f6f82",
                          }}
                        >
                          Der Code ist{" "}
                          <strong>
                            {safeExpiry} Minuten
                          </strong>{" "}
                          gültig und kann nur für diese E-Mail-Änderung verwendet
                          werden.
                        </p>

                        <div
                          style={{
                            marginTop:
                              "20px",

                            padding:
                              "14px 16px",

                            borderRadius:
                              "12px",

                            backgroundColor:
                              "#fff8e8",

                            border:
                              "1px solid #f4dfab",
                          }}
                        >
                          <p
                            style={{
                              margin:
                                0,

                              fontSize:
                                "12px",

                              lineHeight:
                                1.7,

                              color:
                                "#775d20",
                            }}
                          >
                            <strong>
                              Du hast diese Änderung nicht angefordert?
                            </strong>{" "}
                            Dann ignoriere diese E-Mail. Deine bisherige
                            E-Mail-Adresse bleibt unverändert.
                          </p>
                        </div>

                        <p
                          style={{
                            margin:
                              "22px 0 0",

                            fontSize:
                              "12px",

                            lineHeight:
                              1.7,

                            color:
                              "#7a899a",
                          }}
                        >
                          Express-Führerschein wird dich niemals per E-Mail nach
                          deinem Passwort oder deinem vollständigen
                          Sicherheitscode für einen anderen Zweck fragen.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding:
                            "20px 28px",

                          borderTop:
                            "1px solid #edf1f5",

                          backgroundColor:
                            "#fafbfd",
                        }}
                      >
                        <p
                          style={{
                            margin:
                              0,

                            fontSize:
                              "11px",

                            lineHeight:
                              1.7,

                            color:
                              "#8290a0",
                          }}
                        >
                          Hilfe benötigt? Kontaktiere uns unter{" "}
                          <a
                            href={`mailto:${safeSupportEmail}`}
                            style={{
                              color:
                                "#0878ff",

                              textDecoration:
                                "none",

                              fontWeight:
                                700,
                            }}
                          >
                            {safeSupportEmail}
                          </a>
                          .
                        </p>

                        <p
                          style={{
                            margin:
                              "8px 0 0",

                            fontSize:
                              "10px",

                            lineHeight:
                              1.6,

                            color:
                              "#99a4b2",
                          }}
                        >
                          © Express-Führerschein. Diese Nachricht wurde
                          automatisch im Rahmen einer sicherheitsrelevanten
                          Kontoaktion versendet.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/* ==========================================================================
   PRODUCTION HTML RENDERER
   ========================================================================== */

export function renderProfileEmailChangeCodeEmailHtml(
  props:
    ProfileEmailChangeCodeEmailProps,
): string {
  const firstName =
    escapeHtml(
      normalizeFirstName(
        props.firstName,
      ),
    );

  const code =
    escapeHtml(
      normalizeCode(
        props.code,
      ),
    );

  const expiresInMinutes =
    normalizeExpiryMinutes(
      props.expiresInMinutes,
    );

  const supportEmail =
    escapeHtml(
      normalizeSupportEmail(
        props.supportEmail,
      ),
    );

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${PROFILE_EMAIL_CHANGE_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111c2b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e3e8ef;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:#031426;color:#ffffff;">
              <div style="font-size:22px;font-weight:800;letter-spacing:-0.4px;">Express-Führerschein</div>
              <div style="margin-top:6px;font-size:12px;color:#bfd7f4;">Sicher zu deinem Führerschein.</div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 28px 12px;">
              <h1 style="margin:0;font-size:24px;line-height:1.3;letter-spacing:-0.4px;">Neue E-Mail-Adresse bestätigen</h1>

              <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#45556a;">
                Hallo <strong>${firstName}</strong>,
              </p>

              <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#45556a;">
                verwende den folgenden Sicherheitscode, um deine neue E-Mail-Adresse bei Express-Führerschein zu bestätigen.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 28px;">
              <div style="border:1px solid #d7e8ff;background:#eef5ff;border-radius:14px;padding:20px;text-align:center;">
                <div style="font-size:12px;font-weight:700;color:#52657d;margin-bottom:10px;">Sicherheitscode</div>
                <div style="font-size:36px;line-height:1;font-weight:900;letter-spacing:10px;color:#0878ff;">${code}</div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:6px 28px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#5f6f82;">
                Der Code ist <strong>${expiresInMinutes} Minuten</strong> gültig und kann nur für diese E-Mail-Änderung verwendet werden.
              </p>

              <div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:#fff8e8;border:1px solid #f4dfab;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#775d20;">
                  <strong>Du hast diese Änderung nicht angefordert?</strong>
                  Dann ignoriere diese E-Mail. Deine bisherige E-Mail-Adresse bleibt unverändert.
                </p>
              </div>

              <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#7a899a;">
                Express-Führerschein wird dich niemals per E-Mail nach deinem Passwort oder deinem vollständigen Sicherheitscode für einen anderen Zweck fragen.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px;border-top:1px solid #edf1f5;background:#fafbfd;">
              <p style="margin:0;font-size:11px;line-height:1.7;color:#8290a0;">
                Hilfe benötigt? Kontaktiere uns unter
                <a href="mailto:${supportEmail}" style="color:#0878ff;text-decoration:none;font-weight:700;">${supportEmail}</a>.
              </p>

              <p style="margin:8px 0 0;font-size:10px;line-height:1.6;color:#99a4b2;">
                © Express-Führerschein. Diese Nachricht wurde automatisch im Rahmen einer sicherheitsrelevanten Kontoaktion versendet.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ==========================================================================
   TEXT FALLBACK
   ========================================================================== */

export function renderProfileEmailChangeCodeEmailText(
  props:
    ProfileEmailChangeCodeEmailProps,
): string {
  const firstName =
    normalizeFirstName(
      props.firstName,
    );

  const code =
    normalizeCode(
      props.code,
    );

  const expiresInMinutes =
    normalizeExpiryMinutes(
      props.expiresInMinutes,
    );

  const supportEmail =
    normalizeSupportEmail(
      props.supportEmail,
    );

  return [
    "Express-Führerschein",
    "",
    "Neue E-Mail-Adresse bestätigen",
    "",
    `Hallo ${firstName},`,
    "",
    "verwende den folgenden Sicherheitscode, um deine neue E-Mail-Adresse bei Express-Führerschein zu bestätigen:",
    "",
    code,
    "",
    `Der Code ist ${expiresInMinutes} Minuten gültig und kann nur für diese E-Mail-Änderung verwendet werden.`,
    "",
    "Du hast diese Änderung nicht angefordert?",
    "Dann ignoriere diese E-Mail. Deine bisherige E-Mail-Adresse bleibt unverändert.",
    "",
    "Express-Führerschein wird dich niemals per E-Mail nach deinem Passwort oder deinem vollständigen Sicherheitscode für einen anderen Zweck fragen.",
    "",
    `Hilfe: ${supportEmail}`,
  ].join(
    "\n",
  );
}

/* ==========================================================================
   RESEND-READY BUILDER
   ========================================================================== */

export function buildProfileEmailChangeCodeEmail(
  props:
    ProfileEmailChangeCodeEmailProps,
): ProfileEmailChangeCodeEmailPayload {
  return {
    subject:
      PROFILE_EMAIL_CHANGE_SUBJECT,

    html:
      renderProfileEmailChangeCodeEmailHtml(
        props,
      ),

    text:
      renderProfileEmailChangeCodeEmailText(
        props,
      ),
  };
}
