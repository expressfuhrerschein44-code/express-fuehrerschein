"use client";

import {
  useEffect,
} from "react";

export function PwaRegister() {
  useEffect(
    () => {
      if (
        typeof window ===
          "undefined" ||
        !(
          "serviceWorker" in
          navigator
        )
      ) {
        return;
      }

      function register() {
        void navigator.serviceWorker
          .register(
            "/sw.js",
            {
              scope:
                "/",
              updateViaCache:
                "none",
            },
          )
          .then(
            (
              registration,
            ) => {
              void registration.update();
            },
          )
          .catch(
            (
              error,
            ) => {
              console.error(
                "[PWA_SERVICE_WORKER_REGISTRATION_ERROR]",
                error,
              );
            },
          );
      }

      if (
        document.readyState ===
        "complete"
      ) {
        register();

        return;
      }

      window.addEventListener(
        "load",
        register,
        {
          once:
            true,
        },
      );

      return () => {
        window.removeEventListener(
          "load",
          register,
        );
      };
    },
    [],
  );

  return null;
}
