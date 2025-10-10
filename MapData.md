# マップデータの構造と作成方法

## データ構造

### 用語

SVGファイルのひとつひとつの要素を`オブジェクト`と呼ぶ。
オブジェクトのうち、詳細情報を持ち、タップ可能なものを`place`と呼ぶ。

### レイヤー

マップは3種類の属性(ここではレイヤーと呼ぶ)で構成される。

#### `ModeLayer`

- 新歓、記念祭などのモードを切り替えるレイヤー
- 常時表示されるモードと、その上に重ねて他のモードとは排他的に表示されるモードがある
- モード切り替えで表示は切り替えられる

#### `FloorLayer`

- 各フロアごとに分けられたレイヤー
- 1f, 2f, 3f,など
- フロア切り替えで切り替えられる

#### `BehaviorLayer`

- 色やPlaceかどうか(タッチ可能性)を定義するレイヤー

## ファイル構造

マップのデータは、次の6つのファイルで構成される。

### `map.svg`

そのままクライアントで利用されるマップのSVGファイル。

- SVGのすべてのオブジェクトには、id属性が必要
- すべてのオブジェクトはid属性により識別され、マップの各要素に対応する

### `places.json`

```json:places.json
[
  {
    "id": "grand",
    "mode": "main",
    "floor": "1f",
    "behavior": "place",
    "name": "校庭",
    "words": "グランド トラック",
    "desc": "広いひろーい校庭/n**運動会**や**体育祭**などが行われる場所/n[体育館](gym_1f)もある",
    "images": [
      "./img/grand.png",
      "./img/grandsub.png"
    ]
  },
  {
    "id": "w3efde4s",
    "mode": "main",
    "floor": "1f",
    "behavior": "none",
    "name": "",
    "words": "",
    "desc": "",
    "images": []
  }
]
```

- idは完全にniqueにする
- modeは、`modes.json`で定義されたモードのid
- floorは、`floors.json`で定義されたフロアのid
- behaviorは、`behaviors.json`で定義されたビヘイビアのid
- nameは、placeの表示名
- wordsはnameに加えて検索時に含める単語、検索に利用するだけで表示はしない
  - そのため、単語は基本的に半角スペースで区切る
- descは、placeの説明文
- imagesは、placeの画像のパスを配列で指定する
  - 外部URLも可
  - 画像は、マップのpropertyに表示される

#### desc

`desc`は、以下の構文を利用できる。

- `[リンクテキスト](リンク先placeid)`の形式でリンクを作成する。例: `[校庭](grand)`
- `**太字**`の形式で太字を作成する。例: `**重要**`
- `<br>`を改行として扱う。例: `1行目<br>2行目`

### `modes.json`

```json:modes.json
[
  {
    "id": "main",
    "name": "main",
    "always": true,
  },
  {
    "id": "shinkan80",
    "name": "新歓80th",
    "always": false,
  }
]
```

- idは完全にuniqueにする
- nameは表示名
- alwaysは、常に表示するかどうかを示すフラグ
  - trueの場合、常に表示される
  - falseの場合、モード切り替えより選択することで表示される

### `floors.json`

```json:floors.json
[
  {
    "id": "base",
    "name": "base",
    "always": true,
  },
  {
    "id": "f1",
    "name": "1階",
    "always": false,
  },
  {
    "id": "f2",
    "name": "2階",
    "always": false,
  },
  {
    "id": "f3",
    "name": "3階",
    "always": false,
  }
]
```

- idは完全にuniqueにする
- nameは表示名
- alwaysは、常に表示するかどうかを示すフラグ
  - trueの場合、常に表示される
  - falseの場合、フロア切り替えより選択することで表示される
- 数字始まりのidはSVGで認められないため、`f1`, `f2`のようにする

### `behaviors.json`

```json:behaviors.json
[
  {
    "id": "none",
    "isPlace": false,
    "style": null
  },
  {
    "id": "place",
    "isPlace": true,
    "style": {
      "body": {
        "fill_default": {
          "light": "#dfdfdf",
          "dark": "#252525"
        },
        "fill_select": {
          "light": "var(--SubColor)",
          "dark": "var(--SubColor)"
        },
        "stroke": {
          "light": "var(--MapBorderColor)",
          "dark": "var(--MapBorderColor)"
        },
        "strokeWidth": 2.0
      },
      "label": {
        "fill": {
          "light": "var(--MainBodyColor)",
          "dark": "var(--MainBodyColor)"
        },
        "fontSize": "2rem"
      }
    }
  }
]
```

- idは完全にuniqueにする
- isPlaceは、placeデータとして扱うかどうかを示す
  - trueの場合、`places.json`に登録される
  - falseの場合、`places.json`には登録されない
- styleは、SVGのスタイルを定義するオブジェクト
  - スタイルが使用されないplaceは`null`を指定する

### `detail.json`

```json:detail.json
{
  "mapVersion": "1.0.0",
  "width": 1920,
  "height": 1080,
  "isDatabaseIntegrated": true,
}
```

- `mapVersion`は、マップのバージョンを示す文字列
- `width`と`height`は、マップの幅と高さをピクセル単位で指定する
- `isDatabaseIntegrated`は、データベース統合の有無を示すフラグ
  - この値はバックエンドで自動的に設定される

## 作成方法

### 1. マップのSVGデータの作成

- SVGエディターを使用して、マップのSVGデータを作成する
- 各オブジェクトの名前(id)が、そのまま`places.json`の`id`として使用される
- グループを使って3段階の階層構造を作る
  - 1番目の階層はmodeのidを指定する
  - 2番目の階層はfloorのidを指定する
  - 3番目の階層はbehaviorのidを指定する
- グループのidなどで重複してしまう場合は、`_`以降に識別子を追加することで回避できる
  - コンバーターは、`_`以降の部分を無視して処理する
- 直接関係のないグーループは、`_`から始まる名前を付ける
  - コンバーターは、`_`から始まる名前のグループを無視する
- SVGのスタイルはすべて削除されるため、色などはCSSで指定する
- idには`_`は使用できないため、区切り文字を利用したい際は`-`を使用する

#### behaviorsの基本方針(メモ)

- 通路はenclosure
- 床のないところはnone
- 位置の目安としておく場合はnone

### 2. Inkscapeによるマップデータの修正

- InkscapeでSVGファイルを開く
- 全選択して、`Path` → `Object to Path`を適用
- `Extensions` → `Modify Path` → `Apply Transform`を使用してtransformを削除
- `File` → `Document Properties → Resize to content`でサイズを調整
- Plain SVGとして`maps/map-raw.svg`にエクスポート

#### Apply Transformのインストール方法

[Apply Transform](https://github.com/Klowner/inkscape-applytransforms)はInkscapeの拡張機能で、transform属性を削除するために使用する。
インストール方法は[GitHub](https://github.com/Klowner/inkscape-applytransforms?tab=readme-ov-file#installation)にある通り。
インストールをしていない場合は、上記操作の前にインストールを行う必要がある。

### 3. SVGデータの変換(`tools/1MapConverter.ts`)

- `cd tools`で`tools`ディレクトリに移動
- `npm install`で依存関係をインストール
- `npm run 1`を実行して、SVGデータを変換する
- 生成された各ファイルにデータを入力する
  - `modes.json`はマップのモードを定義する
  - `floors.json`はマップのフロアを定義する
  - `behaviors.json`はマップのビヘイビアを定義する

### 4. プレイスデータの作成(`tools/2PlacesCreater.ts`)

- `npm run 2`を実行して、プレイスデータのCSVテンプレートを生成する
- 生成された`places.csv`を編集して、各プレイスの詳細情報を追加する
  - csvのimage列3列以降もimage列として扱われる

### 5. データの登録(`tools/3DataRegister.ts`)

- `npm run 3`を実行して、編集済みCSVデータを最終的なJSON形式に変換してWebアプリに配置する
