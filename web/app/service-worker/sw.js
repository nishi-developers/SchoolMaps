import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// プリキャッシュの設定
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

console.log("Service Worker is running...");

// API version キャッシュ
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/map-version"),
  new NetworkFirst({
    cacheName: "api-version",
    // networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 60 * 1, // 1分
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// API assets キャッシュ
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/assets/"),
  new CacheFirst({
    cacheName: "api-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Service Workerの即座のアクティベーション
self.addEventListener("install", () => {
  console.log("Service Worker installing...");
  self.skipWaiting(); // 待機をスキップして即座にアクティベート
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(self.clients.claim()); // すべてのクライアントをコントロール
});
