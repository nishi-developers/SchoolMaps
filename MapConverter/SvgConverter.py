"""
SVGファイルを読み込み、Vueファイルに変換するスクリプト
- Style属性を削除
- PlaceInfoの雛形を作成
"""

import xml.etree.ElementTree as ET

PlaceInfoLabels = []

# ファイルのパスを取得

InputFilePath = "in-out/input.svg"
OutputFilePath = "in-out/output.vue"
TemplateFilePath = "template.vue"

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
