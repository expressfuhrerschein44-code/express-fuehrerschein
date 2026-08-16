"use client";

import Link from "next/link";
import {
  Bookmark,
  MessageSquareText,
  Shuffle,
  XCircle,
} from "lucide-react";

export function QuickAccessCard() {
  const actions = [
    {
      id: "random",
      href: "/theorie/uebungen?mode=random",
      label: "Zufällige Fragen",
      icon: Shuffle,
    },
    {
      id: "errors",
      href: "/theorie/fehler",
      label: "Meine Fehler",
      icon: XCircle,
    },
    {
      id: "favorites",
      href: "/theorie/favoriten",
      label: "Markierte Fragen",
      icon: Bookmark,
    },
    {
      id: "notes",
      href: "/theorie?panel=notizen",
      label: "Notizen",
      icon: MessageSquareText,
    },
  ];

  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Schnellzugriff
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              href={action.href}
              className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border border-[#E8EDF4] bg-[#FBFCFE] px-2 text-center transition hover:border-[#CFE0FA] hover:bg-[#F7FAFF]"
            >
              <Icon className="h-5 w-5 text-[#0B63F6]" />
              <span className="text-[8px] font-extrabold leading-3 text-[#24344A]">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
