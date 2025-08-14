import { readFileSync } from "fs";
import { resolve } from "path";

export function provideAssets(fileName: string) {
  // jsonファイルを読み込む
  const filePath = resolve(process.cwd(), `server/assets/${fileName}`);
  const data = readFileSync(filePath, "utf-8");

  // 拡張子よりContent-Typeを設定
  let contentType = "application/octet-stream"; // デフォルトのContent-Type
  const ext = fileName.split(".").pop();
  if (ext == "json") {
    contentType = "application/json";
  } else if (ext == "svg") {
    contentType = "image/svg+xml";
  }

  return {
    contentType,
    data,
  };
}
