"use client";

import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  ShieldCheck,
} from "lucide-react";

import type {
  TheoryTopicView,
} from "@/types/theory";

export interface TheoryTopicCardProps {
  topic: TheoryTopicView;
  compact?: boolean;
}

function stateLabel(
  state: TheoryTopicView["state"],
): string {
  switch (state) {
    case "completed":
      return "Abgeschlossen";
    case "review":
      return "Wiederholen";
    case "in_progress":
      return "In Bearbeitung";
    default:
      return "Nicht begonnen";
  }
}

function StateIcon({
  state,
}: {
  state: TheoryTopicView["state"];
}) {
  switch (state) {
    case "completed":
      return <CircleCheck className="h-4 w-4 text-[#10A36A]" />;
    case "review":
      return <CircleAlert className="h-4 w-4 text-[#F59E0B]" />;
    case "in_progress":
      return <ShieldCheck className="h-4 w-4 text-[#0B63F6]" />;
    default:
      return <CircleDashed className="h-4 w-4 text-[#8A98AA]" />;
  }
}

export function TheoryTopicCard({
  topic,
  compact = false,
}: TheoryTopicCardProps) {
  const percent = Math.max(0, Math.min(100, topic.progressPercent));

  return (
    <Link
      href={`/theorie/${encodeURIComponent(topic.slug)}`}
      className={`group block rounded-[14px] border border-[#E5EAF2] bg-white transition hover:-translate-y-0.5 hover:border-[#CFE0FA] hover:shadow-[0_10px_28px_rgba(17,40,70,0.06)] ${
        compact ? "min-w-[220px] p-3" : "p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
          <StateIcon state={topic.state} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[11px] font-extrabold text-[#081529]">
              {topic.sortOrder}. {topic.title}
            </h3>

            <span className="shrink-0 text-[10px] font-extrabold text-[#081529]">
              {percent}%
            </span>
          </div>

          {!compact && topic.description ? (
            <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#66758A]">
              {topic.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]">
        <div
          className="h-full rounded-full bg-[#10A36A] transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[8px] text-[#6D7C90]">
        <span>
          {topic.answeredQuestions} / {topic.totalQuestions} Fragen
        </span>

        <span className="font-semibold">
          {stateLabel(topic.state)}
        </span>
      </div>
    </Link>
  );
}
