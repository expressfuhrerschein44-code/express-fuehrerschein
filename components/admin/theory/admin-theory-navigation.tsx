"use client";

export type AdminTheorySection =
  | "programs"
  | "topics"
  | "lessons"
  | "questions"
  | "exams"
  | "reports"
  | "candidates";

export function AdminTheoryNavigation({
  value,
  onChange,
}: {
  value: AdminTheorySection;
  onChange: (value: AdminTheorySection) => void;
}) {
  const items: Array<{
    value: AdminTheorySection;
    label: string;
  }> = [
    { value: "programs", label: "Programme" },
    { value: "topics", label: "Themen" },
    { value: "lessons", label: "Lektionen" },
    { value: "questions", label: "Fragen" },
    { value: "exams", label: "Prüfungen" },
    { value: "reports", label: "Meldungen" },
    { value: "candidates", label: "Kandidaten" },
  ];

  return (
    <div className="overflow-x-auto rounded-[16px] border border-[#E1E8F2] bg-white p-1.5">
      <div className="flex min-w-max gap-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "rounded-xl px-4 py-2.5 text-[10px] font-extrabold transition",
              value === item.value
                ? "bg-[#0B63F6] text-white shadow-sm"
                : "text-[#66778C] hover:bg-[#F3F6FA] hover:text-[#1F334D]",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
