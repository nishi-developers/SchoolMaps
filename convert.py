"""
Inkscape SVGでエクスポート

inkscapeのSVGファイルを読み込んで、クリックイベントを追加するスクリプト
@click属性を追加
クラス属性を追加
"""

import xml.etree.ElementTree as ET
import copy
import os

PlaceInfoLabels = []

# ファイルのパス

InputFilePath = input("InputFilePath: ")
if InputFilePath == "":
    InputFilePath = "map.svg"

TempFile = "temp-output.svg"

OutputFilePath = input("OutputFilePath: ")
if OutputFilePath == "":
    OutputFilePath = "map-output.vue"

PlaceInfoFilePath = input("PlaceInfoFilePath: ")
if PlaceInfoFilePath == "":
    PlaceInfoFilePath = "place-info.json"

tree = ET.parse(InputFilePath)
root = tree.getroot()

ET.register_namespace("", "http://www.w3.org/2000/svg")
ET.register_namespace("sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd")
ET.register_namespace("inkscape", "http://www.inkscape.org/namespaces/inkscape")


def convert(content):
    """
    id : inkscapeが自動的に付与する固有のid
    label : inkscapeのオブジェクトにユーザーが付与した名称
    """
    # 属性を取得
    # label属性を取得
    try:
        label = content.attrib["{http://www.inkscape.org/namespaces/inkscape}label"]
    except KeyError:
        label = None
    # id属性を取得
    try:
        id = content.attrib["id"]
    except KeyError:
        id = None

    # 加工
    if (
        not ((label != None) and "none" in label)
    ) and (  # noneがlabelに含まれていないか
        content.tag == "{http://www.w3.org/2000/svg}g"  # グループかどうか
    ):
        # "text"がラベルかidに含まれて入れば、テキストとしてクラスを追加
        if (id != None and (("text" in id))) or (label != None and (("text" in label))):
            content.attrib.update([("class", "svg-text")])
        # "floor"がidに含まれていれば、廊下などとしてクラスを追加
        elif id != None and (("floor" in label)):
            content.attrib.update([("class", "svg-floor")])
        # それ以外の場合、オブジェクトとしてクリックイベントを追加
        elif label != None:
            # print(label)
            content.attrib.update([("@click", f"showProperty('{label}')")])
            content.attrib.update(
                [(":class", "{ 'selected': props.selectedID == '" + label + "' }")]
            )
            content.attrib.update([("class", "svg-object")])
            PlaceInfoLabels.append(label)
    # 全style属性を削除
    try:
        del content.attrib["style"]
    except KeyError:
        pass

    # inkscape固有の属性を削除(inkscapeとsodipodiの属性を削除)
    content_attrib_sub = copy.deepcopy(content.attrib)
    for i in content_attrib_sub:
        if (
            ("{http://www.inkscape.org/namespaces/inkscape}" in i)
            or ("{http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd}" in i)
            or ("sodipodi" in i)
            or ("inkscape" in i)
        ):
            del content.attrib[i]

    # return
    return content


# 3階層までの要素を変換
for child in root:
    child = convert(child)
    for child2 in child:
        child2 = convert(child2)
        for child3 in child2:
            child3 = convert(child3)


# tempファイルに書き出し
tree.write(
    TempFile,
    encoding="utf-8",
    xml_declaration=False,
)

# tempファイルを読み込み
with open(TempFile, encoding="utf-8") as f:
    file = f.read()

# いい感じに不要な情報を削除(inkscapeとsodipodi)
editfile = list(map(lambda x: x + ">", file.split(">")))
editfile2 = list(map(lambda x: x + '" ', editfile[0].split('" ')))
editfile2_ = []
for i in editfile2:
    if (not ("inkscape" in i)) and (not ("sodipodi" in i)):
        editfile2_.append(i)
editfile[0] = "".join(editfile2_) + ">"
if "sodipodi" in editfile[1]:
    editfile.pop(1)
file = "".join(editfile)
file = file.replace(">>", ">")


VUE = """
<script setup>
const props = defineProps(["selectedID"])
const emit = defineEmits(["showProperty"])
function showProperty(id) {
    emit('showProperty', id)
}
</script>"""

# ファイルに書き出し
with open(OutputFilePath, mode="w", encoding="utf-8") as f:
    f.write("<template>\n" + file + "\n</template>" + VUE)
# tempファイルを削除
os.remove(TempFile)

PlaceInfo = """
    {
        "__FloorName__": "",
        "__FloorDisplayName__": "",
        "__MapSizeWidth__": ,
        "__MapSizeHeight__": ,
    """
for i in PlaceInfoLabels:
    PlaceInfo += '"' + i + '": {"name": "' + i + '", "description": ""},\n'

PlaceInfo += "}"

# ファイルに書き出し
with open(PlaceInfoFilePath, mode="w", encoding="utf-8") as f:
    f.write(PlaceInfo)
