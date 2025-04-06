"""
SVGファイルを読み込み、gタグのidをその配下にあるpathタグやrectタグへ移動させる
Affinity Designerで作成したSVGファイルを利用するためのスクリプト
"""

import xml.etree.ElementTree as ET

Num = 0
InputFilePath = f"MapData/{Num}.svg"
OutputFilePath = f"MapData/{Num}.svg"

tree = ET.parse(InputFilePath)
root = tree.getroot()

ET.register_namespace("", "http://www.w3.org/2000/svg")

for child in root:
    if child.tag.endswith("g"):
        try:
            for subchild in list(child):
                subchild.attrib["id"] = child.attrib["id"]
            del child.attrib["id"]
        except:
            pass

with open(OutputFilePath, mode="w", encoding="utf-8") as f:
    f.write(ET.tostring(root, encoding="utf-8", xml_declaration=False).decode("utf-8"))
