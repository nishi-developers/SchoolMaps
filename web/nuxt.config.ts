// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from "fs";
import { resolve } from "path";

// package.jsonからバージョンを動的に読み込み
const packageJson = JSON.parse(readFileSync(resolve("./package.json"), "utf-8"));

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  css: ["@/assets/styles/main.scss"],
  modules: ["@nuxt/eslint", "@nuxt/fonts", "@nuxt/icon", "@nuxt/scripts", "@nuxt/image", "@nuxt/test-utils"],
  runtimeConfig: {
    public: {
      systemVersion: packageJson.version || "unknown",
      mapVersion: "0.4.0",
      buildDate: new Date().toISOString(),
    },
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
    head: {
      title: "西高マップ",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
        { name: "robots", content: "noindex,nofollow,noarchive" },
        { name: "theme-color", content: "#bee0ff" },
        { name: "description", content: "東京都立西高等学校の校内マップです。" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: "https://maps.nishi-h.net" },
        { property: "og:title", content: "西高マップ" },
        { property: "og:type", content: "website" },
        { property: "og:description", content: "東京都立西高等学校の校内マップです。" },
        { property: "og:image", content: "https://maps.nishi-h.net/img/seo/ogp.jpg" },
        { property: "og:site_name", content: "西高マップ" },
        { property: "og:locale", content: "ja_JP" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.ico" },
        { rel: "icon", type: "image/svg+xml", sizes: "any", href: "/img/icons/icon.svg" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/img/icons/apple-touch-icon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap",
        },
      ],
    },
  },
});
