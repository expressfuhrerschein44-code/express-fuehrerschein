"use client";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Download,
  Share2,
  Smartphone,
  X,
} from "lucide-react";

interface BeforeInstallPromptEvent
  extends Event {
  prompt:
    () => Promise<void>;

  userChoice:
    Promise<{
      outcome:
        "accepted" |
        "dismissed";

      platform:
        string;
    }>;
}

interface NavigatorWithStandalone
  extends Navigator {
  standalone?:
    boolean;
}

const DISMISSED_KEY =
  "express-fuehrerschein-pwa-install-dismissed-v1";

function isStandaloneMode():
  boolean {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    (
      navigator as
        NavigatorWithStandalone
    ).standalone ===
      true
  );
}

function isIosDevice():
  boolean {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return false;
  }

  const userAgent =
    navigator.userAgent
      .toLowerCase();

  const touchMac =
    navigator.platform ===
      "MacIntel" &&
    navigator.maxTouchPoints >
      1;

  return (
    /iphone|ipad|ipod/.test(
      userAgent,
    ) ||
    touchMac
  );
}

export function PwaInstallPrompt() {
  const [
    installEvent,
    setInstallEvent,
  ] =
    useState<
      BeforeInstallPromptEvent | null
    >(
      null,
    );

  const [
    visible,
    setVisible,
  ] =
    useState(
      false,
    );

  const [
    ios,
    setIos,
  ] =
    useState(
      false,
    );

  const [
    installing,
    setInstalling,
  ] =
    useState(
      false,
    );

  const canInstall =
    Boolean(
      installEvent,
    );

  const title =
    useMemo(
      () =>
        ios
          ? "Express-Führerschein auf dem iPhone installieren"
          : "Express-Führerschein App installieren",
      [
        ios,
      ],
    );

  useEffect(
    () => {
      if (
        isStandaloneMode()
      ) {
        return;
      }

      if (
        window.localStorage.getItem(
          DISMISSED_KEY,
        ) ===
        "1"
      ) {
        return;
      }

      const iosDevice =
        isIosDevice();

      setIos(
        iosDevice,
      );

      const handleBeforeInstallPrompt =
        (
          event:
            Event,
        ) => {
          event.preventDefault();

          setInstallEvent(
            event as
              BeforeInstallPromptEvent,
          );

          setVisible(
            true,
          );
        };

      const handleInstalled =
        () => {
          setVisible(
            false,
          );

          setInstallEvent(
            null,
          );
        };

      window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.addEventListener(
        "appinstalled",
        handleInstalled,
      );

      let timer:
        number |
        null =
        null;

      if (
        iosDevice
      ) {
        timer =
          window.setTimeout(
            () => {
              if (
                !isStandaloneMode()
              ) {
                setVisible(
                  true,
                );
              }
            },
            1800,
          );
      }

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );

        window.removeEventListener(
          "appinstalled",
          handleInstalled,
        );

        if (
          timer !==
          null
        ) {
          window.clearTimeout(
            timer,
          );
        }
      };
    },
    [],
  );

  function dismiss() {
    setVisible(
      false,
    );

    window.localStorage.setItem(
      DISMISSED_KEY,
      "1",
    );
  }

  async function install() {
    if (
      !installEvent ||
      installing
    ) {
      return;
    }

    setInstalling(
      true,
    );

    try {
      await installEvent.prompt();

      const choice =
        await installEvent.userChoice;

      if (
        choice.outcome ===
        "accepted"
      ) {
        setVisible(
          false,
        );
      }

      setInstallEvent(
        null,
      );
    } finally {
      setInstalling(
        false,
      );
    }
  }

  if (
    !visible ||
    isStandaloneMode()
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Express-Führerschein App installieren"
      className="fixed inset-x-3 bottom-[76px] z-[90] mx-auto max-w-[430px] rounded-[18px] border border-[#DDE6F1] bg-white p-4 shadow-[0_18px_55px_rgba(2,9,20,0.20)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:mx-0"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-[#DCE5F0] bg-[#020914]">
          <Image
            src="/icons/app-icon-192.png"
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black leading-4 text-[#081529]">
            {title}
          </p>

          <p className="mt-1 text-[8px] font-medium leading-4 text-[#6E7D91]">
            Öffne deinen Kundenbereich schneller direkt vom Home-Bildschirm.
          </p>
        </div>

        <button
          type="button"
          onClick={
            dismiss
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#7D8B9D] transition hover:bg-[#F3F6FA] hover:text-[#34445A]"
          aria-label="Installationshinweis schließen"
        >
          <X
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      </div>

      {ios ? (
        <div className="mt-3 rounded-[13px] border border-[#E6EBF2] bg-[#F8FAFD] px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <Share2
              className="mt-0.5 h-4 w-4 shrink-0 text-[#0B63F6]"
              aria-hidden="true"
            />

            <div className="text-[8px] font-semibold leading-4 text-[#526278]">
              <p>
                1. Tippe in Safari auf <strong>Teilen</strong>.
              </p>

              <p className="mt-1">
                2. Wähle <strong>„Zum Home-Bildschirm“</strong>.
              </p>

              <p className="mt-1">
                3. Tippe auf <strong>„Hinzufügen“</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={
            !canInstall ||
            installing
          }
          onClick={() =>
            void install()
          }
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canInstall ? (
            <Download
              className="h-4 w-4"
              aria-hidden="true"
            />
          ) : (
            <Smartphone
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          {installing
            ? "Installation..."
            : "App installieren"}
        </button>
      )}
    </aside>
  );
}
