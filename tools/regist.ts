import { readTextFile, saveTextFile, middlePaths } from "./lib";

function convertPlaces(file: string): string {
  // csvを1行ずつ読み込む
  const lines = file.split("\n");
  // 最初の行を削除
  lines.shift();
  const places: Array<{
    id: string;
    mode: string;
    floor: string;
    behavior: string;
    name: string;
    words: string;
    desc: string;
    images: Array<string>;
  }> = [];
  for (const line of lines) {
    // 各行をカンマで分割
    // 正規表現を使用して、カンマで囲まれた文字列を正しく分割できるように
    const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    // 必要な変換を行う（例: 文字列のトリミング）
    for (let i = 0; i < columns.length; i++) {
      columns[i] = columns[i].trim();
      // クォーテーションの囲みを削除
      if (columns[i].startsWith('"') && columns[i].endsWith('"')) {
        columns[i] = columns[i].slice(1, -1);
      }
    }
    // 変換後の行を再構築
    const place = {
      id: columns[0],
      mode: columns[1],
      floor: columns[2],
      behavior: columns[3],
      name: columns[4],
      words: columns[5],
      desc: columns[6],
      images: columns.slice(7).filter((img) => img !== ""),
    };
    places.push(place);
  }
  return JSON.stringify(places, null, 2);
}

async function main(): Promise<void> {
  const exportPaths = {
    map: "../web/server/assets/map.svg",
    placesData: "../web/server/assets/places.json",
    modesData: "../web/server/assets/modes.json",
    floorsData: "../web/server/assets/floors.json",
    behaviorsData: "../web/server/assets/behaviors.json",
  };

  const map = await readTextFile(middlePaths.map);
  const places = await readTextFile(middlePaths.placesData);
  const modes = await readTextFile(middlePaths.modesData);
  const floors = await readTextFile(middlePaths.floorsData);
  const behaviors = await readTextFile(middlePaths.behaviorsData);

  if (!map || !places || !modes || !floors || !behaviors) {
    console.error("必要なファイルが読み込めませんでした。");
    return;
  }

  const convertedPlaces = convertPlaces(places);

  await saveTextFile(exportPaths.map, map);
  await saveTextFile(exportPaths.placesData, convertedPlaces);
  await saveTextFile(exportPaths.modesData, modes);
  await saveTextFile(exportPaths.floorsData, floors);
  await saveTextFile(exportPaths.behaviorsData, behaviors);
}

main();
