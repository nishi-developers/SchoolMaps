export default defineEventHandler(async (event) => {
  const action = event.context.params?.action;
  switch (action) {
    case "file2draft":
      await file2draft();
      break;
    case "release2draft":
      await releaseD2draft();
      break;
    case "draft2release":
      await Promise.all([draft2releaseR(), draft2releaseD()]);
      break;
    default:
      throw createError({
        statusCode: 404,
        message: "The action is not found",
      });
  }
  return { status: "success" };
});
