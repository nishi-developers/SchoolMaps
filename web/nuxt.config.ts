// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from "fs";
import { resolve } from "path";

// package.jsonからバージョンを動的に読み込み
const packageJson = JSON.parse(readFileSync(resolve("./package.json"), "utf-8"));

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  spaLoadingTemplate: "spa-loading-template.html",
  css: ["@/assets/styles/main.scss"],
  modules: ["@nuxt/eslint", "@nuxt/fonts", "@nuxt/scripts", "@nuxt/image", "@nuxt/test-utils", "@vite-pwa/nuxt"],
  runtimeConfig: {
    public: {
      systemVersion: packageJson.version || "unknown",
      buildDate: new Date().toISOString(),
      headerHeightPx: 50,
    },
  },
  fonts: {
    families: [
      {
        name: "Noto Sans JP",
        provider: "google",
        weights: ["400", "700"],
        styles: ["normal"],
      },
    ],
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: "G-T8T5WHTM3B",
      },
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/_variables.scss";',
        },
      },
    },
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      titleTemplate: "西高マップ - %s",
      meta: [
        { charset: "utf-8" },
        { name: "robots", content: "noindex,nofollow,noarchive" },
        { name: "theme-color", content: "#bee0ff" },
        { name: "description", content: "東京都立西高等学校の校内マップです。" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: "https://maps.nishi-h.net" },
        { property: "og:title", content: "西高マップ" },
        { property: "og:type", content: "website" },
        { property: "og:description", content: "東京都立西高等学校の校内マップです。" },
        { property: "og:image", content: "https://maps.nishi-h.net/seo/ogp.jpg" },
        { property: "og:site_name", content: "西高マップ" },
        { property: "og:locale", content: "ja_JP" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", sizes: "any", href: "/icons/icon.svg" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
      ],
    },
  },
  pwa: {
    // version: packageJson.version,
    registerType: "autoUpdate",
    injectRegister: null,
    includeAssets: ["index.html"],
    devOptions: {
      enabled: true,
      type: "module",
    },
    manifest: {
      // https://developer.mozilla.org/en-US/docs/Web/Manifest
      background_color: "#f3f9ff",
      categories: ["education", "navigation", "utilities"],
      description: "東京都立西高等学校の校内マップです",
      display: "standalone",
      icons: [
        {
          src: "favicon.ico",
          sizes: "any",
          type: "image/x-icon",
        },
        {
          src: "icons/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
        },
        {
          src: "icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/android-chrome-maskable-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "icons/android-chrome-maskable-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "icons/apple-touch-icon-60x60.png",
          sizes: "60x60",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/apple-touch-icon-76x76.png",
          sizes: "76x76",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/apple-touch-icon-120x120.png",
          sizes: "120x120",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/msapplication-icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "icons/mstile-150x150.png",
          sizes: "150x150",
          type: "image/png",
          purpose: "any",
        },
      ],
      name: "西高マップ",
      short_name: "西高マップ",
      shortcuts: [
        {
          name: "マップ",
          url: "/",
          icons: [{ src: "icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
        },
        {
          name: "検索",
          url: "/search",
          icons: [{ src: "icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
        },
        {
          name: "使い方",
          url: "/guide",
          icons: [{ src: "icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
        },
        {
          name: "サイトについて",
          url: "/about",
          icons: [{ src: "icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
        },
      ],
      start_url: "/",
      theme_color: "#bee0ff",
      screenshots: [
        {
          src: "seo/screenshot-map.jpg",
          sizes: "630x1200",
          type: "image/png",
        },
        {
          src: "seo/screenshot-search.jpg",
          sizes: "630x1200",
          type: "image/png",
        },
      ],
    },
    strategies: "generateSW",
    workbox: {
      skipWaiting: true, // 新しいService Workerがインストールされたら即座にアクティブ化
      clientsClaim: true, // Service Workerがアクティブ化されたらすぐにページを制御
      cleanupOutdatedCaches: true, // 古いキャッシュを自動的に削除
      // SPA対応
      navigateFallback: "/", // プリキャッシュされていないURLにアクセスした場合に/を返す
      navigateFallbackAllowlist: [/^(?!\/(api|__nuxt)).*/], // /apiや/__nuxtへのアクセスは除外
      // PreCache
      globPatterns: ["**/*.{js,css,html,ico,txt,png,svg,json}"],
      additionalManifestEntries: [{ url: "/", revision: null }], // globPatternsに含まれないファイルを明示的にPreCacheに追加
      // RunTime Cache
      runtimeCaching: [
        {
          // API version
          urlPattern: ({ url }) => url.pathname.startsWith("/api/map-version"),
          handler: "NetworkFirst",
          method: "GET",
          options: {
            cacheName: "api-version",
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 1,
              maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days(オフライン時にはapi-versionもキャッシュが必要だから)
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // API assets
          urlPattern: ({ url }) => url.pathname.startsWith("/api/assets/"),
          handler: "CacheFirst",
          method: "GET",
          options: {
            cacheName: "api-assets",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Iconify icons
          urlPattern: ({ url }) => url.origin === "https://api.iconify.design",
          handler: "CacheFirst",
          method: "GET",
          options: {
            cacheName: "iconify-icons",
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
});
