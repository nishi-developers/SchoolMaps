import { existsSync } from "fs";
import { readFile, writeFile, mkdir } from "fs/promises";
import * as readline from "readline";
import { join, dirname } from "path";

/**
 * カスタムエラークラス
 */
export class FileOperationError extends Error {
  constructor(message: string, public readonly filePath: string, public readonly operation: string) {
    super(message);
    this.name = "FileOperationError";
  }
}

/**
 * ファイルを非同期で読み込む関数
 */
export async function readTextFile(filePath: string): Promise<string> {
  const absolutePath = convertPath(filePath);

  try {
    if (!existsSync(absolutePath)) {
      throw new FileOperationError(`ファイルが見つかりません: ${absolutePath}`, absolutePath, "read");
    }

    const content = await readFile(absolutePath, "utf-8");
    return content;
  } catch (error) {
    if (error instanceof FileOperationError) {
      throw error;
    }
    throw new FileOperationError(`ファイル読み込みエラー: ${error}`, absolutePath, "read");
  }
}

/**
 * ファイルを保存する関数（上書き確認付き）
 */
export async function saveTextFile(filePath: string, content: string, force: boolean = false): Promise<void> {
  const absolutePath = convertPath(filePath);

  try {
    // ディレクトリが存在しない場合は作成
    await ensureDirectoryExists(absolutePath);

    // ファイルが存在する場合は上書き確認（forceフラグがfalseの場合のみ）
    if (!force && existsSync(absolutePath)) {
      const shouldOverwrite = await confirmOverwrite(absolutePath);
      if (!shouldOverwrite) {
        console.log("保存をキャンセルしました。");
        return;
      }
    }

    await writeFile(absolutePath, content, "utf-8");
    console.log(`ファイルが保存されました: ${absolutePath}`);
  } catch (error) {
    throw new FileOperationError(`ファイル保存エラー: ${error}`, absolutePath, "write");
  }
}

/**
 * ディレクトリの存在を確認し、存在しない場合は作成
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * 上書き確認のプロンプト
 */
async function confirmOverwrite(filePath: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer: string = await new Promise((resolve) => {
      rl.question(`ファイル ${filePath} は既に存在します。上書きしますか？ (y/N): `, resolve);
    });
    return answer.toLowerCase() === "y";
  } finally {
    rl.close();
  }
}

/**
 * プロジェクトルートからの相対パスを絶対パスに変換
 */
function convertPath(path: string): string {
  return join(__dirname, "../..", path);
}

/**
 * CSV フィールドをエスケープする関数
 */
export function escapeCsvField(field: string): string {
  return `"${field.replace(/"/g, '""')}"`;
}

/**
 * CSVの行を解析する関数
 */
export function parseCsvLine(line: string): string[] {
  const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  return columns.map((column) => {
    const trimmed = column.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  });
}
