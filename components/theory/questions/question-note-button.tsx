"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Save, Trash2, X } from "lucide-react";

export interface QuestionNoteButtonProps {
  questionId: string;
  lessonId?: string | null;
  disabled?: boolean;
  className?: string;
  onSaved?: (note: QuestionNoteView | null) => void;
}

export interface QuestionNoteView {
  id: string;
  questionId: string | null;
  lessonId: string | null;
  body: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface NoteApiRow {
  id?: unknown;
  question_id?: unknown;
  questionId?: unknown;
  lesson_id?: unknown;
  lessonId?: unknown;
  body?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  updated_at?: unknown;
  updatedAt?: unknown;
}

interface NotesApiResponse {
  ok?: boolean;
  data?: unknown;
  error?: {
    message?: string;
  };
}

const MAX_NOTE_LENGTH = 5000;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseNote(row: NoteApiRow): QuestionNoteView | null {
  const id = stringOrNull(row.id);
  const body = typeof row.body === "string" ? row.body : null;

  if (!id || body === null) return null;

  return {
    id,
    questionId: stringOrNull(row.question_id) ?? stringOrNull(row.questionId),
    lessonId: stringOrNull(row.lesson_id) ?? stringOrNull(row.lessonId),
    body,
    createdAt: stringOrNull(row.created_at) ?? stringOrNull(row.createdAt),
    updatedAt: stringOrNull(row.updated_at) ?? stringOrNull(row.updatedAt),
  };
}

function parseNotes(payload: unknown): readonly QuestionNoteView[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => parseNote((item ?? {}) as NoteApiRow))
    .filter((item): item is QuestionNoteView => Boolean(item));
}

export function QuestionNoteButton({
  questionId,
  lessonId = null,
  disabled = false,
  className = "",
  onSaved,
}: QuestionNoteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [note, setNote] = useState<QuestionNoteView | null>(null);
  const [body, setBody] = useState("");
  const [loadedForQuestionId, setLoadedForQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedBody = body.trim();
  const dirty = trimmedBody !== (note?.body.trim() ?? "");
  const canSave = trimmedBody.length > 0 && dirty && !saving && !deleting;
  const remaining = MAX_NOTE_LENGTH - body.length;

  useEffect(() => {
    setOpen(false);
    setLoading(false);
    setSaving(false);
    setDeleting(false);
    setNote(null);
    setBody("");
    setLoadedForQuestionId(null);
    setError(null);
  }, [questionId]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving && !deleting) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleting, open, saving]);

  const dialogTitle = useMemo(
    () => note ? "Notiz bearbeiten" : "Notiz zur Frage",
    [note],
  );

  async function loadExistingNote() {
    if (!questionId || loading || loadedForQuestionId === questionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/theory/questions?action=notes&take=200", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const payload = await response.json() as NotesApiResponse;

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          payload.error?.message ?? "Notiz konnte nicht geladen werden.",
        );
      }

      const existing = parseNotes(payload.data)
        .find((item) => item.questionId === questionId) ?? null;

      setNote(existing);
      setBody(existing?.body ?? "");
      setLoadedForQuestionId(questionId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Notiz konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOpen() {
    if (disabled || !questionId) return;
    setOpen(true);
    await loadExistingNote();
  }

  async function saveNote() {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/theory/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(
          note
            ? {
                action: "note_update",
                noteId: note.id,
                body: trimmedBody,
              }
            : {
                action: "note_create",
                questionId,
                lessonId,
                body: trimmedBody,
              },
        ),
      });

      const payload = await response.json() as NotesApiResponse;

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          payload.error?.message ?? "Notiz konnte nicht gespeichert werden.",
        );
      }

      const persisted = parseNote((payload.data ?? {}) as NoteApiRow);

      if (!persisted) {
        throw new Error("Notiz wurde gespeichert, aber die Antwort war unvollständig.");
      }

      setNote(persisted);
      setBody(persisted.body);
      setLoadedForQuestionId(questionId);
      onSaved?.(persisted);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Notiz konnte nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote() {
    if (!note || deleting || saving) return;

    setDeleting(true);
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
          action: "note_delete",
          noteId: note.id,
        }),
      });

      const payload = await response.json() as NotesApiResponse;

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          payload.error?.message ?? "Notiz konnte nicht gelöscht werden.",
        );
      }

      setNote(null);
      setBody("");
      setLoadedForQuestionId(questionId);
      onSaved?.(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Notiz konnte nicht gelöscht werden.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || !questionId}
        onClick={() => void handleOpen()}
        className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E0E6EF] bg-white px-3 text-[9px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6]/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        Notiz
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[#061427]/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !saving && !deleting) {
              setOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="theory-question-note-title"
            className="w-full rounded-t-3xl border border-[#E3E8F0] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0B63F6]">
                  Theorie
                </p>
                <h2 id="theory-question-note-title" className="mt-1 text-[16px] font-extrabold text-[#081529]">
                  {dialogTitle}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Notiz schließen"
                disabled={saving || deleting}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#6F7F94] transition hover:bg-[#F7F9FC] disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#0B63F6]" aria-hidden="true" />
                <span className="sr-only">Notiz wird geladen</span>
              </div>
            ) : (
              <>
                <label htmlFor="theory-question-note-body" className="mt-5 block text-[10px] font-extrabold text-[#53647A]">
                  Deine Notiz
                </label>
                <textarea
                  id="theory-question-note-body"
                  value={body}
                  maxLength={MAX_NOTE_LENGTH}
                  rows={7}
                  placeholder="Eigene Merkhilfe, Erklärung oder Lernnotiz ..."
                  onChange={(event) => setBody(event.target.value)}
                  className="mt-2 w-full resize-y rounded-xl border border-[#DCE3ED] bg-white px-3.5 py-3 text-[12px] leading-5 text-[#081529] outline-none transition placeholder:text-[#9AA6B6] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#0B63F6]/10"
                />

                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-[9px] text-[#8492A5]">
                    Nur in deinem Konto gespeichert.
                  </p>
                  <p className={`text-[9px] tabular-nums ${remaining < 250 ? "font-bold text-[#B96A00]" : "text-[#8492A5]"}`}>
                    {remaining}
                  </p>
                </div>

                {error ? (
                  <p role="alert" className="mt-3 rounded-lg bg-[#FFF1F2] px-3 py-2 text-[10px] font-semibold text-[#C92A35]">
                    {error}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {note ? (
                      <button
                        type="button"
                        disabled={saving || deleting}
                        onClick={() => void deleteNote()}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-[10px] font-extrabold text-[#D9363E] transition hover:bg-[#FFF1F2] disabled:opacity-50"
                      >
                        {deleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        Löschen
                      </button>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving || deleting}
                      onClick={() => setOpen(false)}
                      className="min-h-10 rounded-lg border border-[#DCE3ED] px-4 text-[10px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] disabled:opacity-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      disabled={!canSave}
                      onClick={() => void saveNote()}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[10px] font-extrabold text-white transition hover:bg-[#0956D9] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Speichern
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
