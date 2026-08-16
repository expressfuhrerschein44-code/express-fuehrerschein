"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

export interface ExamTimerProps {
  initialSeconds: number;
  running?: boolean;
  onExpire?: () => void;
}

export function ExamTimer({
  initialSeconds,
  running = true,
  onExpire,
}: ExamTimerProps) {
  const [seconds, setSeconds] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    setSeconds(Math.max(0, initialSeconds));
  }, [initialSeconds]);

  useEffect(() => {
    if (!running || seconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          onExpire?.();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, seconds, onExpire]);

  const formatted = useMemo(() => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${rest
      .toString()
      .padStart(2, "0")}`;
  }, [seconds]);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F6FA] px-2.5 py-1.5 text-[10px] font-extrabold text-[#081529]"
      aria-label={`Verbleibende Zeit ${formatted}`}
    >
      <Clock3 className="h-3.5 w-3.5 text-[#0B63F6]" />
      {formatted}
    </span>
  );
}
