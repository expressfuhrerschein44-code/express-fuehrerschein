"use client";

import {
  AlertTriangle,
  Info,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import {
  LessonMediaBlock,
} from "@/components/theory/lesson/lesson-media-block";
import {
  LessonQuestionBlock,
} from "@/components/theory/lesson/lesson-question-block";

export type LessonContentBlockType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "INFO"
  | "WARNING"
  | "TIP"
  | "EXAMPLE"
  | "QUESTION";

export interface LessonContentBlockData {
  id: string;
  type: LessonContentBlockType | string;
  title?: string | null;
  text?: string | null;
  content?: unknown;
  mediaStoragePath?: string | null;
  mediaUrl?: string | null;
  mediaAlt?: string | null;
  questionId?: string | null;
  config?: unknown;
}

export interface LessonContentBlockProps {
  block: LessonContentBlockData;
  onQuestionResolved?: () => Promise<void> | void;
}

function normalizedType(value: string): LessonContentBlockType {
  const type = value.trim().toUpperCase();
  const allowed = new Set<LessonContentBlockType>([
    "TEXT",
    "IMAGE",
    "VIDEO",
    "INFO",
    "WARNING",
    "TIP",
    "EXAMPLE",
    "QUESTION",
  ]);

  return allowed.has(type as LessonContentBlockType)
    ? type as LessonContentBlockType
    : "TEXT";
}

function mediaAlt(block: LessonContentBlockData): string | null {
  if (block.mediaAlt) return block.mediaAlt;
  if (!block.content || typeof block.content !== "object" || Array.isArray(block.content)) {
    return null;
  }

  const record = block.content as Record<string, unknown>;
  return typeof record.alt === "string"
    ? record.alt
    : typeof record.altText === "string"
      ? record.altText
      : null;
}

export function LessonContentBlock({
  block,
  onQuestionResolved,
}: LessonContentBlockProps) {
  const type = normalizedType(block.type);

  if (type === "IMAGE" || type === "VIDEO") {
    return (
      <LessonMediaBlock
        blockId={block.id}
        type={type}
        title={block.title}
        text={block.text}
        mediaStoragePath={block.mediaUrl ?? block.mediaStoragePath}
        mediaAlt={mediaAlt(block)}
      />
    );
  }

  if (type === "QUESTION" && block.questionId) {
    return (
      <LessonQuestionBlock
        questionId={block.questionId}
        title={block.title}
        text={block.text}
        onResolved={onQuestionResolved}
      />
    );
  }

  const callout =
    type === "INFO"
    || type === "WARNING"
    || type === "TIP"
    || type === "EXAMPLE";

  if (callout) {
    const Icon =
      type === "WARNING"
        ? AlertTriangle
        : type === "TIP"
          ? Lightbulb
          : type === "EXAMPLE"
            ? Sparkles
            : Info;

    const tone =
      type === "WARNING"
        ? "border-[#F8D9A6] bg-[#FFFBF2] text-[#B06B00]"
        : type === "TIP"
          ? "border-[#C9E8DA] bg-[#F5FCF8] text-[#0B8B59]"
          : "border-[#D8E6F8] bg-[#F7FAFF] text-[#0B63F6]";

    return (
      <aside className={`rounded-[16px] border p-4 sm:p-5 ${tone}`}>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            {block.title ? (
              <h2 className="text-[11px] font-extrabold text-[#081529]">
                {block.title}
              </h2>
            ) : null}

            {block.text ? (
              <p className="mt-1 whitespace-pre-line text-[10px] leading-5 text-[#5F6F84] sm:text-[11px] sm:leading-6">
                {block.text}
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.025)] sm:p-5 lg:p-6">
      {block.title ? (
        <h2 className="text-[15px] font-extrabold leading-6 text-[#081529] sm:text-[16px]">
          {block.title}
        </h2>
      ) : null}

      {block.text ? (
        <p className="mt-2 whitespace-pre-line text-[11px] leading-6 text-[#53647A] sm:text-[12px] sm:leading-7">
          {block.text}
        </p>
      ) : null}
    </article>
  );
}
