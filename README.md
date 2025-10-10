# SchoolMaps | 西高マップ

## 概要

[東京都立西高等学校](https://www.metro.ed.jp/nishi-h/)の校内マップアプリです。

## リンク

- [西高マップ(https://maps.nishi-h.net/)](https://maps.nishi-h.net/)
- [PV映像(https://youtu.be/o8RLhzpfBVg)](https://youtu.be/o8RLhzpfBVg)
- [ミラーサイト(https://school-maps.vercel.app/)](https://school-maps.vercel.app/)

## ライセンス

### プログラム

本リポジトリのプログラムは[MITライセンス](./LICENSE)の下で提供されます。

### マップデータ

[mapsディレクトリ](./maps/)内を始めとする、プログラムを除くマップデータに関しては、西高生に限り自由に利用可能です。  
西高生以外のサイト観覧を制限するものではありませんが、マップデータのサイト外利用はご遠慮ください。

## 詳細

### ディレクトリ構成

| ディレクトリ | 説明 |
|------------|------|
| web        | Nuxt4を使用したWebアプリケーションのソースコード |
| maps       | マップ及び関連データ |
| tools      | マップ作成・編集用のツール |
| icons      | アイコン画像 |

### ドキュメント

- [マップデータの構造と作成方法](./MapData.md)
- [SchoolMaps Tools(マップ作成・編集ツール)](./tools/README.md)
