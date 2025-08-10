import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";

import { createSVGWindow } from "svgdom";
import { SVG, registerWindow, Element } from "@svgdotjs/svg.js";

// ファイルを非同期で読み込む関数
async function readTextFile(filePath: string): Promise<string | void> {
  try {
    // ファイルが存在するかチェック
    if (!existsSync(filePath)) {
      console.error(`エラー: ファイルが見つかりません: ${filePath}`);
      return;
    }
    // ファイルを非同期で読み込み
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`ファイル読み込みエラー: ${error}`);
  }
}

// ファイルを保存する関数
async function saveTextFile(filePath: string, content: string): Promise<void> {
  try {
    // ファイルを非同期で書き込み
    await writeFile(filePath, content, "utf-8");
    console.log(`ファイルが保存されました: ${filePath}`);
  } catch (error) {
    console.error(`ファイル保存エラー: ${error}`);
  }
}

// 1行目が<?xml >であれば削除
function deleteXmlTag(file: string): string {
  if (file.startsWith("<?xml ")) {
    const endOfXml = file.indexOf("?>") + 2;
    return file.slice(endOfXml).trim();
  }
  return file;
}

// idが_で始まる要素を削除
function deleteIdUnderBar(file: string): string {
  const svg = SVG(file);
  svg.find("[id^='_']").forEach((element: Element) => {
    element.remove();
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

// メイン実行部分
async function main(): Promise<void> {
  const inputFilePath = "../maps/map-edited.svg";
  const outputFilePath = "../maps/map.svg";

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
  file = deleteIdUnderBar(file);
  file = deleteGForAffinity(file);
  file = setAttributeAndRemoveG(file);
  file = deleteStyle(file); // スタイル属性を削除
  file = deleteNewLine(file);

  // エクスポート
  await saveTextFile(outputFilePath, file);
}

main();
