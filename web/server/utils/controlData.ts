type data_id = "modes" | "floors" | "behaviors" | "places" | "detail" | "map";
type table_type = "release" | "draft";
const dataIds: data_id[] = [
  "modes",
  "floors",
  "behaviors",
  "places",
  "detail",
  "map",
];

async function getFile(id: data_id): Promise<string> {
  let fileName: string;
  switch (id) {
    case "modes":
      fileName = "modes.json";
      break;
    case "floors":
      fileName = "floors.json";
      break;
    case "behaviors":
      fileName = "behaviors.json";
      break;
    case "places":
      fileName = "places.json";
      break;
    case "detail":
      fileName = "detail.json";
      break;
    case "map":
      fileName = "map.svg";
      break;
    default:
      throw new Error(`Invalid data_id: ${id}`);
  }
  const buffer = await useStorage("assets:server").getItemRaw(fileName);
  if (!buffer) {
    throw new Error(`Failed to load asset: ${fileName}`);
  }
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

async function upsertDb(tableType: table_type, id: data_id, content: string) {
  let table;
  switch (tableType) {
    case "release":
      table = tables.mapsData;
      break;
    case "draft":
      table = tables.draft;
      break;
    default:
      throw new Error(`Invalid table_type: ${tableType}`);
  }
  await useDrizzle()
    .insert(table)
    .values({
      id: id,
      content: content,
      editedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: tables.draft.id,
      set: {
        content: content,
        editedAt: new Date(),
      },
    })
    .catch((e) => {
      throw new Error(`Failed to insert draft for ${id}: ${e.message}`);
    });
}

async function selectDb(tableType: table_type, id: data_id): Promise<string> {
  let table;
  switch (tableType) {
    case "release":
      table = tables.mapsData;
      break;
    case "draft":
      table = tables.draft;
      break;
    default:
      throw new Error(`Invalid table_type: ${tableType}`);
  }
  const result = await useDrizzle()
    .select()
    .from(table)
    .where(eq(table.id, id))
    .limit(1)
    .catch((e) => {
      throw new Error(`Failed to select ${id} from ${tableType}: ${e.message}`);
    });
  if (result.length === 0) {
    throw new Error(`No data found for ${id} in ${tableType}`);
  }
  return result[0].content;
}

async function upsertRedis(id: data_id, content: string) {
  // redisは標準でupsert
  await redis.set(id, content);
}

async function selectRedis(id: data_id): Promise<string> {
  let data = (await redis.get(id)) as string | null;
  if (!data) {
    throw new Error(`No data found in redis for ${id}`);
  }
  // 型がobjectの場合はstringに変換
  if (typeof data === "object") {
    data = JSON.stringify(data);
  }
  return data;
}

// 抽象化

async function file2draft() {
  await Promise.all(
    dataIds.map(async (id) => {
      const data = await getFile(id);
      await upsertDb("draft", id, data);
    })
  );
}

async function draft2releaseD() {
  await Promise.all(
    dataIds.map(async (id) => {
      const data = await selectDb("draft", id);
      await upsertDb("release", id, data);
    })
  );
}

async function releaseD2draft() {
  await Promise.all(
    dataIds.map(async (id) => {
      const data = await selectDb("release", id);
      await upsertDb("draft", id, data);
    })
  );
}

async function draft2releaseR() {
  await Promise.all(
    dataIds.map(async (id) => {
      const data = await selectDb("draft", id);
      await upsertRedis(id, data);
    })
  );
}

export {
  file2draft,
  draft2releaseD,
  releaseD2draft,
  draft2releaseR,
  getFile,
  selectDb,
  selectRedis,
};
