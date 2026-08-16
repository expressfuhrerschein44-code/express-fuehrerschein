"use client";

/**
 * Express-Führerschein
 * Two exclusive yes/no exam questions.
 */

import {
  cn,
} from "@/lib/utils";

export interface ExamInformationSectionProps {
  theoryPassed:
    boolean | null;

  practicalPassed:
    boolean | null;

  onTheoryChange:
    (
      value:
        boolean,
    ) =>
      void;

  onPracticalChange:
    (
      value:
        boolean,
    ) =>
      void;

  compact?:
    boolean;
}

function Choice({
  selected,

  children,

  onClick,
}: {
  selected:
    boolean;

  children:
    React.ReactNode;

  onClick:
    () =>
      void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={cn(
        "min-w-[56px] rounded-lg border px-4 py-2 text-[11px] font-extrabold transition",

        selected
          ? "border-[#0B63F6] bg-[#0B63F6] text-white shadow-sm"
          : "border-[#DDE5EE] bg-white text-[#25354A] hover:border-[#BFCBDA]",
      )}
    >
      {
        children
      }
    </button>
  );
}

function ExamRow({
  label,

  value,

  onChange,
}: {
  label:
    string;

  value:
    boolean | null;

  onChange:
    (
      value:
        boolean,
    ) =>
      void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
      <div className="text-[11px] font-bold text-[#16253B]">
        {
          label
        }
      </div>

      <div
        role="radiogroup"
        aria-label={
          label
        }
        className="flex gap-2"
      >
        <Choice
          selected={
            value ===
            true
          }
          onClick={
            () =>
              onChange(
                true,
              )
          }
        >
          Ja
        </Choice>

        <Choice
          selected={
            value ===
            false
          }
          onClick={
            () =>
              onChange(
                false,
              )
          }
        >
          Nein
        </Choice>
      </div>
    </div>
  );
}

export function ExamInformationSection({
  theoryPassed,

  practicalPassed,

  onTheoryChange,

  onPracticalChange,
}: ExamInformationSectionProps) {
  return (
    <div className="divide-y divide-[#EDF1F5]">
      <ExamRow
        label="Theorie bestanden?"
        value={
          theoryPassed
        }
        onChange={
          onTheoryChange
        }
      />

      <ExamRow
        label="Praxis bestanden?"
        value={
          practicalPassed
        }
        onChange={
          onPracticalChange
        }
      />
    </div>
  );
}
