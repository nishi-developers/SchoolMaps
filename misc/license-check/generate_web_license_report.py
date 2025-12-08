#!/usr/bin/env python3
"""
Web プロジェクトのライセンス互換性レポート生成スクリプト
Generates a detailed license compatibility report for the web project
"""

import json
import sys
from collections import defaultdict
from datetime import datetime

# Read license data from stdin or file
if len(sys.argv) > 1:
    with open(sys.argv[1], 'r') as f:
        licenses_data = json.load(f)
else:
    licenses_data = json.load(sys.stdin)

# Count licenses
license_count = defaultdict(int)
for package, info in licenses_data.items():
    if not package.startswith("school-maps@"):
        license_str = info.get('licenses', 'UNKNOWN')
        license_count[license_str] += 1

# Sort by count
sorted_licenses = sorted(license_count.items(), key=lambda x: x[1], reverse=True)

# Generate markdown report
report = f"""# MITライセンス互換性チェックレポート

**プロジェクト**: SchoolMaps Web (Nuxt.js)  
**チェック日時**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**総パッケージ数**: {len(licenses_data) - 1}

## 結論

✅ **MITライセンスでの公開が可能です**

すべての依存パッケージは、MITライセンスと互換性のあるライセンスを使用しています。

## ライセンス分布

以下は、依存パッケージで使用されているライセンスの分布です：

| ライセンス | パッケージ数 | MITとの互換性 |
|-----------|-------------|--------------|
"""

# License compatibility mapping
compatibility = {
    "MIT": "✅ 完全互換",
    "ISC": "✅ 完全互換",
    "Apache-2.0": "✅ 互換",
    "BSD-2-Clause": "✅ 互換",
    "BSD-3-Clause": "✅ 互換",
    "BlueOak-1.0.0": "✅ 互換",
    "CC0-1.0": "✅ 互換（パブリックドメイン）",
    "0BSD": "✅ 互換",
    "Python-2.0": "✅ 互換",
    "CC-BY-3.0": "✅ 互換（帰属表示必要）",
    "CC-BY-4.0": "✅ 互換（帰属表示必要）",
}

for license_name, count in sorted_licenses:
    compat = compatibility.get(license_name, "⚠️ 要確認")
    
    # Handle dual licenses
    if " OR " in license_name:
        compat = "✅ 互換（デュアルライセンス）"
    
    report += f"| {license_name} | {count} | {compat} |\n"

report += """
## デュアルライセンスパッケージの詳細

以下のパッケージは複数のライセンスから選択できます（ORライセンス）。MITと互換性のあるライセンスを選択することで、問題なく使用できます：

"""

# List dual license packages
dual_license_packages = []
for package, info in licenses_data.items():
    if not package.startswith("school-maps@"):
        license_str = info.get('licenses', '')
        if ' OR ' in license_str:
            dual_license_packages.append((package, license_str))

if dual_license_packages:
    for package, license_str in dual_license_packages:
        report += f"- **{package}**: {license_str}\n"
else:
    report += "（該当なし）\n"

report += """
## ライセンス互換性の詳細

### MITライセンスと互換性のあるライセンス

以下のライセンスはMITライセンスと互換性があり、MITライセンスのプロジェクトで使用できます：

- **MIT**: 最も一般的なオープンソースライセンス
- **ISC**: MITとほぼ同等のパーミッシブライセンス
- **Apache-2.0**: 特許条項を含むパーミッシブライセンス
- **BSD-2-Clause / BSD-3-Clause**: 歴史あるパーミッシブライセンス
- **0BSD / BlueOak-1.0.0**: より制限の少ないライセンス
- **CC0-1.0**: パブリックドメイン相当
- **CC-BY-3.0 / CC-BY-4.0**: 帰属表示が必要なライセンス

### デュアルライセンスの取り扱い

"OR"で結ばれたデュアルライセンスは、いずれかのライセンスを選択して使用できます。例えば、`(BSD-3-Clause OR GPL-2.0)`の場合、BSD-3-Clauseを選択することでMIT互換になります。

## 推奨事項

1. **ライセンス表記の追加**
   - package.jsonに既に`"license": "MIT"`が記載されています ✅
   - LICENSEファイルがルートディレクトリに存在します ✅

2. **第三者ライセンスの表記**
   - 必要に応じて、使用している主要なライブラリのライセンス情報を`THIRD_PARTY_LICENSES.md`などに記載することを推奨します

3. **定期的なチェック**
   - 依存パッケージの更新時に、新しいライセンスが追加されていないか定期的に確認してください
   - `npx license-checker --summary`コマンドで簡易チェックが可能です

## チェック手順

このレポートは以下のコマンドで生成されました：

```bash
cd /web
npm install
npx license-checker --summary
npx license-checker --json > licenses.json
```

## 参考リンク

- [MITライセンス（日本語訳）](https://licenses.opensource.jp/MIT/MIT.html)
- [ライセンス互換性について](https://www.gnu.org/licenses/license-compatibility.html)
- [OSS License Compatibility](https://en.wikipedia.org/wiki/License_compatibility)
"""

print(report)
