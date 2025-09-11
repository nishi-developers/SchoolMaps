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
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/scripts",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@vite-pwa/nuxt",
  ],
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
  icon: {
    aliases: {
      share: "material-symbols:share",
      close: "material-symbols:close-rounded",
      cercleClose: "material-symbols:cancel-outline-rounded",
      stairs: "material-symbols:stairs-2-rounded",
      tag: "material-symbols:tag-rounded",
      search: "material-symbols:search-rounded",
      label: "material-symbols:label-outline-rounded",
      labelOff: "material-symbols:label-off-outline-rounded",
      resetFocus: "material-symbols:reset-focus-outline-rounded",
      searchOnMap: "material-symbols:map-search-outline-rounded",
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
          sizes: "256x256",
        },
        {
          src: "icons/icon.svg",
          sizes: "1182x1182",
        },
        {
          src: "icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "icons/android-chrome-maskable-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/android-chrome-maskable-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "icons/apple-touch-icon-60x60.png",
          sizes: "60x60",
          type: "image/png",
        },
        {
          src: "icons/apple-touch-icon-76x76.png",
          sizes: "76x76",
          type: "image/png",
        },
        {
          src: "icons/apple-touch-icon-120x120.png",
          sizes: "120x120",
          type: "image/png",
        },
        {
          src: "icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: "icons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          src: "icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          src: "icons/msapplication-icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "icons/mstile-150x150.png",
          sizes: "150x150",
          type: "image/png",
        },
      ],
      name: "西高マップ",
      short_name: "西高マップ",
      shortcuts: [
        {
          name: "マップ",
          url: "/",
        },
        {
          name: "検索",
          url: "/search",
        },
        {
          name: "使い方",
          url: "/guide",
        },
        {
          name: "サイトについて",
          url: "/about",
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
    strategies: "injectManifest",
    srcDir: "./service-worker/",
    filename: "sw.ts",
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,txt,png,svg,json}"], // htmlを必ず含める
    },
  },
});
