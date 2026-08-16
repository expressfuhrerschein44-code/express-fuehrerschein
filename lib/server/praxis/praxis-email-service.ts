import "server-only";

const RESEND_API_URL =
  "https://api.resend.com/emails";

export interface PraxisEmailPayload {
  appointmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  licenseClassCode: string;
  startsAt: Date;
  timezone: string;
  location: string | null;
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

function getResendApiKey():
  string {
  const value =
    process.env.RESEND_API_KEY?.trim();

  if (!value) {
    throw new Error(
      "[Express-Führerschein] RESEND_API_KEY fehlt.",
    );
  }

  return value;
}

function getFromEmail():
  string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Express-Führerschein <noreply@express-fuhrerscheine.de>"
  );
}

function getAdminRecipients():
  string[] {
  const raw =
    process.env.PRAXIS_ADMIN_NOTIFICATION_EMAILS?.trim() ||
    process.env.PRAXIS_ADMIN_EMAILS?.trim() ||
    "";

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) =>
          value.trim().toLowerCase(),
        )
        .filter(Boolean),
    ),
  ];
}

function getAppOrigin():
  string {
  return (
    process.env.NEXT_PUBLIC_APP_URL
      ?.trim()
      .replace(/\/+$/, "") ||
    process.env.APP_URL
      ?.trim()
      .replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

function safeTimeZone(
  value: string,
): string {
  try {
    new Intl.DateTimeFormat(
      "de-DE",
      { timeZone: value },
    ).format(new Date());
    return value;
  } catch {
    return "Europe/Berlin";
  }
}

function formatAppointmentDate(
  date: Date,
  timezone: string,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      timeZone: safeTimeZone(timezone),
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

async function sendResendEmail(
  input: {
    to: readonly string[];
    subject: string;
    text: string;
    html: string;
  },
): Promise<void> {
  if (!input.to.length) {
    return;
  }

  const response =
    await fetch(
      RESEND_API_URL,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${getResendApiKey()}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          from: getFromEmail(),
          to: input.to,
          subject: input.subject,
          text: input.text,
          html: input.html,
        }),
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const detail =
      await response.text().catch(() => "");

    throw new Error(
      `[Express-Führerschein] Resend Fehler ${response.status}: ${detail}`,
    );
  }
}

function clientEmailHtml(
  input: {
    firstName: string;
    headline: string;
    intro: string;
    licenseClassCode: string;
    dateLabel: string;
    location: string | null;
    statusLabel: string;
  },
): string {
  const locationRow =
    input.location
      ? `<tr><td style="padding:7px 14px;color:#718096;font-size:13px;">Treffpunkt</td><td style="padding:7px 14px;color:#081529;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(input.location)}</td></tr>`
      : "";

  return `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#081529;"><div style="max-width:620px;margin:0 auto;padding:32px 16px;"><div style="overflow:hidden;border:1px solid #e5eaf2;border-radius:18px;background:#ffffff;"><div style="background:#061427;padding:22px 26px;color:#ffffff;font-size:18px;font-weight:800;">Express-Führerschein</div><div style="padding:28px 26px;"><h1 style="margin:0;font-size:24px;line-height:1.3;">${escapeHtml(input.headline)}</h1><p style="margin:18px 0 0;color:#526176;font-size:14px;line-height:1.7;">Hallo ${escapeHtml(input.firstName)},<br><br>${escapeHtml(input.intro)}</p><table style="width:100%;margin-top:22px;border-collapse:collapse;background:#f8fafd;border-radius:12px;"><tbody><tr><td style="padding:14px 14px 7px;color:#718096;font-size:13px;">Führerscheinklasse</td><td style="padding:14px 14px 7px;color:#081529;font-size:13px;font-weight:700;text-align:right;">Klasse ${escapeHtml(input.licenseClassCode)}</td></tr><tr><td style="padding:7px 14px;color:#718096;font-size:13px;">Termin</td><td style="padding:7px 14px;color:#081529;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(input.dateLabel)}</td></tr>${locationRow}<tr><td style="padding:7px 14px 14px;color:#718096;font-size:13px;">Status</td><td style="padding:7px 14px 14px;color:#0b63f6;font-size:13px;font-weight:800;text-align:right;">${escapeHtml(input.statusLabel)}</td></tr></tbody></table><p style="margin:22px 0 0;color:#718096;font-size:12px;line-height:1.6;">Den aktuellen Status deiner Fahrstunden findest du jederzeit in deinem Express-Führerschein-Konto.</p></div></div></div></body></html>`;
}

export async function sendPraxisRequestReceivedEmail(
  input: PraxisEmailPayload,
): Promise<void> {
  const dateLabel =
    formatAppointmentDate(
      input.startsAt,
      input.timezone,
    );

  await sendResendEmail({
    to: [input.email],
    subject:
      "Fahrstunden-Anfrage erhalten – Express-Führerschein",
    text: [
      `Hallo ${input.firstName},`,
      "",
      "wir haben deine Fahrstunden-Anfrage erfolgreich erhalten.",
      "",
      `Klasse: ${input.licenseClassCode}`,
      `Termin: ${dateLabel}`,
      input.location
        ? `Treffpunkt: ${input.location}`
        : "",
      "Status: Angefragt",
      "",
      "Deine Anfrage wird jetzt geprüft. Du erhältst eine weitere Nachricht, sobald sie bestätigt oder storniert wurde.",
      "",
      "Express-Führerschein",
    ].filter(Boolean).join("\n"),
    html: clientEmailHtml({
      firstName: input.firstName,
      headline:
        "Fahrstunden-Anfrage erhalten",
      intro:
        "wir haben deine Fahrstunden-Anfrage erfolgreich erhalten. Deine Anfrage wird jetzt geprüft.",
      licenseClassCode:
        input.licenseClassCode,
      dateLabel,
      location:
        input.location,
      statusLabel:
        "Angefragt",
    }),
  });
}

export async function sendPraxisRequestConfirmedEmail(
  input: PraxisEmailPayload,
): Promise<void> {
  const dateLabel =
    formatAppointmentDate(
      input.startsAt,
      input.timezone,
    );

  await sendResendEmail({
    to: [input.email],
    subject:
      "Deine Fahrstunde wurde bestätigt – Express-Führerschein",
    text: [
      `Hallo ${input.firstName},`,
      "",
      "deine Fahrstunde wurde bestätigt.",
      "",
      `Klasse: ${input.licenseClassCode}`,
      `Termin: ${dateLabel}`,
      input.location
        ? `Treffpunkt: ${input.location}`
        : "",
      "Status: Bestätigt",
      "",
      "Express-Führerschein",
    ].filter(Boolean).join("\n"),
    html: clientEmailHtml({
      firstName: input.firstName,
      headline:
        "Deine Fahrstunde wurde bestätigt",
      intro:
        "dein gewünschter Fahrstundentermin wurde bestätigt.",
      licenseClassCode:
        input.licenseClassCode,
      dateLabel,
      location:
        input.location,
      statusLabel:
        "Bestätigt",
    }),
  });
}

export async function sendPraxisRequestCancelledEmail(
  input: PraxisEmailPayload,
): Promise<void> {
  const dateLabel =
    formatAppointmentDate(
      input.startsAt,
      input.timezone,
    );

  await sendResendEmail({
    to: [input.email],
    subject:
      "Fahrstunden-Anfrage storniert – Express-Führerschein",
    text: [
      `Hallo ${input.firstName},`,
      "",
      "deine Fahrstunden-Anfrage konnte leider nicht bestätigt werden und wurde storniert.",
      "",
      `Klasse: ${input.licenseClassCode}`,
      `Termin: ${dateLabel}`,
      input.location
        ? `Treffpunkt: ${input.location}`
        : "",
      "Status: Storniert",
      "",
      "Du kannst über deinen Praxis-Bereich einen neuen Terminwunsch senden.",
      "",
      "Express-Führerschein",
    ].filter(Boolean).join("\n"),
    html: clientEmailHtml({
      firstName: input.firstName,
      headline:
        "Fahrstunden-Anfrage storniert",
      intro:
        "deine Fahrstunden-Anfrage konnte leider nicht bestätigt werden. Du kannst direkt einen neuen Terminwunsch senden.",
      licenseClassCode:
        input.licenseClassCode,
      dateLabel,
      location:
        input.location,
      statusLabel:
        "Storniert",
    }),
  });
}

export async function sendPraxisAdminNewRequestEmail(
  input: PraxisEmailPayload,
): Promise<void> {
  const recipients =
    getAdminRecipients();

  if (!recipients.length) {
    console.warn(
      "[PRAXIS_ADMIN_EMAIL_SKIPPED] PRAXIS_ADMIN_NOTIFICATION_EMAILS / PRAXIS_ADMIN_EMAILS fehlt.",
    );
    return;
  }

  const dateLabel =
    formatAppointmentDate(
      input.startsAt,
      input.timezone,
    );

  const adminUrl =
    `${getAppOrigin()}/admin/praxis`;

  await sendResendEmail({
    to: recipients,
    subject:
      `Neue Fahrstunden-Anfrage – Klasse ${input.licenseClassCode}`,
    text: [
      "Neue Fahrstunden-Anfrage eingegangen.",
      "",
      `Kunde: ${input.firstName} ${input.lastName}`,
      `E-Mail: ${input.email}`,
      `Klasse: ${input.licenseClassCode}`,
      `Termin: ${dateLabel}`,
      `Treffpunkt: ${input.location ?? "Nicht angegeben"}`,
      "Status: Angefragt",
      "",
      `Admin: ${adminUrl}`,
    ].join("\n"),
    html: `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#081529;"><div style="max-width:650px;margin:0 auto;padding:32px 16px;"><div style="border:1px solid #e5eaf2;border-radius:18px;background:#ffffff;padding:26px;"><div style="font-size:12px;font-weight:800;color:#0b63f6;text-transform:uppercase;letter-spacing:.06em;">Neue Praxis-Anfrage</div><h1 style="margin:10px 0 0;font-size:24px;">Neue Fahrstunden-Anfrage</h1><p style="margin:16px 0 0;color:#526176;font-size:14px;line-height:1.6;">Eine neue Fahrstunden-Anfrage wurde eingereicht und wartet auf Bearbeitung.</p><div style="margin-top:22px;background:#f8fafd;border-radius:12px;padding:16px;font-size:13px;line-height:1.8;"><strong>Kunde:</strong> ${escapeHtml(input.firstName)} ${escapeHtml(input.lastName)}<br><strong>E-Mail:</strong> ${escapeHtml(input.email)}<br><strong>Klasse:</strong> ${escapeHtml(input.licenseClassCode)}<br><strong>Termin:</strong> ${escapeHtml(dateLabel)}<br><strong>Treffpunkt:</strong> ${escapeHtml(input.location ?? "Nicht angegeben")}<br><strong>Status:</strong> Angefragt</div><a href="${escapeHtml(adminUrl)}" style="display:inline-block;margin-top:22px;background:#0b63f6;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;padding:12px 18px;border-radius:10px;">Anfrage im Admin öffnen</a></div></div></body></html>`,
  });
}
