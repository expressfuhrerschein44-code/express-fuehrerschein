import type {
  CSSProperties,
  ReactElement,
} from "react";

/**
 * Express-Führerschein
 * Registration verification email.
 *
 * - No external email/React package is required.
 * - The component uses inline styles for broad email-client compatibility.
 * - The 6-digit code is the primary verification mechanism.
 * - Do not include secrets or sensitive account data in the email.
 */

export interface RegistrationVerificationEmailProps {
  firstName: string;
  code: string;
  expiresInMinutes?: number;
  siteUrl?: string;
}

const BRAND = {
  name: "Express-Führerschein",
  claim: "Schnell. Sicher. Strukturiert.",
  blue: "#0878FF",
  navy: "#020914",
  text: "#071426",
  muted: "#66758A",
  border: "#E1E7EF",
  surface: "#F4F7FB",
  softBlue: "#EEF6FF",
} as const;

function normalizeVerificationCode(
  value: string,
): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 6);
}

function safeFirstName(
  value: string,
): string {
  const normalized = value
    .trim()
    .replace(/\s+/g, " ");

  return normalized || "dort";
}

export function RegistrationVerificationEmail({
  firstName,
  code,
  expiresInMinutes = 10,
  siteUrl = "https://express-fuhrerscheine.de",
}: RegistrationVerificationEmailProps): ReactElement {
  const verificationCode =
    normalizeVerificationCode(code);

  const recipientName =
    safeFirstName(firstName);

  const expiration =
    Number.isFinite(expiresInMinutes) &&
    expiresInMinutes > 0
      ? Math.floor(expiresInMinutes)
      : 10;

  return (
    <html lang="de">
      <body style={styles.body}>
        <div style={styles.preheader}>
          Dein 6-stelliger Bestätigungscode für Express-Führerschein.
        </div>

        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={styles.outerTable}
        >
          <tbody>
            <tr>
              <td align="center" style={styles.outerCell}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={styles.card}
                >
                  <tbody>
                    <tr>
                      <td style={styles.brandHeader}>
                        <div style={styles.brandName}>
                          <span style={styles.brandExpress}>
                            Express-
                          </span>

                          <span style={styles.brandDrive}>
                            Führerschein
                          </span>
                        </div>

                        <div style={styles.brandClaim}>
                          {BRAND.claim}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={styles.content}>
                        <p style={styles.greeting}>
                          Hallo {recipientName},
                        </p>

                        <h1 style={styles.title}>
                          Bestätige deine E-Mail-Adresse
                        </h1>

                        <p style={styles.paragraph}>
                          Vielen Dank für deine Registrierung bei{" "}
                          <strong>{BRAND.name}</strong>. Gib den folgenden
                          6-stelligen Code auf der Verifizierungsseite ein,
                          um deine Registrierung abzuschließen.
                        </p>

                        <div style={styles.codeSection}>
                          <div style={styles.codeLabel}>
                            Dein Bestätigungscode
                          </div>

                          <div
                            style={styles.code}
                            aria-label={`Bestätigungscode ${verificationCode}`}
                          >
                            {verificationCode}
                          </div>

                          <div style={styles.expiration}>
                            Dieser Code ist {expiration} Minuten gültig.
                          </div>
                        </div>

                        <div style={styles.notice}>
                          <strong style={styles.noticeTitle}>
                            Wichtiger Hinweis
                          </strong>

                          <ul style={styles.noticeList}>
                            <li>
                              Teile diesen Code nicht mit anderen Personen.
                            </li>

                            <li>
                              Express-Führerschein wird dich niemals nach
                              deinem Passwort per E-Mail fragen.
                            </li>

                            <li>
                              Wenn du diese Registrierung nicht gestartet hast,
                              kannst du diese E-Mail ignorieren.
                            </li>
                          </ul>
                        </div>

                        <p style={styles.smallText}>
                          Zur Plattform:{" "}
                          <a
                            href={siteUrl}
                            style={styles.link}
                          >
                            {siteUrl}
                          </a>
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={styles.footer}>
                        <div style={styles.footerBrand}>
                          {BRAND.name}
                        </div>

                        <div style={styles.footerText}>
                          {BRAND.claim}
                        </div>

                        <div style={styles.footerText}>
                          Diese Nachricht wurde automatisch im Rahmen deiner
                          Registrierung versendet.
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={styles.legal}>
                  © {new Date().getFullYear()} {BRAND.name}. Alle Rechte
                  vorbehalten.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/**
 * Plain-text fallback for mail clients that do not render HTML.
 */
export function registrationVerificationEmailText({
  firstName,
  code,
  expiresInMinutes = 10,
  siteUrl = "https://express-fuhrerscheine.de",
}: RegistrationVerificationEmailProps): string {
  const verificationCode =
    normalizeVerificationCode(code);

  const expiration =
    Number.isFinite(expiresInMinutes) &&
    expiresInMinutes > 0
      ? Math.floor(expiresInMinutes)
      : 10;

  return [
    `Hallo ${safeFirstName(firstName)},`,
    "",
    "Bestätige deine E-Mail-Adresse",
    "",
    `Dein Bestätigungscode: ${verificationCode}`,
    "",
    `Dieser Code ist ${expiration} Minuten gültig.`,
    "",
    "Teile diesen Code nicht mit anderen Personen.",
    "Wenn du diese Registrierung nicht gestartet hast, kannst du diese E-Mail ignorieren.",
    "",
    `Express-Führerschein: ${siteUrl}`,
    BRAND.claim,
  ].join("\n");
}

const styles: Record<string, CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: BRAND.surface,
    color: BRAND.text,
    fontFamily:
      'Arial, Helvetica, "Segoe UI", sans-serif',
  },

  preheader: {
    display: "none",
    maxHeight: 0,
    overflow: "hidden",
    opacity: 0,
    color: "transparent",
    lineHeight: "1px",
    fontSize: "1px",
  },

  outerTable: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: BRAND.surface,
  },

  outerCell: {
    padding: "32px 16px",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    borderCollapse: "separate",
    borderSpacing: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    border: `1px solid ${BRAND.border}`,
    borderRadius: "16px",
    boxShadow: "0 12px 36px rgba(7, 20, 38, 0.08)",
  },

  brandHeader: {
    padding: "24px 28px",
    backgroundColor: BRAND.navy,
    textAlign: "center",
  },

  brandName: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "-0.8px",
  },

  brandExpress: {
    color: "#FFFFFF",
  },

  brandDrive: {
    color: BRAND.blue,
  },

  brandClaim: {
    marginTop: "5px",
    color: "rgba(255,255,255,0.62)",
    fontSize: "11px",
    letterSpacing: "0.04em",
  },

  content: {
    padding: "32px 28px 30px",
  },

  greeting: {
    margin: "0 0 10px",
    color: BRAND.text,
    fontSize: "15px",
    lineHeight: 1.6,
  },

  title: {
    margin: "0 0 14px",
    color: BRAND.text,
    fontSize: "26px",
    lineHeight: 1.2,
    letterSpacing: "-0.8px",
  },

  paragraph: {
    margin: "0 0 24px",
    color: BRAND.muted,
    fontSize: "14px",
    lineHeight: 1.65,
  },

  codeSection: {
    margin: "0 0 22px",
    padding: "22px 18px",
    backgroundColor: BRAND.softBlue,
    border: "1px solid #D7E9FF",
    borderRadius: "12px",
    textAlign: "center",
  },

  codeLabel: {
    marginBottom: "7px",
    color: BRAND.text,
    fontSize: "12px",
    fontWeight: 700,
  },

  code: {
    color: BRAND.blue,
    fontSize: "36px",
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "8px",
  },

  expiration: {
    marginTop: "8px",
    color: BRAND.muted,
    fontSize: "12px",
    lineHeight: 1.5,
  },

  notice: {
    margin: "0 0 22px",
    padding: "16px 18px",
    backgroundColor: "#F8FAFC",
    border: `1px solid ${BRAND.border}`,
    borderRadius: "10px",
  },

  noticeTitle: {
    display: "block",
    marginBottom: "7px",
    color: BRAND.blue,
    fontSize: "13px",
  },

  noticeList: {
    margin: 0,
    paddingLeft: "20px",
    color: BRAND.muted,
    fontSize: "12px",
    lineHeight: 1.65,
  },

  smallText: {
    margin: 0,
    color: BRAND.muted,
    fontSize: "12px",
    lineHeight: 1.6,
  },

  link: {
    color: BRAND.blue,
    textDecoration: "none",
  },

  footer: {
    padding: "20px 28px",
    backgroundColor: "#F8FAFC",
    borderTop: `1px solid ${BRAND.border}`,
    textAlign: "center",
  },

  footerBrand: {
    color: BRAND.text,
    fontSize: "12px",
    fontWeight: 700,
  },

  footerText: {
    marginTop: "4px",
    color: "#7A889B",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  legal: {
    margin: "16px 0 0",
    color: "#8A97A8",
    fontSize: "10px",
    lineHeight: 1.5,
    textAlign: "center",
  },
};

export default RegistrationVerificationEmail;
