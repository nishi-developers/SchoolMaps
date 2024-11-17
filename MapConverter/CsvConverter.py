import json, csv

InputFilePath = input("InputFilePath(csv): ")
if InputFilePath == "":
    InputFilePath = "PlaceInfo.csv"

OutputFilePath = input("OutputFilePath(json): ")
if OutputFilePath == "":
    OutputFilePath = "out/PlaceInfo.json"

# CSVファイルを読み込み
PlaceInfo = []
with open(InputFilePath, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        PlaceInfo.append(row)

# 変換
Converted = {}
# 最初の行を削除
for i in range(1, len(PlaceInfo) - 1):
    images = []
    for j in range(len(PlaceInfo[i]) - 5):
        images.append(PlaceInfo[i][5 + j])
    Converted[PlaceInfo[i][0]] = {
        "floor": int(PlaceInfo[i][1]),
        "name": PlaceInfo[i][2],
        "words": PlaceInfo[i][3],
        "desc": PlaceInfo[i][4],
        "images": images,
    }

# ファイルに書き出し
with open(OutputFilePath, mode="w", encoding="utf-8") as f:
    json.dump(Converted, f, ensure_ascii=False, indent=4)
