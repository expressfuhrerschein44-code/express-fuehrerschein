"use client";

import {
  CalendarCheck2,
  Lightbulb,
  Target,
} from "lucide-react";

export function TheoryTipsCard() {
  const tips = [
    {
      id: "regular",
      icon: CalendarCheck2,
      title: "Lerne regelmäßig",
      text: "Kurze, regelmäßige Einheiten helfen dir, Wissen dauerhaft zu festigen.",
    },
    {
      id: "understand",
      icon: Lightbulb,
      title: "Verstehe, nicht auswendig lernen",
      text: "Nutze Erklärungen und Beispiele, um die Regeln wirklich zu verstehen.",
    },
    {
      id: "simulate",
      icon: Target,
      title: "Mache Simulationen",
      text: "Teste regelmäßig deinen aktuellen Stand unter Prüfungsbedingungen.",
    },
  ];

  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Tipps für deinen Erfolg
      </h2>

      <div className="mt-4 space-y-3">
        {tips.map((tip) => {
          const Icon = tip.icon;

          return (
            <div
              key={tip.id}
              className="flex gap-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F6FF] text-[#0B63F6]">
                <Icon className="h-4 w-4" />
              </span>

              <div>
                <p className="text-[9px] font-extrabold text-[#081529]">
                  {tip.title}
                </p>

                <p className="mt-0.5 text-[8px] leading-3.5 text-[#66758A]">
                  {tip.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
