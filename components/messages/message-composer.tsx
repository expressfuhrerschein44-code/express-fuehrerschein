"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Loader2,
  Send,
} from "lucide-react";

export interface MessageComposerProps {
  disabled?: boolean;
  closed?: boolean;
  onSend: (body: string) => Promise<boolean>;
}

export function MessageComposer({
  disabled = false,
  closed = false,
  onSend,
}: MessageComposerProps) {
  const [
    body,
    setBody,
  ] =
    useState(
      "",
    );

  const [
    busy,
    setBusy,
  ] =
    useState(
      false,
    );

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value =
      body.trim();

    if (
      !value ||
      busy ||
      disabled ||
      closed
    ) {
      return;
    }

    setBusy(
      true,
    );

    try {
      const sent =
        await onSend(
          value,
        );

      if (sent) {
        setBody(
          "",
        );
      }
    } finally {
      setBusy(
        false,
      );
    }
  }

  if (closed) {
    return (
      <div className="border-t border-[#EDF1F6] bg-[#F8FAFD] px-4 py-4 text-center">
        <p className="text-[8px] font-bold text-[#718096]">
          Diese Unterhaltung ist geschlossen. Erstelle bei Bedarf eine neue Nachricht.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        submit
      }
      className="border-t border-[#EDF1F6] bg-white p-3.5 sm:p-4"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={
            body
          }
          disabled={
            disabled ||
            busy
          }
          onChange={(
            event,
          ) =>
            setBody(
              event.target.value,
            )
          }
          rows={2}
          maxLength={5000}
          placeholder="Nachricht schreiben..."
          className="max-h-36 min-h-[44px] flex-1 resize-y rounded-xl border border-[#DCE4EF] bg-white px-3 py-2.5 text-[9px] font-medium leading-4 text-[#223248] outline-none transition placeholder:text-[#9AA5B3] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:bg-[#F6F8FB]"
        />

        <button
          type="submit"
          disabled={
            disabled ||
            busy ||
            !body.trim()
          }
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B63F6] text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Nachricht senden"
        >
          {busy ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Send
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </form>
  );
}
