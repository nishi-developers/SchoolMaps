# SchoolMap

## マップデータの作成方法

### 使用アプリ

マップはSVGで作成するため、OSSの[Inkscape](https://inkscape.org/ja/)の使用をする

### マップデータの作成

パスや短形ツールを駆使して、地図データを作成する
校外は透過しておく
場所の名称も、地図に表示する分はすべていれる

### コンバート処理

inkscapeのsvgにのみ対応しているため、planeSVGの書き出しは行わない

通常ではオブジェクトの位置をtransformによって記録しているため、
<https://wenpe-playground.com/blog/remove-transform-from-svg>
このサイトのとおりにtransformタグを消す
サイトに有るグループ化解除とパス化は不要だが、テキストはパス化が必須
一旦セーブしてから拡張機能を使わないとエラーになることがある

テキストにはtextを含む文字列をつける(idでもつけた名前でも検知するので、基本はパス化したら何もしなくてよい)

1ページずつ書き出す
名称が初期値かnoneを含むのなら無視される

PlaceInfo.jsonの__MapSizeHeight__と__MapSizeWidth__に、svgのwidthとheightの値(mmは外す)を書き込む

廊下など、外ではないがタップもできない場所には名前にfloorを含める

svgのスタイルはすべて削除されるため、色とかはcssで指定する

## 参考

<https://www.google.com/maps/>
<https://gogatsusai.jp/96/map>
<https://platinumaps.jp/d/premiumoutlets-gotemba?floor=1F>
