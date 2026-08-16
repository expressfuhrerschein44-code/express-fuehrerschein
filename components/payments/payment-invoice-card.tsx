import {
  CheckCircle2,
  Download,
  FileText,
  LockKeyhole,
  ReceiptText,
} from "lucide-react";

export interface PaymentInvoiceCardProps {
  paymentId: string;
  status: string;
  paidAt?:
    | string
    | null;
  className?: string;
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function normalizeText(
  value:
    | string
    | null
    | undefined,
): string {
  return value?.trim() ?? "";
}

function formatDate(
  value:
    | string
    | null
    | undefined,
): string | null {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return null;
  }

  const date =
    new Date(normalized);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(
      "de-DE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    ).format(date);
  } catch {
    return null;
  }
}

function buildInvoiceHref(
  paymentId: string,
): string {
  return `/api/payments/${encodeURIComponent(
    paymentId,
  )}/invoice`;
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export function PaymentInvoiceCard({
  paymentId,
  status,
  paidAt = null,
  className = "",
}: PaymentInvoiceCardProps) {
  const normalizedPaymentId =
    normalizeText(
      paymentId,
    );

  const normalizedStatus =
    normalizeText(
      status,
    ).toLowerCase();

  const isPaid =
    normalizedStatus ===
    "paid";

  const canDownload =
    isPaid &&
    normalizedPaymentId.length >
      0;

  const formattedPaidAt =
    formatDate(
      paidAt,
    );

  const invoiceHref =
    canDownload
      ? buildInvoiceHref(
          normalizedPaymentId,
        )
      : null;

  return (
    <section
      aria-labelledby="payment-invoice-title"
      className={[
        "overflow-hidden rounded-[20px] border border-[#DFE7F1] bg-white",
        "shadow-[0_12px_34px_rgba(15,23,42,0.05)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ================================================================
          HEADER
          ================================================================ */}

      <div className="flex items-start gap-3 border-b border-[#E8EDF3] px-5 py-5 sm:px-6">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]",
            canDownload
              ? "bg-[#EAF8F0] text-[#159447]"
              : "bg-[#EEF5FF] text-[#0B63F6]",
          ].join(" ")}
        >
          <ReceiptText
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
            Rechnung
          </p>

          <h2
            id="payment-invoice-title"
            className="mt-1 text-[17px] font-black tracking-[-0.025em] text-[#071426] sm:text-[19px]"
          >
            {canDownload
              ? "Deine Rechnung ist verfügbar"
              : "Rechnung noch nicht verfügbar"}
          </h2>

          <p className="mt-1.5 max-w-[620px] text-[12px] font-medium leading-5 text-[#66758A]">
            {canDownload
              ? "Deine Zahlung wurde bestätigt. Du kannst deine Rechnung jetzt als PDF herunterladen."
              : "Die Rechnung wird automatisch verfügbar, sobald deine Zahlung von der Verwaltung bestätigt wurde."}
          </p>
        </div>
      </div>

      {/* ================================================================
          AVAILABLE INVOICE
          ================================================================ */}

      {canDownload &&
      invoiceHref ? (
        <div className="p-5 sm:p-6">
          <div className="rounded-[16px] border border-[#D9E9E0] bg-[#F4FBF7] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#159447] shadow-sm">
                <CheckCircle2
                  className="h-[18px] w-[18px]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-black text-[#0B5F32]">
                  Zahlung bestätigt
                </p>

                <p className="mt-1 text-[11px] font-medium leading-5 text-[#557064]">
                  {formattedPaidAt
                    ? `Bestätigt am ${formattedPaidAt}.`
                    : "Der Zahlungseingang wurde erfolgreich bestätigt."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-[#E4EAF2] bg-[#F8FAFC] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#0B63F6] shadow-sm">
              <FileText
                className="h-[18px] w-[18px]"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black text-[#071426]">
                Rechnung als PDF
              </p>

              <p className="mt-0.5 truncate text-[10px] font-medium text-[#7A889B]">
                Express-Führerschein
              </p>
            </div>

            <span className="hidden rounded-full border border-[#DCE7F7] bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#65758B] sm:inline-flex">
              PDF
            </span>
          </div>

          <a
            href={
              invoiceHref
            }
            download
            className={[
              "mt-4 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[14px]",
              "bg-[#0B63F6] px-5 text-[12px] font-black text-white",
              "shadow-[0_10px_28px_rgba(11,99,246,0.22)]",
              "transition",
              "hover:bg-[#075BE2]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1684FF] focus-visible:ring-offset-2",
              "active:translate-y-px",
            ].join(" ")}
          >
            <Download
              className="h-[17px] w-[17px]"
              aria-hidden="true"
            />

            Rechnung als PDF herunterladen
          </a>

          <p className="mt-3 text-center text-[9px] font-medium leading-4 text-[#8795A8]">
            Das PDF wird sicher über dein angemeldetes Kundenkonto bereitgestellt.
          </p>
        </div>
      ) : (
        /* ==============================================================
           LOCKED STATE
           ============================================================== */

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-[16px] border border-[#E4EAF2] bg-[#F8FAFC] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#7A889B] shadow-sm">
              <LockKeyhole
                className="h-[18px] w-[18px]"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[12px] font-black text-[#334155]">
                PDF noch gesperrt
              </p>

              <p className="mt-1 text-[10px] font-medium leading-5 text-[#7A889B]">
                Nach der Zahlungsbestätigung wird der Download automatisch freigeschaltet.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PaymentInvoiceCard;