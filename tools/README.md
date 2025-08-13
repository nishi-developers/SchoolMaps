# SchoolMaps Tools

このディレクトリには、SchoolMapsプロジェクトのデータ処理ツールが含まれています。

## 概要

SchoolMaps Toolsは、Affinity DesignerやInkscapeで作成されたSVGマップファイルを、Webアプリケーションで使用可能な形式に変換するためのツールセットです。

## ツール構成

### 1. MapConverter (`1MapConverter.ts`)

- **目的**: 生のSVGファイルをWebアプリ用に最適化し、関連ファイルを生成
- **処理内容**:
  - XML/DOCTYPE宣言の削除
  - Inkscape/Affinity Designer特有の属性の変換・削除
  - SVG構造の平坦化
  - mode, floor, behavior, place属性の設定
  - modes, floors, behaviors設定ファイルの生成

### 2. PlacesCreater (`2PlacesCreater.ts`)

- **目的**: SVGからプレイス（場所）データのCSVテンプレートを生成
- **処理内容**:
  - place属性を持つ要素の抽出
  - CSVフォーマットでのデータ出力
  - behavior設定に基づくフィルタリング
  - behaviors設定ファイルの生成

### 3. DataRegister (`3DataRegister.ts`)

- **目的**: 編集済みCSVデータを最終的なJSON形式に変換して配置
- **処理内容**:
  - CSVからJSONへの変換
  - Webアプリケーション用ディレクトリへの配置

## 使用方法

### ツールの実行

```bash
npm run 1 # マップコンバーター
npm run 2 # プレイスデータ作成
npm run 3 # データ登録
```

### 開発用コマンド

```bash
npm run build      # TypeScriptコンパイル
npm run clean      # ビルドファイル削除
npm run type-check # 型チェックのみ実行
```

<!-- ## ワークフロー

1. **準備**: SVGエディターでマップを作成
   - Affinity DesignerまたはInkscapeでSVGファイルを開く
   - 全選択してPath → Object to Path（Inkscapeの場合）
   - Document Properties → Resize to content（Inkscapeの場合）
   - Plain SVGとしてエクスポート

2. **準備**: Affinity DesignerまたはInkscapeでSVGマップを作成
   - InkscapeでSVGファイルを開く
   - 全選択してPath → Object to Path
   - Extensions → Modify Path → Apply Transform（Inkscapeの場合）
   - Document Properties → Resize to content
   - Plain SVGとしてエクスポート

3. **変換**: `npm run 1` でSVGを変換

4. **データ作成**: `npm run 2` でプレイスデータのCSVテンプレートを生成

5. **手動編集**: 生成されたCSVファイルを編集して場所の詳細情報を追加

6. **登録**: `npm run 3` で最終データをWebアプリに配置 -->

## 設定

パス設定やデフォルト値は `config.ts` で管理されています。プロジェクト構造が変更された場合は、このファイルを更新してください。

## エラーハンドリング

- ファイル操作エラーは詳細なメッセージと共に表示されます
- 型安全性を重視した実装により、ランタイムエラーを最小限に抑えています
- 各ツールは独立して実行可能で、エラー時は適切な終了コードを返します

## 技術スタック

- **TypeScript**: 型安全性とコード品質の向上
- **@svgdotjs/svg.js**: SVG操作ライブラリ
- **svgdom**: サーバーサイドSVG操作のためのDOM実装
- **Node.js**: ランタイム環境
