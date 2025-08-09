import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

import { createSVGWindow } from "svgdom";
import { SVG, registerWindow } from "@svgdotjs/svg.js";

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

// メイン実行部分
async function main(): Promise<void> {
  // コマンドライン引数からファイルパスを取得
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: npm run start <ファイルパス>");
    console.log("例: npm run start ../README.md");
    return;
  }

  const filePath = args[0];
  const resolvedPath = resolve(filePath);

  const file = await readTextFile(resolvedPath);
  if (!file) {
    return;
  }

  // XMLパーサーの設定
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);

  const svg = SVG(file);

  // SVGの内容を編集
  // idが_で始まる要素を削除
  svg.find("[id^='_']").forEach((element) => {
    element.remove();
  });

  // affinity用:gの下にg以外が存在する場合、gのidを子要素に移す
  svg.find("g").forEach((gElement) => {
    const children = gElement.children();
    if (children.length == 1 && children[0].type != "g") {
      const child = children[0]; // 対象の子要素
      const id = gElement.attr("id"); // g要素のidを取得
      gElement.attr("id", undefined); // id重複防止の為、g要素のidを削除
      child.attr("id", id); // gのidを子要素に設定
      gElement.parent()!.add(child); // gの親にgの子要素を追加
      gElement.remove(); // g要素を削除
    }
  });

  // transform属性を変換して削除
  svg.find("[transform]").forEach((element) => {
    const transform = element.attr("transform");
    if (transform) {
      // transform属性の値を解析して、必要な変換を行う
      element.attr("transform", undefined);
    }
  });

  // 現在のファイルはidの重複(gのidとpathのid)があるため、治す!

  // const xmlOutput = xmlBuilder.build(cleanedJson);
  const outputFilePath = "./output.xml";
  await saveTextFile(outputFilePath, svg.svg());
}

// スクリプトが直接実行された場合のみmainを呼び出し
if (require.main === module) {
  main();
}

export { readTextFile };
