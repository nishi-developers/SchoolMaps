# マップデータの作成方法

## SVGデータ

マップの画像となる、SVG形式のデータを作成する

- `<svg></svg>`の配下に並列に並べ、すべて1次元のパスで表現する(グループ使用不可)
- 要素に固有のidを割り振る(内容は後述)
- 校外は透過する
- 場所の名称は、自動的に表示されるため記述不要
- フロアごとにsvgファイルを作成する
- svgのスタイルはすべて削除されるため、色とかはcssで指定する
  - `transform`は、利用して移動させると崩れるため、使わない
- コンバーターを利用して、所定のvueファイルに変換して利用する

### idの規則

- ~~"-"の後の文字はID重複防止のためとみなし、無視して処理される~~
- {prefix}-{placeid又はuuid}
- ~~数字から始めない(`_1a`のようにする)~~
- 単語間をアンダーバーで区切るスネークケースで書く

#### idの役割

|id|役割|
|--|--|
|base|高校の敷地(マップの範囲)|
|enclosure|建物単位などの場所の範囲、placeやnoneと完全に重なったものがあっても構わない、駐輪場などを除きなるべくのplaceはこの上に載せる|
|label|場所のラベルデータなど、回転させないもの|
|none|情報を表示できない場所(タップできない教室などの場所)|
|`それ以外`|情報を表示できる場所(タップで詳細が出てくる教室などの場所)=**place** **その場所のplaceIdにする**|

- アクセスできないenclosureは消す
- 位置の目安としておく場合はnone
- 例えば、タップして情報を表示できない場所には`none-0`,`none-1`などといった感じでidを振れば良い

### SVGデータ 作成方法の例

1. AffinityDesigner2で、パスや短形ツールを駆使して、地図データを作成する
2. 要素の名称を変更して、placeIdをつける
3. SVGでエクスポートする(グループは解除する)
4. このままではidがgタグについてしまうので、[SvgConverterForAffinity.py](MapConverter\SvgConverterForAffinity.py)を利用してidを正しくつける
5. Inkscapeで開き、グループ化を解除(全選択、ワンクリックでungroupできる)
6. 全オブジェクトをパス化し、余分な範囲を削除
7. Inkscapeで拡張機能を利用してtransformを削除
8. PlaneSVGでエクスポート
9. 手動で不要なタグを削除(`<svg></svg>`外のタグなど)
10. [SvgConverter.py](MapConverter\SvgConverter.py)を利用して、styleを削除し、vueファイルに加工

### Inkscapeの拡張機能を利用したtransformの削除

通常ではオブジェクトの位置をtransformによって記録しているが、それではcssで加工する上で不都合なため、transformタグを削除する。

[inkscape-applytransforms](https://github.com/Klowner/inkscape-applytransforms)という拡張機能を使用する。
インストール方法は[GitHub](https://github.com/Klowner/inkscape-applytransforms?tab=readme-ov-file#installation)にある通り。

全オブジェクトをパス化してから拡張機能を使う(Extensions -> Modify Path -> Apply Transform)。
一旦セーブしてから拡張機能を使わないとエラーになることがある。

## PlaceInfo.json

- Placeの情報を並列的に並べる
- wordsはnameに加えて検索時に含める単語、検索に利用するだけで表示はしない
  - そのため、単語は半角スペースで区切る
- placeIdはその場所のキーとしてJSONでは用い、全フロアを通してunique

```json:PlaceInfo.json(一部例)
{
    "grand": {
        "name": "校庭",
        "words": "グランド トラック",
        "desc": "広いひろーい校庭/n**運動会**や**体育祭**などが行われる場所/n[体育館](gym_1f)もある",
        "floor": 0,
        "images": [
            "grand.png",
            "grandsub.png"
        ]
    },
}
```

### desc

`desc`は、以下の構文を利用できる。

- `[リンクテキスト](リンク先placeid)`の形式でリンクを作成する。例: `[校庭](grand)`
- `**太字**`の形式で太字を作成する。例: `**重要**`
- `/n`の文字列を改行として扱う。例: `1行目/n2行目`

### PlaceInfo.json 作成方法の例

1. Excelで`id(unique),floor,name,words,desc,images`を1行目にした表を作成し、情報を入力していく
2. CSV(UTF-8)にエクスポート
3. [CsvConverter.py](MapConverter\CsvConverter.py)を利用してJSONに変換

```csv:PlaceInfocsv(一部例)
id(unique),floor,name,words,desc,,
_1a,0,1A,普通教室 クラス 1年 A組,,,
_1b,0,1B,普通教室 クラス 1年 B組,,,
```

## FloorInfo.json

- フロアごとのデータを書き込むファイル
- `FloorInfo.json`の`mapWidth`と`mapHeight`に、svgの`width`と`height`の値(単位は外す)を書き込む
- その他は見ての通り

```json:FloorInfo.json(例)
[
    {
        "shortName": "1F",
        "fullName": "1階",
        "mapWidth": 1000,
        "mapHeight": 1000
    },
    {
        "shortName": "2F",
        "fullName": "2階",
        "mapWidth":1000,
        "mapHeight": 1000
    },
    {
        "shortName": "3F",
        "fullName": "3階",
        "mapWidth": 1000,
        "mapHeight": 1000
    },
    {
        "shortName": "R",
        "fullName": "屋上",
        "mapWidth": 1000,
        "mapHeight": 1000
    }
]
```
