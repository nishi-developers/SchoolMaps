import { readTextFile, saveTextFile, middlePaths } from "./lib";
import { createSVGWindow } from "svgdom";
import { SVG, registerWindow, Element } from "@svgdotjs/svg.js";

function createPlacesData(file: string, placeIds: Set<string>): string {
  const svg = SVG(file);
  const places: Array<{
    id: string;
    name: string;
    words: string;
    desc: string;
    mode: string;
    floor: string;
    behavior: string;
    images: Array<string>;
  }> = [];
  svg.find("*[place]").forEach((element: Element) => {
    const id = element.attr("place");
    const mode = element.attr("mode") || "";
    const floor = element.attr("floor") || "";
    const behavior = element.attr("behavior") || "";
    if (!placeIds.has(behavior)) {
      return; // 指定されたbehaviorが存在しない場合はスキップ
    }
    places.push({
      id: id,
      mode: mode,
      floor: floor,
      behavior: behavior,
      name: "",
      words: "",
      desc: "",
      images: [],
    });
  });
  let csv = '"id","mode","floor","behavior","name","words","desc","images1","images2","images3"\n';
  const escapeCsvField = (field: string): string => {
    return `"${field.replace(/"/g, '""')}"`;
  };
  for (const place of places) {
    const id = escapeCsvField(place.id);
    const mode = escapeCsvField(place.mode);
    const floor = escapeCsvField(place.floor);
    const behavior = escapeCsvField(place.behavior);
    csv += `${id},${mode},${floor},${behavior},"","","","","",""\n`;
  }
  return csv;
}

function getPlaceBehavior(file: string): Set<string> {
  const behaviors = JSON.parse(file);
  const places = new Set<string>();
  behaviors.forEach((behavior: { id: string; isPlace: boolean }) => {
    if (behavior.isPlace) {
      places.add(behavior.id);
    }
  });
  return places;
}

async function main(): Promise<void> {
  const mapFile = await readTextFile(middlePaths.map);
  const behaviorsData = await readTextFile(middlePaths.behaviorsData);
  if (!mapFile || !behaviorsData) {
    console.error("必要なファイルが読み込めませんでした。");
    return;
  }

  // XMLパーサーの設定
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);

  const placeIds = getPlaceBehavior(behaviorsData);

  await saveTextFile(middlePaths.placesData, createPlacesData(mapFile, placeIds));
}

main();
