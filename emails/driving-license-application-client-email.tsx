/**
 * Express-Führerschein
 * Client confirmation e-mail for a submitted driving-license application.
 *
 * Notes:
 * - no sensitive document is attached or embedded;
 * - all financial values are integer cents;
 * - this template has no dependency on react-email or lucide-react;
 * - React escapes all dynamic values rendered in JSX.
 */

import type {
  DrivingLicenseApplication,
  DrivingLicenseClassCode,
} from "@/types/driving-license-application";

import {
  DRIVING_LICENSE_CLASSES,
} from "@/data/driving-license-application";

export interface DrivingLicenseApplicationClientEmailProps {
  firstName:
    string;

  application:
    DrivingLicenseApplication;

  dashboardUrl?:
    string | null;
}

export const DRIVING_LICENSE_APPLICATION_CLIENT_EMAIL_SUBJECT =
  "Deine Führerscheinanfrage wurde erfolgreich übermittelt";

function formatMoney(
  cents:
    number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  ).format(
    cents /
    100,
  );
}

function getClassLabel(
  code:
    DrivingLicenseClassCode,
): string {
  return (
    DRIVING_LICENSE_CLASSES.find(
      (
        item,
      ) =>
        item.code ===
        code,
    )
      ?.label ??
    code
  );
}

function getClassLabels(
  codes:
    readonly DrivingLicenseClassCode[],
): string {
  return codes
    .map(
      getClassLabel,
    )
    .join(
      ", ",
    );
}

function formatSubmittedAt(
  value:
    string | null,
): string {
  if (
    !value
  ) {
    return "—";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    date,
  );
}

export function createDrivingLicenseApplicationClientEmailText({
  firstName,

  application,

  dashboardUrl,
}: DrivingLicenseApplicationClientEmailProps): string {
  const classes =
    getClassLabels(
      application
        .selectedClasses,
    );

  return [
    "Express-Führerschein",
    "",
    `Hallo ${firstName},`,
    "",
    "wir haben deine Führerscheinanfrage erfolgreich erhalten.",
    "",
    `Führerscheinklasse(n): ${classes}`,
    `Zwischensumme: ${formatMoney(application.pricing.classesSubtotalCents)}`,
    `Bearbeitungsgebühr: ${formatMoney(application.pricing.processingFeeCents)}`,
    `Gesamtbetrag: ${formatMoney(application.pricing.totalCents)}`,
    `Status: Eingereicht`,
    `Übermittelt am: ${formatSubmittedAt(application.submittedAt)}`,
    "",
    "Deine Dokumente und deine Unterschrift wurden sicher übermittelt.",
    "Aus Sicherheitsgründen enthält diese E-Mail keine Kopien deiner Dokumente.",
    "",
    dashboardUrl
      ? `Persönlicher Bereich: ${dashboardUrl}`
      : "Den aktuellen Status findest du jederzeit in deinem persönlichen Bereich.",
    "",
    "Express-Führerschein",
  ].join(
    "\n",
  );
}

export function DrivingLicenseApplicationClientEmail({
  firstName,

  application,

  dashboardUrl,
}: DrivingLicenseApplicationClientEmailProps) {
  const classes =
    getClassLabels(
      application
        .selectedClasses,
    );

  return (
    <html lang="de">

      <body
        style={{
          margin:
            0,

          padding:
            0,

          backgroundColor:
            "#F4F7FB",

          color:
            "#122039",

          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            width:
              "100%",

            backgroundColor:
              "#F4F7FB",
          }}
        >
          <tbody>
            <tr>
              <td
                align="center"
                style={{
                  padding:
                    "32px 16px",
                }}
              >
                <table
                  role="presentation"
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    width:
                      "100%",

                    maxWidth:
                      620,

                    overflow:
                      "hidden",

                    border:
                      "1px solid #E1E7EF",

                    borderRadius:
                      18,

                    backgroundColor:
                      "#FFFFFF",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding:
                            "24px 28px",

                          backgroundColor:
                            "#061427",

                          color:
                            "#FFFFFF",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              22,

                            fontWeight:
                              800,

                            lineHeight:
                              "28px",
                          }}
                        >
                          Express-Führerschein
                        </div>

                        <div
                          style={{
                            marginTop:
                              6,

                            fontSize:
                              12,

                            lineHeight:
                              "18px",

                            color:
                              "#BCD4F1",
                          }}
                        >
                          Schnell. Sicher. Professionell.
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding:
                            "30px 28px",
                        }}
                      >
                        <div
                          style={{
                            width:
                              48,

                            height:
                              48,

                            borderRadius:
                              999,

                            backgroundColor:
                              "#E9F8EF",

                            color:
                              "#14935A",

                            textAlign:
                              "center",

                            fontSize:
                              25,

                            fontWeight:
                              800,

                            lineHeight:
                              "48px",
                          }}
                        >
                          ✓
                        </div>

                        <h1
                          style={{
                            margin:
                              "18px 0 0",

                            fontSize:
                              23,

                            lineHeight:
                              "30px",

                            fontWeight:
                              800,

                            color:
                              "#122039",
                          }}
                        >
                          Anfrage erfolgreich übermittelt
                        </h1>

                        <p
                          style={{
                            margin:
                              "18px 0 0",

                            fontSize:
                              14,

                            lineHeight:
                              "23px",

                            color:
                              "#506176",
                          }}
                        >
                          Hallo{" "}
                          <strong>
                            {
                              firstName
                            }
                          </strong>
                          ,
                        </p>

                        <p
                          style={{
                            margin:
                              "10px 0 0",

                            fontSize:
                              14,

                            lineHeight:
                              "23px",

                            color:
                              "#506176",
                          }}
                        >
                          wir haben deine Führerscheinanfrage erfolgreich erhalten.
                          Deine Angaben werden nun von unserem Team geprüft.
                        </p>

                        <table
                          role="presentation"
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            width:
                              "100%",

                            marginTop:
                              22,

                            borderRadius:
                              14,

                            backgroundColor:
                              "#F7F9FC",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding:
                                    "18px 18px 8px",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Führerscheinklasse(n)
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "18px 18px 8px",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    800,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  classes
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "8px 18px",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Zwischensumme
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "8px 18px",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  formatMoney(
                                    application
                                      .pricing
                                      .classesSubtotalCents,
                                  )
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "8px 18px",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Bearbeitungsgebühr
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "8px 18px",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  formatMoney(
                                    application
                                      .pricing
                                      .processingFeeCents,
                                  )
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "12px 18px 18px",

                                  borderTop:
                                    "1px solid #E4EAF1",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    800,

                                  color:
                                    "#0B63F6",
                                }}
                              >
                                Gesamtbetrag
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "12px 18px 18px",

                                  borderTop:
                                    "1px solid #E4EAF1",

                                  fontSize:
                                    18,

                                  fontWeight:
                                    900,

                                  color:
                                    "#0B63F6",
                                }}
                              >
                                {
                                  formatMoney(
                                    application
                                      .pricing
                                      .totalCents,
                                  )
                                }
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table
                          role="presentation"
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{
                            width:
                              "100%",

                            marginTop:
                              16,

                            border:
                              "1px solid #DCE9FF",

                            borderRadius:
                              12,

                            backgroundColor:
                              "#F6FAFF",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding:
                                    14,

                                  fontSize:
                                    12,

                                  lineHeight:
                                    "20px",

                                  color:
                                    "#3A5069",
                                }}
                              >
                                <strong>
                                  Status:
                                </strong>{" "}
                                Eingereicht
                                <br />

                                <strong>
                                  Übermittelt:
                                </strong>{" "}
                                {
                                  formatSubmittedAt(
                                    application
                                      .submittedAt,
                                  )
                                }
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p
                          style={{
                            margin:
                              "18px 0 0",

                            fontSize:
                              13,

                            lineHeight:
                              "22px",

                            color:
                              "#506176",
                          }}
                        >
                          Deine Dokumente und deine Unterschrift wurden sicher
                          übermittelt. Falls wir weitere Informationen benötigen,
                          kontaktieren wir dich.
                        </p>

                        {dashboardUrl ? (
                          <table
                            role="presentation"
                            cellPadding="0"
                            cellSpacing="0"
                            style={{
                              marginTop:
                                24,
                            }}
                          >
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    borderRadius:
                                      10,

                                    backgroundColor:
                                      "#0B63F6",
                                  }}
                                >
                                  <a
                                    href={
                                      dashboardUrl
                                    }
                                    style={{
                                      display:
                                        "inline-block",

                                      padding:
                                        "12px 18px",

                                      color:
                                        "#FFFFFF",

                                      fontSize:
                                        13,

                                      fontWeight:
                                        800,

                                      textDecoration:
                                        "none",
                                    }}
                                  >
                                    Zum persönlichen Bereich
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}

                        <p
                          style={{
                            margin:
                              "24px 0 0",

                            fontSize:
                              11,

                            lineHeight:
                              "18px",

                            color:
                              "#7B899A",
                          }}
                        >
                          Aus Sicherheitsgründen enthält diese E-Mail keine Kopien
                          deiner Ausweisdokumente, deines Passfotos oder deiner
                          Unterschrift.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          padding:
                            "18px 28px",

                          borderTop:
                            "1px solid #E8EDF3",

                          backgroundColor:
                            "#FAFBFD",

                          fontSize:
                            11,

                          lineHeight:
                            "18px",

                          color:
                            "#7B899A",
                        }}
                      >
                        © Express-Führerschein · Diese Nachricht wurde automatisch
                        erstellt.
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

export default DrivingLicenseApplicationClientEmail;
