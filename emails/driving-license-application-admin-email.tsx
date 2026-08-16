/**
 * Express-Führerschein
 * Administrator notification e-mail for a submitted driving-license application.
 *
 * Notes:
 * - no identity document, portrait photo or signature is attached;
 * - the admin receives only the information needed to identify the request;
 * - this template has no dependency on react-email or lucide-react.
 */

import type {
  DrivingLicenseApplication,
  DrivingLicenseClassCode,
} from "@/types/driving-license-application";

import {
  DRIVING_LICENSE_CLASSES,
} from "@/data/driving-license-application";

export interface DrivingLicenseApplicationAdminEmailProps {
  firstName:
    string;

  lastName:
    string;

  email:
    string;

  countryCode?:
    string | null;

  application:
    DrivingLicenseApplication;

  adminUrl?:
    string | null;
}

export const DRIVING_LICENSE_APPLICATION_ADMIN_EMAIL_SUBJECT =
  "Neue Führerscheinanfrage eingegangen";

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

function countryLabel(
  code:
    string | null | undefined,
): string {
  switch (
    code
      ?.trim()
      .toUpperCase()
  ) {
    case "DE":
      return "Deutschland";

    case "AT":
      return "Österreich";

    case "CH":
      return "Schweiz";

    case "BE":
      return "Belgien";

    case "ES":
      return "Spanien";

    default:
      return code?.trim() ||
        "—";
  }
}

export function createDrivingLicenseApplicationAdminEmailText({
  firstName,

  lastName,

  email,

  countryCode,

  application,

  adminUrl,
}: DrivingLicenseApplicationAdminEmailProps): string {
  return [
    "Express-Führerschein",
    "",
    "Neue Führerscheinanfrage eingegangen.",
    "",
    `Kunde: ${`${firstName} ${lastName}`.trim()}`,
    `E-Mail: ${email}`,
    `Land: ${countryLabel(countryCode)}`,
    `Führerscheinklasse(n): ${getClassLabels(application.selectedClasses)}`,
    `Zwischensumme: ${formatMoney(application.pricing.classesSubtotalCents)}`,
    `Bearbeitungsgebühr: ${formatMoney(application.pricing.processingFeeCents)}`,
    `Gesamtbetrag: ${formatMoney(application.pricing.totalCents)}`,
    `Theorie bestanden: ${
      application.theoryPassed === true
        ? "Ja"
        : application.theoryPassed === false
          ? "Nein"
          : "—"
    }`,
    `Praxis bestanden: ${
      application.practicalPassed === true
        ? "Ja"
        : application.practicalPassed === false
          ? "Nein"
          : "—"
    }`,
    `Status: Eingereicht`,
    `Übermittelt am: ${formatSubmittedAt(application.submittedAt)}`,
    "",
    "Dokumente vorhanden:",
    "✓ Ausweis Vorderseite",
    "✓ Ausweis Rückseite",
    "✓ Passfoto",
    "✓ Unterschrift",
    "",
    "Aus Sicherheitsgründen wurden keine Dokumente an diese E-Mail angehängt.",
    adminUrl
      ? `Adminbereich: ${adminUrl}`
      : "",
  ]
    .filter(
      Boolean,
    )
    .join(
      "\n",
    );
}

export function DrivingLicenseApplicationAdminEmail({
  firstName,

  lastName,

  email,

  countryCode,

  application,

  adminUrl,
}: DrivingLicenseApplicationAdminEmailProps) {
  const customerName =
    `${firstName} ${lastName}`.trim();

  const classes =
    getClassLabels(
      application
        .selectedClasses,
    );

  const theoryLabel =
    application
      .theoryPassed ===
    true
      ? "Ja"
      : application
          .theoryPassed ===
        false
        ? "Nein"
        : "—";

  const practicalLabel =
    application
      .practicalPassed ===
    true
      ? "Ja"
      : application
          .practicalPassed ===
        false
        ? "Nein"
        : "—";

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
                      640,

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
                          Neue Kundenanfrage
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
                            display:
                              "inline-block",

                            padding:
                              "6px 10px",

                            borderRadius:
                              999,

                            backgroundColor:
                              "#EAF2FF",

                            color:
                              "#0B63F6",

                            fontSize:
                              11,

                            fontWeight:
                              800,
                          }}
                        >
                          Neue Anfrage
                        </div>

                        <h1
                          style={{
                            margin:
                              "16px 0 0",

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
                          Neue Führerscheinanfrage eingegangen
                        </h1>

                        <p
                          style={{
                            margin:
                              "10px 0 0",

                            fontSize:
                              13,

                            lineHeight:
                              "22px",

                            color:
                              "#506176",
                          }}
                        >
                          Ein Kunde hat eine neue Anfrage vollständig übermittelt.
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

                            border:
                              "1px solid #E4EAF1",

                            borderRadius:
                              14,

                            backgroundColor:
                              "#FFFFFF",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Kunde
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    800,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  customerName
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                E-Mail
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  email
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Land
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  countryLabel(
                                    countryCode,
                                  )
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Klasse(n)
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

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
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Theorie bestanden
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "14px 16px",

                                  borderBottom:
                                    "1px solid #EDF1F5",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  theoryLabel
                                }
                              </td>
                            </tr>

                            <tr>
                              <td
                                style={{
                                  padding:
                                    "14px 16px",

                                  fontSize:
                                    12,

                                  color:
                                    "#718096",
                                }}
                              >
                                Praxis bestanden
                              </td>

                              <td
                                align="right"
                                style={{
                                  padding:
                                    "14px 16px",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,

                                  color:
                                    "#122039",
                                }}
                              >
                                {
                                  practicalLabel
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
                                    "14px 16px 7px",

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
                                    "14px 16px 7px",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,
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
                                    "7px 16px",

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
                                    "7px 16px",

                                  fontSize:
                                    13,

                                  fontWeight:
                                    700,
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
                                    "12px 16px 16px",

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
                                    "12px 16px 16px",

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

                        <div
                          style={{
                            marginTop:
                              16,

                            padding:
                              16,

                            border:
                              "1px solid #CDE9DA",

                            borderRadius:
                              12,

                            backgroundColor:
                              "#F5FCF8",

                            color:
                              "#246A49",

                            fontSize:
                              12,

                            lineHeight:
                              "21px",
                          }}
                        >
                          ✓ Ausweis Vorderseite vorhanden
                          <br />
                          ✓ Ausweis Rückseite vorhanden
                          <br />
                          ✓ Passfoto vorhanden
                          <br />
                          ✓ Unterschrift vorhanden
                        </div>

                        <p
                          style={{
                            margin:
                              "18px 0 0",

                            fontSize:
                              12,

                            lineHeight:
                              "20px",

                            color:
                              "#64758A",
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
                        </p>

                        {adminUrl ? (
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
                                      adminUrl
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
                                    Anfrage im Admin öffnen
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
                          Aus Sicherheitsgründen wurden Ausweisdokumente, Passfoto
                          und Unterschrift nicht an diese E-Mail angehängt.
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
                        © Express-Führerschein · Interne automatische Benachrichtigung.
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

export default DrivingLicenseApplicationAdminEmail;
