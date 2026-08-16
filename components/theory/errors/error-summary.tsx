"use client";

import { AlertTriangle, CheckCircle2, Target } from "lucide-react";
import type { TheoryErrorItem } from "@/components/theory/errors/error-question-card";

export interface ErrorSummaryProps {
  questions: readonly TheoryErrorItem[];
}

export function ErrorSummary({ questions }: ErrorSummaryProps) {
  const totalIncorrect = questions.reduce((sum, item) => sum + item.incorrectCount, 0);
  const totalAttempts = questions.reduce((sum, item) => sum + item.attemptCount, 0);
  const topics = new Set(questions.map((item) => item.topicId)).size;

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <SummaryCard icon={AlertTriangle} label="Zu wiederholen" value={questions.length} />
      <SummaryCard icon={Target} label="Betroffene Themen" value={topics} />
      <SummaryCard icon={CheckCircle2} label="Bisherige Versuche" value={totalAttempts} secondary={`${totalIncorrect} falsche Antworten`} />
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  secondary,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: number;
  secondary?: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#E5EAF2] bg-white p-4">
      <Icon className="h-4 w-4 text-[#0B63F6]" aria-hidden="true" />
      <p className="mt-2 text-[20px] font-extrabold text-[#081529]">{value}</p>
      <p className="text-[8px] font-semibold text-[#718094]">{label}</p>
      {secondary ? <p className="mt-1 text-[8px] text-[#8A98AA]">{secondary}</p> : null}
    </div>
  );
}
