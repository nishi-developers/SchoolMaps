import { appendResponseHeader } from "h3";

export default defineEventHandler(async (event) => {
  const { data, contentType } = await provideAssets("map.svg");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
