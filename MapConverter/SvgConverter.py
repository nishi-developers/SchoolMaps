"""
SVGファイルを読み込み、Style属性を削除して、Vueファイルに変換するスクリプト
"""

import xml.etree.ElementTree as ET

PlaceInfoLabels = []

# ファイルのパスを取得

for Num in range(0, 3):
    InputFilePath = f"MapData/{Num}.svg"
    OutputFilePath = f"frontend/src/assets/floors/{Num}.vue"
    TemplateFilePath = "MapConverter/template.vue"

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

    # 文字列に変換
    file = ET.tostring(root, encoding="utf-8", xml_declaration=False).decode("utf-8")

    # テンプレートファイルを読み出し
    with open(TemplateFilePath, encoding="utf-8") as f:
        TEMPLATE = f.read()

    # ファイルに書き出し
    with open(OutputFilePath, mode="w", encoding="utf-8") as f:
        f.write(
            TEMPLATE.replace(
                "<template></template>", "<template>\n" + file + "\n</template>"
            )
        )
