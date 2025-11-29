export default defineEventHandler(async (event) => {
  // adminページ以外はスルー
  const routePath = getRequestURL(event).pathname;
  if (!routePath.startsWith("/admin") && !routePath.startsWith("/api/admin")) {
    return;
  }
  // JWTの検証
  if (!checkPermission(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
