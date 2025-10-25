export default defineEventHandler(async () => {
  const { data } = await provideAssets("detail.json");
  const version = JSON.parse(data).mapVersion;
  return { v: version };
});
