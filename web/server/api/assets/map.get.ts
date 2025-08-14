import { appendResponseHeader } from "h3";

export default defineEventHandler((event) => {
  const { data, contentType } = provideAssets("map.svg");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
