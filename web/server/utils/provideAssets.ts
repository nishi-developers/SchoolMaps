export async function provideAssets(fileName: string): Promise<{ data: string; contentType: string }> {
  let data: string;

  // 拡張子よりContent-Typeを設定
  let contentType = "application/octet-stream"; // デフォルトのContent-Type
  const ext = fileName.split(".").pop();

  if (ext === "svg") {
    // SVGの場合はテキストとして明示的に読み込み
    const buffer = await useStorage("assets:server").getItemRaw(fileName);
    if (!buffer) {
      throw new Error(`Failed to load SVG asset: ${fileName}`);
    }
    const decoder = new TextDecoder("utf-8");
    data = decoder.decode(buffer);
    contentType = "image/svg+xml";
  } else if (ext === "json") {
    // JSONの場合はJSONとして読み込み
    const storageData = await useStorage("assets:server").getItem(fileName);
    if (typeof storageData === "object") {
      data = JSON.stringify(storageData);
    } else if (typeof storageData === "string") {
      data = storageData;
    } else {
      throw new Error(`Failed to load asset: ${fileName}`);
    }
    contentType = "application/json";
  } else {
    throw new Error(`Unsupported asset type: ${fileName}`);
  }

  return {
    contentType,
    data,
  };
}
