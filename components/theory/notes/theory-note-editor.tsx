"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

export interface TheoryNoteEditorProps {
  initialBody?: string;
  submitLabel?: string;
  disabled?: boolean;
  onCancel?: () => void;
  onSubmit: (body: string) => Promise<void> | void;
}

export function TheoryNoteEditor({
  initialBody = "",
  submitLabel = "Notiz speichern",
  disabled = false,
  onCancel,
  onSubmit,
}: TheoryNoteEditorProps) {
  const [body, setBody] = useState(initialBody);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setBody(initialBody), [initialBody]);

  async function submit() {
    const normalized = body.trim();
    if (!normalized || pending || disabled) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit(normalized);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Notiz konnte nicht gespeichert werden.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[14px] border border-[#E5EAF2] bg-white p-3">
      <label className="block text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#718094]" htmlFor="theory-note-body">Notiz</label>
      <textarea
        id="theory-note-body"
        value={body}
        maxLength={5000}
        disabled={disabled || pending}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Schreibe hier deine Lernnotiz…"
        className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#DDE4ED] bg-[#FBFCFE] px-3 py-2 text-[10px] leading-5 text-[#081529] outline-none transition focus:border-[#0B63F6] focus:ring-2 focus:ring-[#0B63F6]/10"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[8px] text-[#8A98AA]">{body.length} / 5000</span>
        <div className="flex items-center gap-2">
          {onCancel ? (
            <button type="button" disabled={pending} onClick={onCancel} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#DCE4EF] px-3 text-[9px] font-extrabold text-[#66758A]">
              <X className="h-3.5 w-3.5" /> Abbrechen
            </button>
          ) : null}
          <button type="button" disabled={pending || disabled || !body.trim()} onClick={() => void submit()} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#0B63F6] px-3 text-[9px] font-extrabold text-white disabled:opacity-55">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {submitLabel}
          </button>
        </div>
      </div>
      {error ? <p role="alert" className="mt-2 text-[8px] font-semibold text-[#C83B3B]">{error}</p> : null}
    </div>
  );
}
