"use client";

import { useState } from "react";
import { FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { TheoryNoteEditor } from "@/components/theory/notes/theory-note-editor";

export interface TheoryNoteItemData {
  id: string;
  question_id: string | null;
  lesson_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TheoryNoteItemProps {
  note: TheoryNoteItemData;
  onUpdate: (noteId: string, body: string) => Promise<void> | void;
  onDelete: (noteId: string) => Promise<void> | void;
}

export function TheoryNoteItem({ note, onUpdate, onDelete }: TheoryNoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(note.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Notiz konnte nicht gelöscht werden.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <TheoryNoteEditor
        initialBody={note.body}
        submitLabel="Änderungen speichern"
        onCancel={() => setEditing(false)}
        onSubmit={async (body) => {
          await onUpdate(note.id, body);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <article className="rounded-[14px] border border-[#E5EAF2] bg-white p-3">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FF] text-[#0B63F6]"><FileText className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap break-words text-[10px] leading-5 text-[#27384D]">{note.body}</p>
          <p className="mt-2 text-[7px] text-[#8A98AA]">Zuletzt geändert: {new Date(note.updated_at).toLocaleString("de-DE")}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#DCE4EF] px-2.5 text-[8px] font-extrabold text-[#66758A]"><Pencil className="h-3 w-3" /> Bearbeiten</button>
        <button type="button" disabled={deleting} onClick={() => void remove()} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#F0D0D0] px-2.5 text-[8px] font-extrabold text-[#C83B3B] disabled:opacity-55">
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Löschen
        </button>
      </div>
      {error ? <p role="alert" className="mt-2 text-[8px] font-semibold text-[#C83B3B]">{error}</p> : null}
    </article>
  );
}
