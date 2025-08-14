import { appendResponseHeader } from "h3";

export default defineEventHandler((event) => {
  const { data, contentType } = provideAssets("detail.json");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
