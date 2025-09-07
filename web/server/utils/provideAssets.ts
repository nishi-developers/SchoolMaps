export async function provideAssets(fileName: string): Promise<{ data: string; contentType: string }> {
  // jsonファイルを読み込む
  let data = await useStorage("assets:server").getItem(fileName);
  if (typeof data == "object") {
    // オブジェクトの場合はJSON文字列に変換
    data = JSON.stringify(data);
  }
  if (typeof data !== "string") {
    throw new Error(`Failed to load asset: ${fileName}`);
  }

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
