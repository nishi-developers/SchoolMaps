import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import * as readline from "readline";

// ファイルを非同期で読み込む関数
export async function readTextFile(filePath: string): Promise<string | void> {
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
export async function saveTextFile(filePath: string, content: string): Promise<void> {
  try {
    // ファイルが存在する場合は上書き確認
    if (existsSync(filePath)) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer: string = await new Promise((resolve) => {
        rl.question(`ファイル ${filePath} は既に存在します。上書きしますか？ (y/N): `, resolve);
      });
      rl.close();
      if (answer.toLowerCase() !== "y") {
        console.log("保存をキャンセルしました。");
        return;
      }
    }
    await writeFile(filePath, content, "utf-8");
    console.log(`ファイルが保存されました: ${filePath}`);
  } catch (error) {
    console.error(`ファイル保存エラー: ${error}`);
  }
}

export const middlePaths = {
  map: "../maps/map.svg",
  placesData: "../maps/places.csv",
  modesData: "../maps/modes.json",
  floorsData: "../maps/floors.json",
  behaviorsData: "../maps/behaviors.json",
};
