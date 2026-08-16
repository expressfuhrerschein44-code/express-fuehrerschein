/**
 * Express-Führerschein PWA service worker.
 *
 * Important:
 * - No authenticated page or API response is cached.
 * - No payment, document, message, profile or exam data is stored offline.
 * - This worker only provides the installable PWA shell lifecycle.
 */

const VERSION = "express-fuehrerschein-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),

      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("express-fuehrerschein-") && key !== VERSION)
              .map((key) => caches.delete(key)),
          ),
        ),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
