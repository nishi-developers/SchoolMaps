# License Check Scripts

このディレクトリには、SchoolMapsプロジェクトの依存パッケージのMITライセンス互換性をチェックするためのPythonスクリプトが含まれています。

## スクリプト一覧

### Web プロジェクト用

- **check_web_license_compatibility.py** - Webプロジェクトの依存パッケージのライセンス互換性をチェック
- **generate_web_license_report.py** - Webプロジェクトの詳細なライセンスレポートを生成

### Tools プロジェクト用

- **check_tools_license_compatibility.py** - Toolsプロジェクトの依存パッケージのライセンス互換性をチェック
- **generate_tools_license_report.py** - Toolsプロジェクトの詳細なライセンスレポートを生成

## 使用方法

### Webプロジェクトのチェック

```bash
cd /path/to/SchoolMaps/web
npm install
npx license-checker --json > /tmp/web-licenses.json
python3 ../misc/license-check/check_web_license_compatibility.py /tmp/web-licenses.json
```

### Webプロジェクトのレポート生成

```bash
cd /path/to/SchoolMaps/web
npm install
npx license-checker --json | python3 ../misc/license-check/generate_web_license_report.py > LICENSE_COMPATIBILITY.md
```

### Toolsプロジェクトのチェック

```bash
cd /path/to/SchoolMaps/tools
npm install
npx license-checker --json > /tmp/tools-licenses.json
python3 ../misc/license-check/check_tools_license_compatibility.py /tmp/tools-licenses.json
```

### Toolsプロジェクトのレポート生成

```bash
cd /path/to/SchoolMaps/tools
npm install
npx license-checker --json | python3 ../misc/license-check/generate_tools_license_report.py > LICENSE_COMPATIBILITY.md
```

## 必要な環境

- Python 3.6以上
- Node.js（npm installを実行するため）
- license-checker（`npx`経由で自動的にインストールされます）

## ライセンス互換性について

これらのスクリプトは、以下のライセンスをMIT互換と判定します：

- MIT, ISC
- Apache-2.0
- BSD-2-Clause, BSD-3-Clause
- 0BSD, BlueOak-1.0.0
- CC0-1.0（パブリックドメイン）
- CC-BY-3.0, CC-BY-4.0
- その他のパーミッシブライセンス

デュアルライセンス（ORで結ばれたもの）は、いずれかがMIT互換であれば問題ないと判定します。
