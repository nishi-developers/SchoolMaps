# SchoolMap

## マップデータの作成方法

### 使用アプリ

マップはSVGで作成するため、OSSの[Inkscape](https://inkscape.org/ja/)の使用をする

### マップデータの作成

パスや短形ツールを駆使して、地図データを作成する

- 校外は透過しておく
- 場所の名前も、地図に表示する分はすべていれる
- フロアごとにsvgファイルを作成する
- svgのスタイルはすべて削除されるため、色とかはcssで指定する
- inkscapeのsvgにのみ対応しているため、planeSVGの書き出しは行わない

#### 命名規則

- 要素名が初期値かnoneを含むのなら無視される
- テキストにはtextを含む文字列をつける(idでもつけた名前でも検知するので、基本はパス化したら何もしなくてよい)
- 廊下など、外ではないがタップもできない場所には名前にfloorを含める
- **それ以外のタップできる要素については、要素名をその場所のidにする**

### transformの削除

通常ではオブジェクトの位置をtransformによって記録しているが、それではcssで加工する上で不都合なため、transformタグを削除する。

[inkscape-applytransforms](https://github.com/Klowner/inkscape-applytransforms)という拡張機能を使用する。
インストール方法は[GitHub](https://github.com/Klowner/inkscape-applytransforms?tab=readme-ov-file#installation)にある通り。

全オブジェクトをパス化してから拡張機能を使う(Extensions -> Modify Path -> Apply Transform)。
一旦セーブしてから拡張機能を使わないとエラーになることがある。

### コンバート

convert.pyを実行して、vue形式に変換する
この際に不要な要素は削除されるが、svgには個人情報が含まれ兼ねないので、目を通すこと

### データの書き込み

- PlaceInfo.jsonの__MapSizeHeight__と__MapSizeWidth__に、svgのwidthとheightの値(mmは外す)を書き込む
- 場所のidを利用してPlaceInfo.jsonにデータを書き込む

## 参考

<https://www.google.com/maps/>
<https://gogatsusai.jp/96/map>
<https://platinumaps.jp/d/premiumoutlets-gotemba?floor=1F>
<https://wenpe-playground.com/blog/remove-transform-from-svg>
