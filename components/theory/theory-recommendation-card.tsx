"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type {
  TheoryRecommendationView,
} from "@/types/theory";

export interface TheoryRecommendationCardProps {
  recommendation: TheoryRecommendationView;
}

export function TheoryRecommendationCard({
  recommendation,
}: TheoryRecommendationCardProps) {
  return (
    <article className="rounded-[14px] border border-[#DDE8F8] bg-[#F8FBFF] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B63F6] shadow-sm">
          <Sparkles className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[10px] font-extrabold text-[#081529]">
            {recommendation.title}
          </h3>

          <p className="mt-1 text-[9px] leading-4 text-[#66758A]">
            {recommendation.description}
          </p>

          <Link
            href={recommendation.href}
            className="mt-2 inline-flex items-center gap-1 text-[9px] font-extrabold text-[#0B63F6]"
          >
            Jetzt öffnen
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
