"""
Inkscape SVGでエクスポート

inkscapeのSVGファイルを読み込んで、クリックイベントを追加するスクリプト
@click属性を追加
クラス属性を追加
"""

import xml.etree.ElementTree as ET

PlaceInfoLabels = []

# ファイルのパスを取得

InputFilePath = input("InputFilePath(svg): ")
if InputFilePath == "":
    InputFilePath = "map.svg"

TemplateFilePath = input("TemplateFilePath(vue): ")
if TemplateFilePath == "":
    TemplateFilePath = "template.vue"

OutputFilePath = input("OutputFilePath(vue): ")
if OutputFilePath == "":
    OutputFilePath = "out/map-output.vue"

PlaceInfoFilePath = input("PlaceInfoFilePath(json): ")
if PlaceInfoFilePath == "":
    PlaceInfoFilePath = "out/place-info.json"

# SVGファイルを読み込み

tree = ET.parse(InputFilePath)
root = tree.getroot()

ET.register_namespace("", "http://www.w3.org/2000/svg")

for child in root:
    # 全style属性を削除
    try:
        del child.attrib["style"]
    except KeyError:
        pass
    # 属性を取得
    # id属性を取得
    try:
        id = child.attrib["id"]
    except KeyError:
        id = None
    # "-"以下はid重複防止用なので削除
    if id != None:
        placeid = id.split("-")[0]
    # "none"ではない場合
    if placeid != "none":
        # 属性を追加
        child.attrib["placeid"] = placeid
        child.attrib.update(
            [(":class", "{ 'selected': props.selectedID == '" + placeid + "' }")]
        )
        # PlaceInfoLabelsに追加
        if placeid not in PlaceInfoLabels:
            PlaceInfoLabels.append(placeid)
        # class属性を追加
        child.attrib.update([("class", "place")])

# 文字列に変換
file = ET.tostring(root, encoding="utf-8", xml_declaration=False).decode("utf-8")

# テンプレートファイルを読み出し
with open("template.vue", encoding="utf-8") as f:
    TEMPLATE = f.read()

# ファイルに書き出し
with open(OutputFilePath, mode="w", encoding="utf-8") as f:
    f.write(
        TEMPLATE.replace(
            "<template></template>", "<template>\n" + file + "\n</template>"
        )
    )

# PlaceInfoの作成
PlaceInfo = """
    {
        "__FloorName__": "",
        "__FloorDisplayName__": "",
        "__MapSizeWidth__": 0,
        "__MapSizeHeight__": 0,
    """
for i in PlaceInfoLabels:
    PlaceInfo += '"' + i + '": {"name": "' + i + '", "description": ""},\n'
PlaceInfo += "}"

# ファイルに書き出し
with open(PlaceInfoFilePath, mode="w", encoding="utf-8") as f:
    f.write(PlaceInfo)
