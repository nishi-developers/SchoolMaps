import { appendResponseHeader } from "h3";

export default defineEventHandler(async (event) => {
  const { data, contentType } = await provideAssets("detail.json");
  const editedData = JSON.parse(data);
  // 一時的にデータベース統合フラグを設定
  editedData.isDatabaseIntegrated = false;
  // 現在時刻が2の倍数時間のときにtrueにする（テスト用）
  // const currentHour = new Date().getSeconds();
  // editedData.isDatabaseIntegrated = currentHour % 2 === 0;
  appendResponseHeader(event, "Content-Type", contentType);
  return editedData;
});
