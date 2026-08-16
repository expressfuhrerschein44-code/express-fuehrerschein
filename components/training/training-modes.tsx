import {
  RefreshCw,
  RotateCcw,
  Zap,
} from "lucide-react";

import {
  TrainingModeCard,
} from "@/components/training/training-mode-card";

export interface TrainingModesProps {
  ready:
    boolean;
  needsReviewCount:
    number;
}

export function TrainingModes({
  ready,
  needsReviewCount,
}: TrainingModesProps) {
  return (
    <section>
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Training starten
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Wähle deinen Trainingsmodus
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Nutze das bestehende Theorie-Training passend zu deinem aktuellen Lernziel.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <TrainingModeCard
          title="Schnelltraining"
          description="Kurzes Training für zwischendurch mit einer kompakten Auswahl an Theoriefragen."
          meta="Schnell"
          href="/theorie/uebungen?mode=quick"
          icon={Zap}
          disabled={!ready}
        />

        <TrainingModeCard
          title="Zufallstraining"
          description="Trainiere gemischte Fragen aus deiner aktiven Führerscheinklasse."
          meta="Gemischt"
          href="/theorie/uebungen?mode=random"
          icon={RefreshCw}
          disabled={!ready}
        />

        <TrainingModeCard
          title="Fehlertraining"
          description="Wiederhole gezielt Fragen, bei denen du noch unsicher bist."
          meta={`${Math.max(0, needsReviewCount)} Fehler`}
          href="/fehler"
          icon={RotateCcw}
          disabled={!ready}
        />
      </div>
    </section>
  );
}
