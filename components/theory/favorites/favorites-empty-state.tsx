"use client";

import Link from "next/link";
import { Star } from "lucide-react";

export function FavoritesEmptyState() {
  return (
    <div className="rounded-[16px] border border-[#E5EAF2] bg-white px-5 py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF7E8] text-[#F59E0B]">
        <Star className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-[12px] font-extrabold text-[#081529]">Noch keine Favoriten</h2>
      <p className="mx-auto mt-1 max-w-[460px] text-[9px] leading-4 text-[#66758A]">
        Markiere interessante oder schwierige Fragen mit dem Stern. Sie werden hier geräteübergreifend gesammelt.
      </p>
      <Link href="/theorie/uebungen" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white">
        Jetzt üben
      </Link>
    </div>
  );
}
