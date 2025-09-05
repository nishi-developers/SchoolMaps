import { SVG, Element } from "@svgdotjs/svg.js";
import { Mode, Floor, Behavior, Place, Detail } from "./types";
import { DEFAULT_BEHAVIOR_STYLE } from "./config";
import { extractUniqueAttributeValues } from "./svg-utils";
import { escapeCsvField, parseCsvLine } from "./lib";

/**
 * SVGからモードデータを生成
 */
export function createModesData(svgContent: string): Mode[] {
  const modeIds = extractUniqueAttributeValues(svgContent, "mode");

  return Array.from(modeIds).map((id) => ({
    id,
    enable: true,
    name: "",
    always: false,
    image: "",
  }));
}

/**
 * SVGからフロアデータを生成
 */
export function createFloorsData(svgContent: string): Floor[] {
  const floorIds = extractUniqueAttributeValues(svgContent, "floor");

  return Array.from(floorIds).map((id) => ({
    id,
    name: "",
    always: false,
  }));
}

/**
 * SVGからビヘイビアデータを生成
 */
export function createBehaviorsData(svgContent: string): Behavior[] {
  const behaviorIds = extractUniqueAttributeValues(svgContent, "behavior");

  return Array.from(behaviorIds).map((id) => ({
    id,
    isPlace: false,
    style: { ...DEFAULT_BEHAVIOR_STYLE },
  }));
}

/**
 * SVGから詳細データを生成
 */
export function createDetailData(svgContent: string): Detail {
  const svg = SVG(svgContent);
  const width = Number(parseFloat(svg.attr("width") || "0"));
  const height = Number(parseFloat(svg.attr("height") || "0"));

  return {
    mapVersion: "0.0.0",
    width: width,
    height: height,
    infoProviders: [],
  };
}

/**
 * SVGからプレイスデータをCSV形式で生成
 */
export function createPlacesDataCsv(svgContent: string, placeBehaviorIds: Set<string>): string {
  const svg = SVG(svgContent);
  const places: Array<Omit<Place, "images"> & { images: [string, string, string] }> = [];

  svg.find("*[place]").forEach((element: Element) => {
    const id = element.attr("place");
    const mode = element.attr("mode") || "";
    const floor = element.attr("floor") || "";
    const behavior = element.attr("behavior") || "";

    // 指定されたbehaviorが存在しない場合はスキップ
    if (!placeBehaviorIds.has(behavior)) {
      return;
    }

    places.push({
      id,
      mode,
      floor,
      behavior,
      name: "",
      words: "",
      desc: "",
      images: ["", "", ""],
    });
  });

  // CSVヘッダー
  let csv = '"id","mode","floor","behavior","name","words","desc","images1","images2","images3"\n';

  // データ行
  for (const place of places) {
    const escapedFields = [
      place.id,
      place.mode,
      place.floor,
      place.behavior,
      place.name,
      place.words,
      place.desc,
      ...place.images,
    ].map(escapeCsvField);

    csv += `${escapedFields.join(",")}\n`;
  }

  return csv;
}

/**
 * CSVデータをPlaceオブジェクトの配列に変換
 */
export function convertCsvToPlaces(csvContent: string): Place[] {
  const lines = csvContent.split("\n");
  lines.shift(); // ヘッダー行を削除

  return lines
    .filter((line) => line.trim()) // 空行を除外
    .map((line) => {
      const columns = parseCsvLine(line);

      return {
        id: columns[0] || "",
        mode: columns[1] || "",
        floor: columns[2] || "",
        behavior: columns[3] || "",
        name: columns[4] || "",
        words: columns[5] || "",
        desc: columns[6] || "",
        images: columns.slice(7).filter((img) => img !== ""),
      };
    });
}

/**
 * ビヘイビアデータからプレイス用のビヘイビアIDを抽出
 */
export function getPlaceBehaviorIds(behaviorsData: string): Set<string> {
  const behaviors: Behavior[] = JSON.parse(behaviorsData);
  const placeBehaviorIds = new Set<string>();

  behaviors.forEach((behavior) => {
    if (behavior.isPlace) {
      placeBehaviorIds.add(behavior.id);
    }
  });

  return placeBehaviorIds;
}
