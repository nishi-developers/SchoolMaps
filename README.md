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
