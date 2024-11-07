import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
  base: 'SchoolMap'
})
