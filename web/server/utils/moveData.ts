type data_id = "modes" | "floors" | "behaviors" | "places" | "detail" | "map";

export async function asset2draft(id: data_id) {
  const data = await getAsset(id);
  await useDrizzle()
    .insert(tables.draft)
    .values({
      id: id,
      content: data,
      editedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: tables.draft.id,
      set: {
        content: data,
        editedAt: new Date(),
      },
    })
    .catch((e) => {
      throw new Error(`Failed to insert draft for ${id}: ${e.message}`);
    });
}

async function getAsset(id: data_id): Promise<string> {
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
