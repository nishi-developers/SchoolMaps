import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const body = await readBody(event);
  const isValid = await bcrypt.compare(
    body.password,
    runtimeConfig.hashedPassword
  );
  if (isValid) {
    setPermission(event);
    return { success: true };
  } else {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
