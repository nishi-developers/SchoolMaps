# SchoolMaps

東京都立西高等学校の校内マップです。

[PV映像](https://youtu.be/o8RLhzpfBVg)

## ライセンス

### プログラム

本リポジトリのプログラムは[MITライセンス](./LICENSE)の下で提供されます。

### マップデータ

[mapsディレクトリ](./maps)内を始めとする、プログラムを除くマップデータに関しては、西高生に限り自由に利用可能です。
西高生以外のサイト観覧を制限するものではありませんが、マップデータのサイト外利用はご遠慮ください。

## メモ

```shell
nohup env PORT=3002 node /var/www/temp.m-haru.net/node/SchoolMaps/web/.output/server/index.mjs &
```

デフォルトでは、sw.jsの読み込みは、pluginsより遅い
swは登録後、installやactgivateといった処理が必要

## キャッシュ戦略(古い)

本プロジェクトは PWA（@vite-pwa/nuxt, Workbox injectManifest）による「静的資産の PreCache」＋「マップ API の Runtime Cache」＋「バージョン差分による手動失効」のハイブリッド構成。

### 全体方針概要

1. ビルド生成物 (HTML / JS / CSS / 画像 / 一部 JSON) は PreCache しオフライン即時応答。
2. マップ関連データ (`/api/assets/*`) は CacheFirst で高速化しつつ、バージョン差異検出時に一括破棄。
3. バージョン識別用 `/api/map-version` は NetworkFirst（短期キャッシュ）でオンライン時は常に最新確認、オフライン時は直前バージョンで継続利用。
4. Service Worker は `skipWaiting()` と `clientsClaim()` によりビルド後すぐ置き換え・制御。

### 取得タイミング / fetch ポリシー

ページ初期ロード時、Nuxt プラグイン (`2.check-version.client.ts`) が：

- `/api/map-version` を取得 → `localStorage.mapVersion` と比較
- 差異あり & ユーザー承諾 → SW へ postMessage で `api-assets` キャッシュ削除要求 → その後 `/api/assets/*` を再取得
- 差異なし → 既存キャッシュ（初回は取得して以後再利用）
同一 SPA セッション内でページ遷移しても再取得せずメモリ上 or Cache API を利用。

### Service Worker 構成

| 対象 | Strategy | Cache 名 | 有効期限 / 制限 | 目的 |
|------|----------|----------|-----------------|------|
| ビルド生成物 (manifest 生成リスト) | PreCache | workbox-generated | 自動 (古いのは cleanupOutdatedCaches) | オフライン対応 / 即時表示 |
| `/api/map-version` | NetworkFirst | `api-version` | 1 分 / 1 entry | 最新バージョン検出・オフライン時フォールバック |
| `/api/assets/*` | CacheFirst | `api-assets` | 180 日 / 50 entries | 高速表示・帯域節約 |

実装は `web/app/service-worker/sw.ts` を injectManifest でバンドル。`nuxt.config.ts` の `pwa.strategies = "injectManifest"`。

### アップデートフロー

1. 新ビルド → 新 SW がインストール (registerType: autoUpdate)。
2. `skipWaiting()` で即 Active → `clientsClaim()` で既存タブ制御。
3. 次回 `/api/map-version` を取得した時点で差異検出 → ユーザー確認 → `api-assets` キャッシュ削除 → 再取得。
4. PreCache は Workbox が差分置換。旧キャッシュは `cleanupOutdatedCaches()` で整理。

### バージョン管理ロジック

- `/api/map-version` のレスポンス JSON `{ v: string }` を localStorage に保持。
- 差異検出時にユーザーへ confirm。拒否された場合は旧キャッシュ継続（後でリロードすれば再確認）。
- version キャッシュ (`api-version`) は削除しない：NetworkFirst で即座に最新を再取得できるため自動的に上書きされる。

### キャッシュ失効 / クリア方法

- 自動：SW 更新（旧 PreCache のクリーンアップ）。
- 手動：バージョン不一致時に postMessage `{ action: "DELETE_API_ASSETS_CACHE" }` で `api-assets` を削除。
- 強制全消去（デバッグ用途）：ブラウザ DevTools > Application > Clear Storage。

### オフライン動作

- UI/ルーティング/スタイル/主要画像は PreCache 済みで表示可能。
- 直前に取得済みのマップデータ（`api-assets` キャッシュ）があれば閲覧可。
- 未取得の新規 `api-assets` はオフライン時には取得不可（CacheFirst で不在なら失敗）。
- バージョン確認は NetworkFirst のためオフライン時は旧バージョン値で継続、再接続で更新検出。

### 追加資産を PreCache に含めるには

`nuxt.config.ts` の `workbox.globPatterns`（既定: `**/*.{js,css,html,ico,txt,png,svg,json}`）にマッチする public 出力へ配置する。拡張子追加が必要ならパターンを拡張。

### 運用ベストプラクティス（簡易チェック）

| チェック | 目的 |
|----------|------|
| build 後 `sw.js` の hash 変化 | SW 差し替え確認 |
| `/api/map-version` 応答が更新されたか | データ更新検出可否 |
| キャッシュパネルで `api-assets` 削除 → 直後再取得 | 破棄メッセージ動作検証 |
| オフライン切替でマップ表示可能か | PreCache / CacheFirst 成功 |

