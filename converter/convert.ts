import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

import { XMLParser, XMLBuilder } from "fast-xml-parser";

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
  const xmlOptions = {
    ignoreDeclaration: true,
    ignoreAttributes: false,
  };
  const xmlParser = new XMLParser(xmlOptions);
  const xmlBuilder = new XMLBuilder(xmlOptions);

  const jsonObj = xmlParser.parse(file);

  // const xmlOutput = xmlBuilder.build(cleanedJson);
  // const outputFilePath = "./output.xml";
  // await saveTextFile(outputFilePath, xmlOutput);
}

// スクリプトが直接実行された場合のみmainを呼び出し
if (require.main === module) {
  main();
}

export { readTextFile };
