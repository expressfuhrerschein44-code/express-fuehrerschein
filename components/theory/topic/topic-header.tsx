import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleHelp,
  GraduationCap,
} from "lucide-react";

export interface TopicHeaderProps {
  sortOrder: number;
  title: string;
  description: string | null;
  licenseClassCode: string;
  lessonCount: number;
  questionCount: number;
}

export function TopicHeader({
  sortOrder,
  title,
  description,
  licenseClassCode,
  lessonCount,
  questionCount,
}: TopicHeaderProps) {
  return (
    <header>
      <Link
        href="/theorie"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#66758A] transition hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Theorieübersicht
      </Link>

      <section className="mt-4 overflow-hidden rounded-[20px] border border-[#E5EAF2] bg-white shadow-[0_10px_30px_rgba(17,40,70,0.05)]">
        <div className="border-b border-[#EDF1F6] px-5 py-5 sm:px-6 lg:px-7 lg:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-[760px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF5FF] px-2.5 py-1 text-[10px] font-extrabold text-[#0B63F6]">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  Klasse {licenseClassCode}
                </span>

                <span className="rounded-full border border-[#E5EAF2] bg-[#F8FAFD] px-2.5 py-1 text-[10px] font-bold text-[#66758A]">
                  Themenbereich {sortOrder}
                </span>
              </div>

              <h1 className="mt-3 text-[25px] font-extrabold tracking-[-0.025em] text-[#081529] sm:text-[29px]">
                {title}
              </h1>

              {description ? (
                <p className="mt-2 max-w-[700px] text-[12px] leading-5 text-[#66758A] sm:text-[13px] sm:leading-6">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
              <div className="rounded-[14px] border border-[#E7ECF3] bg-[#F8FAFD] p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0B63F6] shadow-sm">
                  <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-2 text-[18px] font-extrabold text-[#081529]">
                  {lessonCount}
                </p>
                <p className="text-[9px] font-semibold text-[#748397]">
                  Lektionen
                </p>
              </div>

              <div className="rounded-[14px] border border-[#E7ECF3] bg-[#F8FAFD] p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0B63F6] shadow-sm">
                  <CircleHelp className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-2 text-[18px] font-extrabold text-[#081529]">
                  {questionCount}
                </p>
                <p className="text-[9px] font-semibold text-[#748397]">
                  Fragen
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}
