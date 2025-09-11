import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";

declare let self: ServiceWorkerGlobalScope;

// Service Workerのライフサイクル管理
self.skipWaiting(); // 待機をスキップして即座にアクティベート
clientsClaim(); // すべてのクライアントを制御

// PreCache
// api以外のフロントエンドの色々
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// SPA ナビゲーション用フォールバック ("/" や他のルートを precache 済み index.html へ誘導)
// non-precached-url ("/") エラー対策。/index.html は precache 済みだが "/" は別 URL として扱われるため。
registerRoute(
  ({ request, url }) =>
    request.mode === "navigate" && // 通常のページ遷移
    !url.pathname.startsWith("/api"), // API は除外
  createHandlerBoundToURL("/index.html")
);

// RunTime Cache
// API version
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/map-version"),
  new NetworkFirst({
    cacheName: "api-version",
    networkTimeoutSeconds: 3, // ネットワークタイムアウトを3秒に設定
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

// API assets
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

// キャッシュ削除メッセージの受信
self.addEventListener("message", async (event) => {
  if (event.data.action === "DELETE_API_ASSETS_CACHE") {
    await caches.delete("api-assets");
    event.ports[0]?.postMessage({ success: true }); // 処理完了を通知
  }
});
