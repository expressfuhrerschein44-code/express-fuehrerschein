"use client";

import {
  useState,
} from "react";

import {
  Bookmark,
  Flag,
  Loader2,
} from "lucide-react";

export interface QuestionActionsProps {
  favorite?: boolean;

  favoriteSupported?: boolean;

  onFavoriteChange?: (
    favorite: boolean,
  ) => Promise<void> | void;

  onReport?: () => Promise<void> | void;
}

export function QuestionActions({
  favorite = false,
  favoriteSupported = true,
  onFavoriteChange,
  onReport,
}: QuestionActionsProps) {
  const [
    favoriteBusy,
    setFavoriteBusy,
  ] =
    useState(false);

  const [
    reportBusy,
    setReportBusy,
  ] =
    useState(false);

  const favoriteAvailable =
    favoriteSupported &&
    Boolean(onFavoriteChange);

  async function handleFavorite(): Promise<void> {
    if (
      !favoriteAvailable ||
      favoriteBusy
    ) {
      return;
    }

    setFavoriteBusy(true);

    try {
      await onFavoriteChange?.(
        !favorite,
      );
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function handleReport(): Promise<void> {
    if (
      !onReport ||
      reportBusy
    ) {
      return;
    }

    setReportBusy(true);

    try {
      await onReport();
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={
          !favoriteAvailable ||
          favoriteBusy
        }
        aria-pressed={favorite}
        onClick={() => {
          void handleFavorite();
        }}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E0E6EF] px-3 text-[9px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {favoriteBusy ? (
          <Loader2
            className="h-3.5 w-3.5 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Bookmark
            className={`h-3.5 w-3.5 ${
              favorite
                ? "fill-current text-[#0B63F6]"
                : ""
            }`}
            aria-hidden="true"
          />
        )}

        {favorite
          ? "Markiert"
          : "Frage merken"}
      </button>

      {onReport ? (
        <button
          type="button"
          disabled={reportBusy}
          onClick={() => {
            void handleReport();
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-[9px] font-semibold text-[#718094] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {reportBusy ? (
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Flag
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          )}

          Problem melden
        </button>
      ) : null}
    </div>
  );
}