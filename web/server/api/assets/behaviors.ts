import { appendResponseHeader } from "h3";

export default defineEventHandler((event) => {
  const { data, contentType } = provideAssets("behaviors.json");
  appendResponseHeader(event, "Content-Type", contentType);
  return data;
});
