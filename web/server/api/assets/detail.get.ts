import { appendResponseHeader } from "h3";

export default defineEventHandler(async (event) => {
  const { data, contentType } = await provideAssets("detail.json");
  const editedData = JSON.parse(data);
  // 一時的にデータベース統合フラグを設定
  editedData.isDatabaseIntegrated = true;
  appendResponseHeader(event, "Content-Type", contentType);
  return editedData;
});
