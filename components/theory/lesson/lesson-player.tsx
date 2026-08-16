"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LessonCompletion,
} from "@/components/theory/lesson/lesson-completion";
import {
  LessonContentBlock,
} from "@/components/theory/lesson/lesson-content-block";
import {
  LessonHeader,
} from "@/components/theory/lesson/lesson-header";
import {
  LessonNavigation,
} from "@/components/theory/lesson/lesson-navigation";
import {
  LessonProgress,
} from "@/components/theory/lesson/lesson-progress";

export interface LessonPlayerBlock {
  id: string;
  type: string;
  sortOrder?: number;
  title?: string | null;
  text?: string | null;
  content?: unknown;
  mediaStoragePath?: string | null;
  mediaUrl?: string | null;
  mediaAlt?: string | null;
  questionId?: string | null;
  config?: unknown;
}

export interface LessonPlayerData {
  id: string;
  topicId?: string;
  topicSlug: string;
  slug: string;
  title: string;
  description?: string | null;
  estimatedDurationMinutes?: number | null;
  progressPercent: number;
  currentBlockIndex: number;
  completed?: boolean;
  licenseClassCode?: string | null;
  blocks: readonly LessonPlayerBlock[];
  navigation?: {
    previous?: { slug: string; title: string } | null;
    next?: { slug: string; title: string } | null;
    position?: number;
    total?: number;
  } | null;
}

export interface LessonPlayerProps {
  lesson: LessonPlayerData;
}

interface JsonEnvelope<T> {
  ok?: boolean;
  data?: T;
  error?: { message?: string };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

async function postProgress<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/theory/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
  const payload = await response.json() as JsonEnvelope<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error?.message ?? "Fortschritt konnte nicht gespeichert werden.");
  }

  return payload.data as T;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const total = lesson.blocks.length;
  const safeInitial = total > 0
    ? clamp(Math.round(lesson.currentBlockIndex), 0, total - 1)
    : 0;

  const [index, setIndex] = useState(safeInitial);
  const [highestPercent, setHighestPercent] = useState(
    clamp(Math.round(lesson.progressPercent), 0, 100),
  );
  const [busy, setBusy] = useState(false);
  const [completedNow, setCompletedNow] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resolvedQuestionBlocks, setResolvedQuestionBlocks] = useState<Set<string>>(
    () => new Set(),
  );

  const studySessionIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  const current = lesson.blocks[index] ?? null;
  const positionPercent = total > 0
    ? Math.round(((index + 1) / total) * 100)
    : 0;
  const displayPercent = Math.max(highestPercent, positionPercent);

  const isQuestion = current?.type.trim().toUpperCase() === "QUESTION";
  const questionResolved = current
    ? resolvedQuestionBlocks.has(current.id)
    : false;

  const save = useCallback(async (
    blockIndex: number,
    completed: boolean,
  ) => {
    const nextPercent = completed
      ? 100
      : total > 0
        ? Math.round(((blockIndex + 1) / total) * 100)
        : 0;
    const progressPercent = Math.max(highestPercent, nextPercent);

    await postProgress({
      action: "lesson_progress",
      lessonId: lesson.id,
      progressPercent,
      currentBlockIndex: blockIndex,
      completed,
      activeSecondsDelta: 0,
    });

    setHighestPercent(progressPercent);
  }, [highestPercent, lesson.id, total]);

  const sendStudyActivity = useCallback(async () => {
    const id = studySessionIdRef.current;
    if (!id || finishedRef.current || document.visibilityState !== "visible") return;

    const now = Date.now();
    const delta = clamp(Math.floor((now - lastActivityRef.current) / 1000), 0, 120);
    lastActivityRef.current = now;

    if (delta <= 0) return;

    try {
      await postProgress({
        action: "study_activity",
        studySessionId: id,
        activeSecondsDelta: delta,
      });
    } catch {
      // Activity heartbeat must never block the lesson UI.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const data = await postProgress<{ id?: string }>({
          action: "study_start",
          lessonId: lesson.id,
          sessionType: "lesson",
        });

        if (!cancelled && typeof data?.id === "string") {
          studySessionIdRef.current = data.id;
          lastActivityRef.current = Date.now();
        }
      } catch {
        // The lesson content remains readable even if activity tracking fails.
      }
    }

    void start();

    const interval = window.setInterval(() => {
      void sendStudyActivity();
    }, 30_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastActivityRef.current = Date.now();
      } else {
        void sendStudyActivity();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);

      const id = studySessionIdRef.current;
      if (id && !finishedRef.current) {
        void fetch("/api/theory/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "study_finish",
            studySessionId: id,
            activeSecondsDelta: 0,
            abandoned: true,
          }),
          keepalive: true,
        });
      }
    };
  }, [lesson.id, sendStudyActivity]);

  async function go(nextIndex: number) {
    if (busy || total === 0) return;

    const safe = clamp(nextIndex, 0, total - 1);
    setBusy(true);
    setSaveError(null);

    try {
      await save(safe, false);
      setIndex(safe);
      lastActivityRef.current = Date.now();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Fortschritt konnte nicht gespeichert werden.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (busy || total === 0) return;

    setBusy(true);
    setSaveError(null);

    try {
      await save(Math.max(0, total - 1), true);

      const studySessionId = studySessionIdRef.current;
      if (studySessionId && !finishedRef.current) {
        await postProgress({
          action: "study_finish",
          studySessionId,
          activeSecondsDelta: clamp(
            Math.floor((Date.now() - lastActivityRef.current) / 1000),
            0,
            120,
          ),
          abandoned: false,
        });
        finishedRef.current = true;
      }

      setHighestPercent(100);
      setCompletedNow(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Lektion konnte nicht abgeschlossen werden.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    if (index < total - 1) {
      await go(index + 1);
      return;
    }

    await complete();
  }

  async function resolveQuestionAndContinue() {
    if (!current) return;

    setResolvedQuestionBlocks((previous) => {
      const nextSet = new Set(previous);
      nextSet.add(current.id);
      return nextSet;
    });

    await next();
  }

  const header = useMemo(() => (
    <LessonHeader
      topicSlug={lesson.topicSlug}
      title={lesson.title}
      description={lesson.description}
      licenseClassCode={lesson.licenseClassCode}
      estimatedDurationMinutes={lesson.estimatedDurationMinutes}
      completed={Boolean(lesson.completed || completedNow)}
      lessonPosition={lesson.navigation?.position ?? null}
      lessonTotal={lesson.navigation?.total ?? null}
    />
  ), [completedNow, lesson]);

  if (completedNow) {
    return (
      <section className="mx-auto w-full max-w-[940px] px-3 py-5 sm:px-4 lg:px-0 lg:py-7">
        {header}
        <div className="mt-4">
          <LessonCompletion
            topicSlug={lesson.topicSlug}
            lessonTitle={lesson.title}
            nextLesson={lesson.navigation?.next ?? null}
            onReviewLesson={() => {
              setCompletedNow(false);
              setIndex(0);
              setResolvedQuestionBlocks(new Set());
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[940px] px-3 py-5 sm:px-4 lg:px-0 lg:py-7">
      {header}

      <div className="mt-4">
        <LessonProgress
          percent={displayPercent}
          currentBlock={index}
          totalBlocks={total}
        />
      </div>

      {saveError ? (
        <div className="mt-3 rounded-xl border border-[#F2CACA] bg-[#FFF7F7] px-4 py-3 text-[9px] font-semibold text-[#B73B3B]" role="alert">
          {saveError}
        </div>
      ) : null}

      <div className="mt-4">
        {current ? (
          <LessonContentBlock
            block={current}
            onQuestionResolved={resolveQuestionAndContinue}
          />
        ) : (
          <div className="rounded-[16px] border border-[#E5EAF2] bg-white p-8 text-center">
            <p className="text-[11px] font-extrabold text-[#53647A]">
              Diese Lektion enthält noch keine veröffentlichten Inhalte.
            </p>
          </div>
        )}
      </div>

      {current ? (
        <LessonNavigation
          canGoBack={index > 0}
          isLastBlock={index >= total - 1}
          busy={busy}
          nextLocked={isQuestion && !questionResolved}
          onPrevious={() => go(index - 1)}
          onNext={next}
        />
      ) : null}
    </section>
  );
}
