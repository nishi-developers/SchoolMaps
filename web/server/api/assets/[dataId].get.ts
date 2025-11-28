type data_id = "modes" | "floors" | "behaviors" | "places" | "detail" | "map";
const dataIds: data_id[] = [
  "modes",
  "floors",
  "behaviors",
  "places",
  "detail",
  "map",
];

export default defineEventHandler(async (event) => {
  // パラーメーターの検証
  if (
    event.context.params?.dataId == null ||
    !dataIds.includes(event.context.params.dataId as data_id)
  ) {
    throw createError({
      statusCode: 404,
      message: "The asset is not found",
    });
  }

  const dataId = event.context.params.dataId as data_id;
  let dataString: string | null = null;
  let dataSource: string | null = null;

  // データの取得
  // 試す関数のリスト（優先順位順）
  const strategies = [
    async () => {
      const res = await selectRadis(dataId);
      return [res, "redis"];
    },
    async () => {
      const res = await selectDb("release", dataId);
      return [res, "database"];
    },
    async () => {
      const res = await getFile(dataId);
      return [res, "file"];
    },
  ];

  for (const strategy of strategies) {
    try {
      [dataString, dataSource] = await strategy();
      break; // 成功したらループを抜ける
    } catch {
      continue; // 次の戦略を試す
    }
  }

  // すべて失敗した場合
  if (dataString === null || dataSource === null) {
    throw createError({
      statusCode: 500,
      message: "Failed to fetch data from all sources",
    });
  }

  // レスポンスの設定
  if (dataId === "map") {
    appendResponseHeader(event, "Content-Type", "image/svg+xml");
  } else {
    appendResponseHeader(event, "Content-Type", "application/json");
  }

  // detailに限り、データにdataSourceを追加
  if (dataId === "detail") {
    const detailData = JSON.parse(dataString);
    detailData.dataSource = dataSource;
    dataString = JSON.stringify(detailData);
  }

  return dataString;
});
