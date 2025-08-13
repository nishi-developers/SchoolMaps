import { readTextFile, saveTextFile, middlePaths } from "./lib";
import { createSVGWindow } from "svgdom";
import { SVG, registerWindow, Element } from "@svgdotjs/svg.js";

// 1行目が<?xml >であれば削除
function deleteXmlTag(file: string): string {
  if (file.startsWith("<?xml ")) {
    const endOfXml = file.indexOf("?>") + 2;
    return file.slice(endOfXml).trim();
  }
  return file;
}

function deleteDecotypeTag(file: string): string {
  if (file.startsWith("<!DOCTYPE ")) {
    const endOfXml = file.indexOf(">") + 1;
    return file.slice(endOfXml).trim();
  }
  return file;
}

function replaceInkscapeLabel(file: string): string {
  // Inkscapeのラベルがエラーになる場合があるので、ラベルをリネーム
  file = file.replace("inkscape:label=", "inkscape-label=");
  // 他のinkscape属性は削除
  file = file.replace(/inkscape:[a-zA-Z-]+="[^"]*"/g, "");
  return file;
}

function deleteAffinityAttribute(file: string): string {
  // affinity用の属性を削除
  file = file.replace(/serif:[a-zA-Z-]+="[^"]*"/g, "");
  return file;
}

function deleteDefs(file: string): string {
  // <defs>タグを削除
  const defsStart = file.indexOf("<defs>");
  const defsEnd = file.indexOf("</defs>") + 7; // </defs>の長さを加える
  if (defsStart !== -1 && defsEnd !== -1) {
    return file.slice(0, defsStart) + file.slice(defsEnd);
  }
  return file;
}

function inkscapeLabelToId(file: string): string {
  const svg = SVG(file);
  svg.find("*[inkscape-label]").forEach((element: Element) => {
    const label = element.attr("inkscape-label");
    if (label) {
      element.attr("id", label); // inkscape-labelをidに設定
      element.attr("inkscape-label", null); // inkscape-labelを削除
    }
  });
  return svg.svg();
}

// idが_で始まる要素を削除
function deleteIdUnderBar(file: string): string {
  const svg = SVG(file);
  svg.find("[id^='_']").forEach((element: Element) => {
    element.remove();
  });
  return svg.svg();
}

function deleteIdAfterUnderBar(file: string): string {
  // idの後ろに_がある場合、_以降を削除
  const svg = SVG(file);
  svg.find("[id]").forEach((element: Element) => {
    const id = element.attr("id");
    if (id && id.includes("_")) {
      const newId = id.split("_")[0]; // _以降を削除
      element.attr("id", newId);
    }
  });
  return svg.svg();
}

// affinity用:gの下にg以外が存在する場合、gのidを子要素に移す
function deleteGForAffinity(file: string): string {
  const svg = SVG(file);
  svg.find("g").forEach((gElement) => {
    const children = gElement.children();
    if (children.length == 1 && children[0].type != "g") {
      const child = children[0]; // 対象の子要素
      const id = gElement.attr("id"); // g要素のidを取得
      const transform = gElement.attr("transform"); // g要素のtransformを取得
      gElement.attr("id", undefined); // id重複防止の為、g要素のidを削除
      child.attr("id", id); // gのidを子要素に設定
      child.attr("transform", transform); // gのtransformを子要素に設定
      gElement.parent()!.add(child); // gの親にgの子要素を追加
      gElement.remove(); // g要素を削除
    }
  });
  return svg.svg();
}

// g要素を削除し、子要素に適切な属性を設定
function setAttributeAndRemoveG(file: string): string {
  const svg = SVG(file);
  svg.find("*:not(g)").forEach((element: Element) => {
    const target = element.parent()?.parent()?.parent()?.parent();
    const Mode = element.parent()?.parent()?.parent()?.attr("id");
    const Floor = element.parent()?.parent()?.attr("id");
    const Behavior = element.parent()?.attr("id");
    element.attr("mode", Mode);
    element.attr("floor", Floor);
    element.attr("behavior", Behavior);
    target?.add(element); // 親要素に子要素を移動
  });
  svg.find("g").forEach((element: Element) => {
    element.remove();
  });
  return svg.svg();
}

function setAttributePlaceWithInkscape(file: string): string {
  const svg = SVG(file);
  svg.find("*:not(g)").forEach((element: Element) => {
    let place;
    place = element.attr("id");
    element.attr("id", null); // idを削除
    element.attr("place", place);
  });
  return svg.svg();
}
// style属性を削除
function deleteStyle(file: string): string {
  const svg = SVG(file);
  svg.find("[style]").forEach((element: Element) => {
    element.attr("style", null);
  });
  return svg.svg();
}

// 連続する空白行を削除
function deleteNewLine(file: string): string {
  file = file.replace(/\s*\n\s*/g, "\n");
  return file;
}

function createPlacesData(file: string): string {
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

function createModesData(file: string): string {
  const svg = SVG(file);
  const modesSet = new Set<string>();
  svg.find("*[mode]").forEach((element: Element) => {
    const id = element.attr("mode");
    if (id) {
      modesSet.add(id);
    }
  });
  const modes: Array<{
    id: string;
    name: string;
    always: boolean;
    image: string;
  }> = [];
  modesSet.forEach((id) => {
    modes.push({
      id: id,
      name: "",
      always: false,
      image: "",
    });
  });
  return JSON.stringify(modes, null, 2);
}

function createFloorsData(file: string): string {
  const svg = SVG(file);
  const floorsSet = new Set<string>();
  svg.find("*[floor]").forEach((element: Element) => {
    const id = element.attr("floor");
    if (id) {
      floorsSet.add(id);
    }
  });
  const floors: Array<{
    id: string;
    name: string;
    always: boolean;
  }> = [];
  floorsSet.forEach((id) => {
    floors.push({
      id: id,
      name: "",
      always: false,
    });
  });
  return JSON.stringify(floors, null, 2);
}

function createBehaviorsData(file: string): string {
  const svg = SVG(file);
  const behaviorsSet = new Set<string>();
  svg.find("*[behavior]").forEach((element: Element) => {
    const id = element.attr("behavior");
    if (id) {
      behaviorsSet.add(id);
    }
  });
  const behaviors: Array<{
    id: string;
    isPlace: boolean;
    style: {
      body: {
        fill_default: {
          light: string;
          dark: string;
        };
        fill_select: {
          light: string;
          dark: string;
        };
        stroke: {
          light: string;
          dark: string;
        };
        strokeWidth: number;
      };
      label: {
        fill: {
          light: string;
          dark: string;
        };
        fontSize: string;
      };
    };
  }> = [];
  behaviorsSet.forEach((id) => {
    behaviors.push({
      id: id,
      isPlace: false,
      style: {
        body: {
          fill_default: {
            light: "",
            dark: "",
          },
          fill_select: {
            light: "",
            dark: "",
          },
          stroke: {
            light: "",
            dark: "",
          },
          strokeWidth: 2.0,
        },
        label: {
          fill: {
            light: "",
            dark: "",
          },
          fontSize: "2rem",
        },
      },
    });
  });
  return JSON.stringify(behaviors, null, 2);
}

// メイン実行部分
async function main(): Promise<void> {
  // 入力ファイルパスと出力ファイルパスの設定
  let inputFilePath = "/maps/map-raw.svg";
  // if (process.argv.length > 2) {
  //   inputFilePath = process.argv[2];
  // }

  // ファイルを読み込む
  let file = await readTextFile(inputFilePath);
  if (!file) {
    return;
  }

  // XMLパーサーの設定
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);

  // SVGの内容を編集
  file = deleteXmlTag(file);
  file = deleteDecotypeTag(file);
  file = replaceInkscapeLabel(file);
  file = deleteAffinityAttribute(file);
  file = deleteDefs(file);
  file = inkscapeLabelToId(file);
  file = deleteIdUnderBar(file);
  file = deleteIdAfterUnderBar(file);
  file = deleteGForAffinity(file);
  file = setAttributeAndRemoveG(file);
  file = setAttributePlaceWithInkscape(file);
  file = deleteStyle(file); // スタイル属性を削除
  file = deleteNewLine(file);

  // エクスポート
  await saveTextFile(middlePaths.map, file);
  await saveTextFile(middlePaths.placesData, createPlacesData(file));
  await saveTextFile(middlePaths.modesData, createModesData(file));
  await saveTextFile(middlePaths.floorsData, createFloorsData(file));
  await saveTextFile(middlePaths.behaviorsData, createBehaviorsData(file));
}

main();

// コンバーターの前にやること

// inkscapeで開く
// 全選択して、Path->Object to Path
// Extensions->Modify Path->Apply Transform
// File->DocumentProperties->Resize to content
// Export->PlaneSVG->Export
