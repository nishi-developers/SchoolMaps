import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  // index.htmlに環境変数を書き出す
  // https://qiita.com/JotarO_Oyanagi/items/45227341a3465dec58fe
  // https://dev.classmethod.jp/articles/vite-index-html-read-env-variables/
  const env = loadEnv(mode, process.cwd())
  const htmlPlugin = () => ({
    name: 'html-transform',
    transformIndexHtml: (html) => html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match)
  })

  return defineConfig({
    plugins: [
      htmlPlugin(),
      vue(),
      VitePWA({
        version: process.env.VITE_SYS_VERSION + ':' + process.env.VITE_MAP_VERSION,
        registerType: 'autoUpdate',
        injectregister: 'script',
        devOptions: {
          enabled: true
        },
        manifest: {
          // https://developer.mozilla.org/en-US/docs/Web/Manifest
          background_color: '#f3f9ff',
          categories: ['education', 'navigation', 'utilities'],
          description: '東京都立西高等学校の非公式マップ',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.ico',
              sizes: '256x256'
            },
            {
              src: 'img/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'img/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'img/icons/android-chrome-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'img/icons/android-chrome-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'img/icons/apple-touch-icon-60x60.png',
              sizes: '60x60',
              type: 'image/png'
            },
            {
              src: 'img/icons/apple-touch-icon-76x76.png',
              sizes: '76x76',
              type: 'image/png'
            },
            {
              src: 'img/icons/apple-touch-icon-120x120.png',
              sizes: '120x120',
              type: 'image/png'
            },
            {
              src: 'img/icons/apple-touch-icon-180x180.png',
              sizes: '180x180',
              type: 'image/png'
            },
            {
              src: 'img/icons/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png'
            },
            {
              src: 'img/icons/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png'
            },
            {
              src: 'img/icons/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png'
            },
            {
              src: 'img/icons/msapplication-icon-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: 'img/icons/mstile-150x150.png',
              sizes: '150x150',
              type: 'image/png'
            },
            {
              src: 'img/icons/safari-pinned-tab.svg',
              sizes: '11x16'
            }
          ],
          name: '西高Map',
          short_name: '西高Map',
          shortcuts: [
            {
              name: '使い方',
              url: '/guide'
            },
            {
              name: 'このサイトについて',
              url: '/about'
            },
            {
              name: '検索',
              url: '/search'
            }
          ],
          start_url: './index.html',
          theme_color: '#bee0ff'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,txt,png,svg,json}'],
          runtimeCaching: [
            // フォントのキャッシュはランタイムキャッシュで設定
            // キャッシュの種類:https://kawadev.net/vue-pwa-cache/
            // https://vite-pwa-org.netlify.app/workbox/generate-sw.html#background-sync
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      publicDir: resolve(__dirname, 'public'),
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // 出力ファイルに付与される hash を取り除く
          entryFileNames: `static/assets/[name].js`,
          chunkFileNames: `static/assets/[name].js`,
          assetFileNames: `static/assets/[name].[ext]`
        }
      }
    },
    // ルートの場合は"/"、サブディレクトリの場合は"/サブディレクトリ名/"
    base: '/SchoolMap/'
  })
}
