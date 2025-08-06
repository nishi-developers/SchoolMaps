// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from "fs";
import { resolve } from "path";

// package.jsonからバージョンを動的に読み込み
const packageJson = JSON.parse(readFileSync(resolve("./package.json"), "utf-8"));

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/assets/styles/main.scss"],
  modules: ["@nuxt/eslint", "@nuxt/fonts", "@nuxt/icon", "@nuxt/scripts", "@nuxt/image", "@nuxt/test-utils"],
  runtimeConfig: {
    public: {
      systemVersion: packageJson.version || "unknown",
      mapVersion: "0.4.0",
      buildDate: new Date().toISOString(),
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
});
