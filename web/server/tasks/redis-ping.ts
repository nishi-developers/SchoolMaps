export default defineTask({
  meta: {
    name: "redis-ping",
    description: "Redisへアクセスして自動停止を阻止",
  },
  async run() {
    try {
      await selectRedis("detail");
      return { result: "Success" };
    } catch (e) {
      console.log("Redis ping failed:", e);
      return { result: "Failed", error: e };
    }
  },
});
