import { appendResponseHeader } from "h3";

export default defineEventHandler(async (event) => {
  const { data, contentType } = await provideAssets("modes.json");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
