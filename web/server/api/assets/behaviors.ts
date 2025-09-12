import { appendResponseHeader } from "h3";

export default defineEventHandler(async (event) => {
  const { data, contentType } = await provideAssets("behaviors.json");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
