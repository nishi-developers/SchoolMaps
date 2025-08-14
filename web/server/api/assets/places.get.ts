import { appendResponseHeader } from "h3";

export default defineEventHandler((event) => {
  const { data, contentType } = provideAssets("places.json");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
