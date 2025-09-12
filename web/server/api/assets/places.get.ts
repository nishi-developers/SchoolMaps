import { appendResponseHeader } from "h3";

export default defineEventHandler(async (event) => {
  const { data, contentType } = await provideAssets("places.json");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
