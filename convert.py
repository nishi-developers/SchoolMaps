"""
Inkscape SVGでエクスポート

inkscapeのSVGファイルを読み込んで、クリックイベントを追加するスクリプト
@click属性を追加
クラス属性を追加
"""

import xml.etree.ElementTree as ET
import os

InputFile = "test.svg"
# TempFile = "temp-output.svg"
OutputFile = "map-data.svg"

tree = ET.parse(InputFile)
root = tree.getroot()

ET.register_namespace("", "http://www.w3.org/2000/svg")
ET.register_namespace("sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd")
ET.register_namespace("inkscape", "http://www.inkscape.org/namespaces/inkscape")


# svgのidを変更
# root.attrib.update([("id", "map_svg")])


def convert(content):
    try:
        label = content.attrib["{http://www.inkscape.org/namespaces/inkscape}label"]
        print(label)
        content.attrib.update([("@click", f"showInfo('{label}')")])
        content.attrib.update([("class", label)])
    except KeyError:
        pass
    return content


for child in root:
    child = convert(child)
    for child2 in child:
        child2 = convert(child2)
        for child3 in child2:
            child3 = convert(child3)
tree.write(
    OutputFile,
    encoding="utf-8",
    xml_declaration=False,
)

# with open(TempFile, encoding="utf-8") as f:
#     file = f.read()
# with open(OutputFile, mode="w", encoding="utf-8") as f:
#     f.write("<template>\n" + file + "\n</template>")

# os.remove(TempFile)
