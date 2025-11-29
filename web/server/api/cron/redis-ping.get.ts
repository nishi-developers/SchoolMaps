export default defineEventHandler(async () => {
  try {
    await selectRedis("detail");
    return { result: "Success" };
  } catch (e) {
    console.log("Redis ping failed:", e);
    return { result: "Failed", error: e };
  }
});
