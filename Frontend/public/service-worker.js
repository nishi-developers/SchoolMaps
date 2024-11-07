// self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

const SYS_VERSION = '0.1.0'
const MAP_VERSION = '0.1.0'
const DEBUG_UUID = 'lawkfja5'

// バージョン情報を返す
self.addEventListener('message', (event) => {
  if (event.data.type == 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', sys: SYS_VERSION, map: MAP_VERSION })
  }
})

// キャッシュ
// https://qiita.com/OMOIKANESAN/items/13a3dde525e33eb608ae

const urlsToCache = [
  '/',
  '/SchoolMap/0',
  'index.html',
  'manifest.json',
  'static/assets/0.js',
  'static/assets/1.js',
  'static/assets/2.js',
  'static/assets/3.js',
  'static/assets/404.css',
  'static/assets/404.js',
  'static/assets/About.css',
  'static/assets/About.js',
  'static/assets/Guide.css',
  'static/assets/Guide.js',
  'static/assets/index.css',
  'static/assets/index.js',
  'static/assets/Map.css',
  'static/assets/Map.js',
  // 'static/assets/PlaceInfo.css',
  'static/assets/PlaceInfo.js',
  'static/assets/Search.css',
  'static/assets/Search.js',
  'favicon.ico',
  'img/icons/android-chrome-192x192.png',
  'img/icons/android-chrome-512x512.png',
  'img/icons/android-chrome-maskable-192x192.png',
  'img/icons/android-chrome-maskable-512x512.png',
  'img/icons/apple-touch-icon-60x60.png',
  'img/icons/apple-touch-icon-76x76.png',
  'img/icons/apple-touch-icon-120x120.png',
  'img/icons/apple-touch-icon-152x152.png',
  'img/icons/apple-touch-icon-180x180.png',
  'img/icons/apple-touch-icon.png',
  'img/icons/favicon-16x16.png',
  'img/icons/favicon-32x32.png',
  'img/icons/msapplication-icon-144x144.png',
  'img/icons/mstile-150x150.png',
  'img/icons/safari-pinned-tab.svg'
]

const CACHE_NAME = SYS_VERSION + ':' + MAP_VERSION + ':' + DEBUG_UUID

// キャッシュのインストール
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME) // 上記で指定しているキャッシュ名
      .then(function (cache) {
        return cache.addAll(urlsToCache) // 指定したリソースをキャッシュへ追加
        // 1つでも失敗したらService Workerのインストールはスキップされる
      })
  )
})

// キャッシュの削除
const CACHE_KEYS = [CACHE_NAME]

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return !CACHE_KEYS.includes(key)
          })
          .map((key) => {
            // 不要なキャッシュを削除
            return caches.delete(key)
          })
      )
    })
  )
})

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((response) => {
            cache.put(event.request, response.clone())
            return response
          })
        )
      })
    })
  )
})
