"use client";

import { useEffect, useId, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send, X } from "lucide-react";

export type QuestionReportReason =
  | "incorrect_question"
  | "incorrect_media"
  | "translation"
  | "technical"
  | "other";

export interface QuestionReportDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

interface ReportApiResponse {
  ok?: boolean;
  error?: {
    message?: string;
  };
}

const REASONS: readonly {
  value: QuestionReportReason;
  label: string;
  description: string;
}[] = [
  {
    value: "incorrect_question",
    label: "Frage oder Lösung",
    description: "Inhalt, Antwortmöglichkeiten oder Lösung wirken fehlerhaft.",
  },
  {
    value: "incorrect_media",
    label: "Bild oder Video",
    description: "Das Medium fehlt, ist falsch oder lässt sich nicht laden.",
  },
  {
    value: "translation",
    label: "Übersetzung / Sprache",
    description: "Text ist unklar, falsch übersetzt oder sprachlich problematisch.",
  },
  {
    value: "technical",
    label: "Technisches Problem",
    description: "Auswahl, Darstellung oder Bedienung funktioniert nicht richtig.",
  },
  {
    value: "other",
    label: "Sonstiges",
    description: "Ein anderes Problem mit dieser Theoriefrage.",
  },
];

const MAX_MESSAGE_LENGTH = 3000;

export function QuestionReportDialog({
  questionId,
  open,
  onOpenChange,
  onSubmitted,
}: QuestionReportDialogProps) {
  const titleId = useId();
  const [reason, setReason] = useState<QuestionReportReason>("incorrect_question");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setSubmitted(false);
    setError(null);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open, submitting]);

  useEffect(() => {
    setReason("incorrect_question");
    setMessage("");
    setSubmitted(false);
    setError(null);
  }, [questionId]);

  if (!open) return null;

  async function submitReport() {
    if (!questionId || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/theory/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          action: "report",
          questionId,
          reason,
          message: message.trim() || null,
        }),
      });

      const payload = await response.json() as ReportApiResponse;

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          payload.error?.message ?? "Meldung konnte nicht gesendet werden.",
        );
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Meldung konnte nicht gesendet werden.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#061427]/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !submitting) {
          onOpenChange(false);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full rounded-t-3xl border border-[#E3E8F0] bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#B96A00]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#B96A00]">
                Qualitätssicherung
              </p>
              <h2 id={titleId} className="mt-1 text-[16px] font-extrabold text-[#081529]">
                Problem mit der Frage melden
              </h2>
              <p className="mt-1 max-w-md text-[10px] leading-4 text-[#718094]">
                Deine Meldung wird zur Prüfung gespeichert. Sie ändert die Frage nicht automatisch.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Dialog schließen"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6F7F94] transition hover:bg-[#F7F9FC] disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-[#CBECDD] bg-[#F1FBF6] p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#10A36A]" aria-hidden="true" />
            <h3 className="mt-3 text-[13px] font-extrabold text-[#081529]">
              Meldung wurde gesendet
            </h3>
            <p className="mt-1 text-[10px] leading-4 text-[#617187]">
              Danke. Das Problem kann jetzt kontrolliert und bearbeitet werden.
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-4 min-h-10 rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0956D9]"
            >
              Schließen
            </button>
          </div>
        ) : (
          <>
            <fieldset className="mt-5">
              <legend className="text-[10px] font-extrabold text-[#53647A]">
                Was ist das Problem?
              </legend>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {REASONS.map((item) => {
                  const selected = reason === item.value;

                  return (
                    <label
                      key={item.value}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        selected
                          ? "border-[#0B63F6] bg-[#F2F7FF] ring-1 ring-[#0B63F6]/10"
                          : "border-[#E1E7EF] bg-white hover:bg-[#F9FBFD]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="theory-question-report-reason"
                        value={item.value}
                        checked={selected}
                        onChange={() => setReason(item.value)}
                        className="sr-only"
                      />
                      <span className="block text-[10px] font-extrabold text-[#081529]">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-[9px] leading-4 text-[#718094]">
                        {item.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label htmlFor="theory-question-report-message" className="mt-5 block text-[10px] font-extrabold text-[#53647A]">
              Zusätzliche Beschreibung <span className="font-semibold text-[#8A97A8]">(optional)</span>
            </label>
            <textarea
              id="theory-question-report-message"
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={5}
              placeholder="Beschreibe kurz, was dir aufgefallen ist ..."
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 w-full resize-y rounded-xl border border-[#DCE3ED] px-3.5 py-3 text-[12px] leading-5 text-[#081529] outline-none transition placeholder:text-[#9AA6B6] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#0B63F6]/10"
            />

            <div className="mt-1 flex justify-end">
              <span className="text-[9px] tabular-nums text-[#8492A5]">
                {MAX_MESSAGE_LENGTH - message.length}
              </span>
            </div>

            {error ? (
              <p role="alert" className="mt-3 rounded-lg bg-[#FFF1F2] px-3 py-2 text-[10px] font-semibold text-[#C92A35]">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
                className="min-h-10 rounded-lg border border-[#DCE3ED] px-4 text-[10px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={submitting || !questionId}
                onClick={() => void submitReport()}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0956D9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Meldung senden
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
