import Link from "next/link";
import {
  BookOpenCheck,
  Globe2,
} from "lucide-react";

import {
  TheoryDesktop,
} from "@/components/theory/theory-desktop";
import {
  TheoryMobile,
} from "@/components/theory/theory-mobile";

import type {
  TheoryExamRuleView,
  TheoryOverviewData,
} from "@/types/theory";

export interface TheoryPageProps {
  data: TheoryOverviewData;
  examRules?: readonly TheoryExamRuleView[];
}

function TheorySetupState({
  type,
}: {
  type: "license" | "country";
}) {
  const license = type === "license";

  return (
    <div className="mx-auto flex min-h-[420px] max-w-[900px] items-center justify-center px-3 py-8 lg:px-7">
      <div className="w-full rounded-[18px] border border-dashed border-[#D7E0EC] bg-white px-5 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF5FF] text-[#0B63F6]">
          {license ? (
            <BookOpenCheck className="h-5 w-5" />
          ) : (
            <Globe2 className="h-5 w-5" />
          )}
        </span>

        <h1 className="mt-4 text-[18px] font-extrabold text-[#081529]">
          {license
            ? "Führerscheinklasse auswählen"
            : "Theorieprogramm wird vorbereitet"}
        </h1>

        <p className="mx-auto mt-2 max-w-[560px] text-[11px] leading-5 text-[#66758A]">
          {license
            ? "Wähle zuerst deine Führerscheinklasse. Danach wird dein passendes Theorieprogramm geladen."
            : "Für dein Land wird nur das passende, freigegebene Theorieprogramm angezeigt. Es werden keine Inhalte anderer Länder vermischt."}
        </p>

        <Link
          href={license ? "/mein-fuehrerschein" : "/hilfe-support"}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC]"
        >
          {license
            ? "Mein Führerschein öffnen"
            : "Support kontaktieren"}
        </Link>
      </div>
    </div>
  );
}

export function TheoryPage({
  data,
  examRules = [],
}: TheoryPageProps) {
  if (data.status === "license_class_required") {
    return <TheorySetupState type="license" />;
  }

  if (data.status === "country_program_unavailable") {
    return <TheorySetupState type="country" />;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 py-5 lg:px-7 lg:py-7">
      <TheoryDesktop
        data={data}
        examRules={examRules}
      />

      <TheoryMobile
        data={data}
        examRules={examRules}
      />
    </div>
  );
}
