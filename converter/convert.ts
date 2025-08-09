import { readFileSync, existsSync } from "fs";
import { readFile } from "fs/promises";
import { join, resolve } from "path";

// テキストファイルを読み込んでconsole.logする関数
function readTextFile(filePath: string): void {
  try {
    // ファイルが存在するかチェック
    if (!existsSync(filePath)) {
      console.error(`エラー: ファイルが見つかりません: ${filePath}`);
      return;
    }

    // ファイルを同期的に読み込み
    const content = readFileSync(filePath, "utf-8");

    console.log(`=== ファイル内容: ${filePath} ===`);
    console.log(content);
    console.log(`=== 読み込み完了 ===`);
  } catch (error) {
    console.error(`ファイル読み込みエラー: ${error}`);
  }
}

// 非同期版の関数
async function readTextFileAsync(filePath: string): Promise<void> {
  try {
    // ファイルが存在するかチェック
    if (!existsSync(filePath)) {
      console.error(`エラー: ファイルが見つかりません: ${filePath}`);
      return;
    }

    // ファイルを非同期で読み込み
    const content = await readFile(filePath, "utf-8");

    console.log(`=== ファイル内容 (非同期): ${filePath} ===`);
    console.log(content);
    console.log(`=== 読み込み完了 ===`);
  } catch (error) {
    console.error(`ファイル読み込みエラー: ${error}`);
  }
}

// メイン実行部分
function main(): void {
  // コマンドライン引数からファイルパスを取得
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: npm run start <ファイルパス>");
    console.log("例: npm run start ../README.md");

    // デモ用にREADME.mdを読み込んでみる
    const demoFile = join(__dirname, "..", "README.md");
    console.log("\nデモ: README.mdを読み込みます...");
    readTextFile(demoFile);
    return;
  }

  const filePath = args[0];
  const resolvedPath = resolve(filePath);

  console.log(`ファイルパス: ${resolvedPath}`);

  // 同期版で読み込み
  readTextFile(resolvedPath);

  // 非同期版でも読み込み（デモ用）
  console.log("\n--- 非同期版でも読み込み ---");
  readTextFileAsync(resolvedPath);
}

// スクリプトが直接実行された場合のみmainを呼び出し
if (require.main === module) {
  main();
}

export { readTextFile, readTextFileAsync };
