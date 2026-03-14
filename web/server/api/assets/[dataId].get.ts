import { appendResponseHeader } from "h3";

type data_id = "modes" | "floors" | "behaviors" | "places" | "detail" | "map";
const assets: Record<data_id, string> = {
  modes: "modes.json",
  floors: "floors.json",
  behaviors: "behaviors.json",
  places: "places.json",
  detail: "detail.json",
  map: "map.svg",
};

export default defineEventHandler(async (event) => {
  // パラーメーターの検証
  if (
    event.context.params?.dataId == null || !(event.context.params.dataId in assets)
  ) {
    throw createError({
      statusCode: 404,
      message: "The asset is not found",
    });
  }
  
  // アセットの提供
  const { data, contentType } = await provideAssets(assets[event.context.params.dataId as data_id]);
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
