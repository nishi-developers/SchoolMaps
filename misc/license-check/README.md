# License Check Scripts

このディレクトリには、SchoolMapsプロジェクトの依存パッケージのMITライセンス互換性をチェックするためのPythonスクリプトが含まれています。

## スクリプト一覧

- `check_license_compatibility.py`: 依存パッケージのライセンス情報を解析し、MIT互換性をチェックします。

## 使用方法

### 簡易的なライセンスサマリーの取得

``` bash
npx license-checker --summary
```

### プロジェクトのチェック

```bash
cd /path/to/project
npm install
npx license-checker --json > /tmp/licenses.json
python3 ../misc/license-check/check_license_compatibility.py <package-prefix> /tmp/licenses.json
```

package-prefixは、チェック対象のプロジェクトに応じて以下のいずれかを指定します：

- Webプロジェクトの場合: `school-maps@`
- Toolsプロジェクトの場合: `tools@`

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
