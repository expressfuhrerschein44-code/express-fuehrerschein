"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, Plus } from "lucide-react";

import { TheoryNoteEditor } from "@/components/theory/notes/theory-note-editor";
import { TheoryNoteItem, type TheoryNoteItemData } from "@/components/theory/notes/theory-note-item";

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { message?: string };
}

export interface TheoryNotesPanelProps {
  questionId?: string | null;
  lessonId?: string | null;
  title?: string;
  take?: number;
}

export function TheoryNotesPanel({
  questionId = null,
  lessonId = null,
  title = "Meine Notizen",
  take = 100,
}: TheoryNotesPanelProps) {
  const [notes, setNotes] = useState<readonly TheoryNoteItemData[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = Boolean(questionId || lessonId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/theory/questions?action=notes&take=${Math.max(1, Math.min(200, Math.round(take)))}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiEnvelope<readonly TheoryNoteItemData[]>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Notizen konnten nicht geladen werden.");
      }
      const scoped = payload.data.filter((note) => {
        if (questionId && note.question_id !== questionId) return false;
        if (lessonId && note.lesson_id !== lessonId) return false;
        return true;
      });
      setNotes(scoped);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Notizen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [lessonId, questionId, take]);

  useEffect(() => {
    void load();
  }, [load]);

  async function apiPost(body: Record<string, unknown>) {
    const response = await fetch("/api/theory/questions", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as ApiEnvelope<TheoryNoteItemData | { deleted: true }>;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error?.message ?? "Notiz-Aktion fehlgeschlagen.");
    }
    return payload.data;
  }

  async function create(body: string) {
    await apiPost({ action: "note_create", questionId, lessonId, body });
    setCreating(false);
    await load();
  }

  async function update(noteId: string, body: string) {
    await apiPost({ action: "note_update", noteId, body });
    await load();
  }

  async function remove(noteId: string) {
    await apiPost({ action: "note_delete", noteId });
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

  return (
    <section className="rounded-[16px] border border-[#E5EAF2] bg-[#F9FBFD] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0B63F6]"><FileText className="h-4 w-4" /></span>
          <div>
            <h2 className="text-[11px] font-extrabold text-[#081529]">{title}</h2>
            <p className="text-[8px] text-[#718094]">{notes.length} gespeichert</p>
          </div>
        </div>
        {canCreate && !creating ? (
          <button type="button" onClick={() => setCreating(true)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#0B63F6] px-3 text-[8px] font-extrabold text-white"><Plus className="h-3.5 w-3.5" /> Neue Notiz</button>
        ) : null}
      </div>

      {creating ? <div className="mt-3"><TheoryNoteEditor onCancel={() => setCreating(false)} onSubmit={create} /></div> : null}

      {loading ? (
        <div className="mt-4 flex min-h-24 items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-[#0B63F6]" /></div>
      ) : error ? (
        <p role="alert" className="mt-4 rounded-xl bg-[#FFF2F2] px-3 py-2 text-[8px] font-semibold text-[#C83B3B]">{error}</p>
      ) : notes.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[#DCE4EF] bg-white px-3 py-6 text-center text-[9px] text-[#718094]">Noch keine Notizen gespeichert.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {notes.map((note) => <TheoryNoteItem key={note.id} note={note} onUpdate={update} onDelete={remove} />)}
        </div>
      )}
    </section>
  );
}
