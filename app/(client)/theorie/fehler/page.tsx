/**
 * Express-Führerschein
 * Real error-review list.
 */

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTheoryErrors,
} from "@/lib/server/theory/theory-error-service";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export default async function TheoryErrorsPage() {
  const session =
    await requireClientSession();

  const errors =
    await getTheoryErrors({
      userId:
        session
          .user
          .id,

      locale:
        session
          .user
          .preferredLocale,

      take:
        100,
    });

  return (
    <div className="mx-auto w-full max-w-[1050px] px-3 py-5 lg:px-7 lg:py-7">
      <Link
        href="/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Theorieübersicht
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#081529]">
            Meine Fehler
          </h1>

          <p className="mt-1 text-[11px] leading-5 text-[#66758A]">
            Wiederhole Fragen, bei denen du noch unsicher bist.
          </p>
        </div>

        {errors.length > 0 ? (
          <Link
            href="/theorie/uebungen?mode=errors"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-4 text-[10px] font-extrabold text-white"
          >
            Fehler trainieren
          </Link>
        ) : null}
      </div>

      {errors.length === 0 ? (
        <div className="mt-5 rounded-[16px] border border-[#DDEAE4] bg-white px-5 py-10 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-[#10A36A]" />

          <h2 className="mt-3 text-[13px] font-extrabold text-[#081529]">
            Aktuell keine Fehler zum Wiederholen.
          </h2>

          <p className="mt-1 text-[9px] text-[#66758A]">
            Neue Fehlversuche werden automatisch hier aufgenommen.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {errors.map(
            (
              item,
            ) => (
              <article
                key={
                  item.id
                }
                className="rounded-[14px] border border-[#E5EAF2] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#EF4444]">
                    <XCircle className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#7A899C]">
                      {item.topicTitle}
                    </p>

                    <h2 className="mt-1 text-[11px] font-extrabold leading-5 text-[#081529]">
                      {item.prompt ||
                        "Fragetext in der aktuellen Sprache nicht verfügbar."}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[8px] text-[#718094]">
                      <span>
                        Versuche: {item.attemptCount}
                      </span>

                      <span>
                        Fehler: {item.incorrectCount}
                      </span>

                      <span>
                        Richtig: {item.correctCount}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  );
}
