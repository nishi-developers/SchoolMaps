export default defineEventHandler(async () => {
  let data: string | null = null;

  // データの取得
  // 試す関数のリスト（優先順位順）
  const strategies = [
    () => selectRedis("detail"),
    () => selectDb("release", "detail"),
    () => getFile("detail"),
  ];

  for (const strategy of strategies) {
    try {
      data = await strategy();
      break; // 成功したらループを抜ける
    } catch {
      continue; // 次の戦略を試す
    }
  }

  // すべて失敗した場合
  if (data === null) {
    throw createError({
      statusCode: 500,
      message: "Failed to fetch data from all sources",
    });
  }
  return { v: JSON.parse(data).mapVersion };
});
