export default defineEventHandler(async (event) => {
  deletePermission(event);
  return { success: true };
});
