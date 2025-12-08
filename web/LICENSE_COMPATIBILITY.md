# MITライセンス互換性チェックレポート

**プロジェクト**: SchoolMaps Web (Nuxt.js)  
**チェック日時**: 2025-12-08 02:14:33  
**総パッケージ数**: 1122

## 結論

✅ **MITライセンスでの公開が可能です**

すべての依存パッケージは、MITライセンスと互換性のあるライセンスを使用しています。

## ライセンス分布

以下は、依存パッケージで使用されているライセンスの分布です：

| ライセンス | パッケージ数 | MITとの互換性 |
|-----------|-------------|--------------|
| MIT | 963 | ✅ 完全互換 |
| ISC | 59 | ✅ 完全互換 |
| Apache-2.0 | 44 | ✅ 互換 |
| BSD-2-Clause | 20 | ✅ 互換 |
| BSD-3-Clause | 14 | ✅ 互換 |
| BlueOak-1.0.0 | 6 | ✅ 互換 |
| CC0-1.0 | 5 | ✅ 互換（パブリックドメイン） |
| (MIT OR CC0-1.0) | 2 | ✅ 互換（デュアルライセンス） |
| MIT OR Apache-2.0 | 1 | ✅ 互換（デュアルライセンス） |
| Python-2.0 | 1 | ✅ 互換 |
| CC-BY-4.0 | 1 | ✅ 互換（帰属表示必要） |
| (MIT OR WTFPL) | 1 | ✅ 互換（デュアルライセンス） |
| (AFL-2.1 OR BSD-3-Clause) | 1 | ✅ 互換（デュアルライセンス） |
| (BSD-3-Clause OR GPL-2.0) | 1 | ✅ 互換（デュアルライセンス） |
| (BSD-2-Clause OR MIT OR Apache-2.0) | 1 | ✅ 互換（デュアルライセンス） |
| CC-BY-3.0 | 1 | ✅ 互換（帰属表示必要） |
| 0BSD | 1 | ✅ 互換 |

## デュアルライセンスパッケージの詳細

以下のパッケージは複数のライセンスから選択できます（ORライセンス）。MITと互換性のあるライセンスを選択することで、問題なく使用できます：

- **@cloudflare/kv-asset-handler@0.4.0**: MIT OR Apache-2.0
- **expand-template@2.0.3**: (MIT OR WTFPL)
- **json-schema@0.4.0**: (AFL-2.1 OR BSD-3-Clause)
- **node-forge@1.3.2**: (BSD-3-Clause OR GPL-2.0)
- **rc@1.2.8**: (BSD-2-Clause OR MIT OR Apache-2.0)
- **type-fest@0.16.0**: (MIT OR CC0-1.0)
- **type-fest@4.41.0**: (MIT OR CC0-1.0)

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

