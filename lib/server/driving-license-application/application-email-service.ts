/**
 * Express-Führerschein
 * Submission e-mail delivery via Resend.
 *
 * Sends:
 * - confirmation to the client;
 * - notification to the administrator.
 *
 * Sensitive documents and signatures are never attached.
 */

import "server-only";

import {
  DRIVING_LICENSE_CLASSES,
} from "@/data/driving-license-application";

import type {
  DrivingLicenseApplication,
  DrivingLicenseClassCode,
} from "@/types/driving-license-application";

export interface ApplicationEmailCustomer {
  firstName:
    string;

  lastName:
    string;

  email:
    string;
}

export interface ApplicationEmailDeliveryResult {
  clientSent:
    boolean;

  adminSent:
    boolean;
}

function escapeHtml(
  value:
    string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getResendConfig() {
  const apiKey =
    process.env
      .RESEND_API_KEY
      ?.trim();

  const from =
    process.env
      .RESEND_FROM_EMAIL
      ?.trim();

  if (
    !apiKey ||
    !from
  ) {
    throw new Error(
      "[Express-Führerschein] Resend is not configured.",
    );
  }

  return {
    apiKey,
    from,
  };
}

function getAdminEmail():
  string | null {
  return (
    process.env
      .APPLICATION_ADMIN_EMAIL ??
    process.env
      .ADMIN_EMAIL ??
    process.env
      .SUPPORT_EMAIL ??
    null
  )
    ?.trim() ||
    null;
}

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
    },
  ).format(
    cents /
    100,
  );
}

function classLabels(
  codes:
    readonly DrivingLicenseClassCode[],
): string {
  return codes
    .map(
      (
        code,
      ) =>
        DRIVING_LICENSE_CLASSES.find(
          (
            item,
          ) =>
            item.code ===
            code,
        )
          ?.label ??
        code,
    )
    .join(
      ", ",
    );
}

async function sendResendEmail(
  input: {
    to:
      string;

    subject:
      string;

    html:
      string;

    text:
      string;
  },
): Promise<void> {
  const {
    apiKey,
    from,
  } =
    getResendConfig();

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            from,

            to: [
              input.to,
            ],

            subject:
              input.subject,

            html:
              input.html,

            text:
              input.text,
          }),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    const detail =
      await response
        .text()
        .catch(
          () =>
            "",
        );

    throw new Error(
      `[Express-Führerschein] Resend delivery failed (${response.status}): ${detail}`,
    );
  }
}

async function sendClientEmail(
  customer:
    ApplicationEmailCustomer,

  application:
    DrivingLicenseApplication,
): Promise<void> {
  const firstName =
    escapeHtml(
      customer.firstName,
    );

  const classes =
    escapeHtml(
      classLabels(
        application
          .selectedClasses,
      ),
    );

  const total =
    escapeHtml(
      formatMoney(
        application
          .pricing
          .totalCents,
      ),
    );

  const subject =
    "Deine Führerscheinanfrage wurde erfolgreich übermittelt";

  const html =
    `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px 16px;color:#111c2b">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3e8ef;border-radius:18px;overflow:hidden">
          <div style="background:#031426;color:#ffffff;padding:24px 28px">
            <div style="font-size:22px;font-weight:800">Express-Führerschein</div>
            <div style="margin-top:6px;font-size:12px;color:#bfd7f4">Sicher zu deinem Führerschein.</div>
          </div>

          <div style="padding:30px 28px">
            <h1 style="margin:0;font-size:23px">Anfrage erfolgreich übermittelt</h1>

            <p style="margin-top:18px;line-height:1.7;color:#45556a">
              Hallo <strong>${firstName}</strong>,
            </p>

            <p style="line-height:1.7;color:#45556a">
              wir haben deine Führerscheinanfrage erfolgreich erhalten.
            </p>

            <div style="margin:22px 0;padding:18px;border-radius:14px;background:#f7f9fc">
              <div style="font-size:12px;color:#6b7a8c">Führerscheinklasse(n)</div>
              <div style="margin-top:6px;font-weight:800">${classes}</div>

              <div style="margin-top:16px;font-size:12px;color:#6b7a8c">Gesamtbetrag</div>
              <div style="margin-top:6px;font-size:20px;font-weight:900;color:#0878ff">${total}</div>

              <div style="margin-top:16px;font-size:12px;color:#6b7a8c">Status</div>
              <div style="margin-top:6px;font-weight:800">Eingereicht</div>
            </div>

            <p style="line-height:1.7;color:#45556a">
              Deine Dokumente und deine Unterschrift wurden sicher übermittelt.
              Den aktuellen Status findest du jederzeit in deinem persönlichen Bereich.
            </p>

            <p style="margin-top:24px;font-size:12px;color:#7a899a">
              Aus Sicherheitsgründen enthält diese E-Mail keine Kopien deiner Dokumente.
            </p>
          </div>
        </div>
      </div>
    `;

  const text =
    [
      "Express-Führerschein",
      "",
      `Hallo ${customer.firstName},`,
      "",
      "wir haben deine Führerscheinanfrage erfolgreich erhalten.",
      `Führerscheinklasse(n): ${classLabels(application.selectedClasses)}`,
      `Gesamtbetrag: ${formatMoney(application.pricing.totalCents)}`,
      "Status: Eingereicht",
      "",
      "Deine Dokumente und deine Unterschrift wurden sicher übermittelt.",
    ].join(
      "\n",
    );

  await sendResendEmail({
    to:
      customer.email,

    subject,

    html,

    text,
  });
}

async function sendAdminEmail(
  customer:
    ApplicationEmailCustomer,

  application:
    DrivingLicenseApplication,
): Promise<boolean> {
  const adminEmail =
    getAdminEmail();

  if (
    !adminEmail
  ) {
    console.warn(
      "[DRIVING_LICENSE_APPLICATION_ADMIN_EMAIL_MISSING] APPLICATION_ADMIN_EMAIL is not configured.",
    );

    return false;
  }

  const displayName =
    escapeHtml(
      `${customer.firstName} ${customer.lastName}`.trim(),
    );

  const clientEmail =
    escapeHtml(
      customer.email,
    );

  const classes =
    escapeHtml(
      classLabels(
        application
          .selectedClasses,
      ),
    );

  const total =
    escapeHtml(
      formatMoney(
        application
          .pricing
          .totalCents,
      ),
    );

  const subject =
    "Neue Führerscheinanfrage eingegangen";

  const html =
    `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px 16px;color:#111c2b">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3e8ef;border-radius:18px;overflow:hidden">
          <div style="background:#031426;color:#ffffff;padding:24px 28px">
            <div style="font-size:22px;font-weight:800">Express-Führerschein</div>
            <div style="margin-top:6px;font-size:12px;color:#bfd7f4">Neue Kundenanfrage</div>
          </div>

          <div style="padding:30px 28px">
            <h1 style="margin:0;font-size:23px">Neue Führerscheinanfrage</h1>

            <table style="width:100%;margin-top:22px;border-collapse:collapse">
              <tr>
                <td style="padding:9px 0;color:#6b7a8c">Kunde</td>
                <td style="padding:9px 0;font-weight:800;text-align:right">${displayName}</td>
              </tr>
              <tr>
                <td style="padding:9px 0;color:#6b7a8c">E-Mail</td>
                <td style="padding:9px 0;font-weight:800;text-align:right">${clientEmail}</td>
              </tr>
              <tr>
                <td style="padding:9px 0;color:#6b7a8c">Klasse(n)</td>
                <td style="padding:9px 0;font-weight:800;text-align:right">${classes}</td>
              </tr>
              <tr>
                <td style="padding:9px 0;color:#6b7a8c">Gesamtbetrag</td>
                <td style="padding:9px 0;font-weight:900;text-align:right;color:#0878ff">${total}</td>
              </tr>
              <tr>
                <td style="padding:9px 0;color:#6b7a8c">Status</td>
                <td style="padding:9px 0;font-weight:800;text-align:right">Eingereicht</td>
              </tr>
            </table>

            <div style="margin-top:22px;padding:14px;border-radius:12px;background:#eef8f3;color:#256548">
              ✓ Ausweis Vorderseite<br />
              ✓ Ausweis Rückseite<br />
              ✓ Passfoto<br />
              ✓ Unterschrift
            </div>

            <p style="margin-top:22px;font-size:12px;color:#7a899a">
              Dokumente und Unterschrift werden aus Sicherheitsgründen nicht per E-Mail versendet.
            </p>
          </div>
        </div>
      </div>
    `;

  const text =
    [
      "Neue Führerscheinanfrage",
      "",
      `Kunde: ${customer.firstName} ${customer.lastName}`,
      `E-Mail: ${customer.email}`,
      `Klasse(n): ${classLabels(application.selectedClasses)}`,
      `Gesamtbetrag: ${formatMoney(application.pricing.totalCents)}`,
      "Status: Eingereicht",
      "",
      "Dokumente: Vorderseite, Rückseite, Passfoto, Unterschrift vorhanden.",
    ].join(
      "\n",
    );

  await sendResendEmail({
    to:
      adminEmail,

    subject,

    html,

    text,
  });

  return true;
}

export async function sendApplicationSubmittedEmails(
  customer:
    ApplicationEmailCustomer,

  application:
    DrivingLicenseApplication,
): Promise<ApplicationEmailDeliveryResult> {
  let clientSent =
    false;

  let adminSent =
    false;

  try {
    await sendClientEmail(
      customer,
      application,
    );

    clientSent =
      true;
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[DRIVING_LICENSE_APPLICATION_CLIENT_EMAIL_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );
  }

  try {
    adminSent =
      await sendAdminEmail(
        customer,
        application,
      );
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[DRIVING_LICENSE_APPLICATION_ADMIN_EMAIL_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );
  }

  return {
    clientSent,
    adminSent,
  };
}
