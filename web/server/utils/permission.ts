import type { H3Event } from "h3";

export function checkPermission(event: H3Event): boolean {
  // CookieからJWTを取得
  const cookies = parseCookies(event);
  if (!cookies.jwt) {
    return false;
  }
  // JWTの検証
  const decoded = verifyJwtToken(cookies.jwt);
  if (!decoded || decoded.authed !== true) {
    // JWTが不正->Cookieを消す
    deletePermission(event);
    return false;
  }
  return true;
}

export function setPermission(event: H3Event): void {
  // JWTを生成し、Cookieに保存
  const expiresIn = 86400; // 60 * 60 * 24 * 1 = 1 days
  const token = generateJwtToken({ authed: true }, expiresIn);
  setCookie(event, "jwt", token, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return;
}

export function deletePermission(event: H3Event): void {
  // Cookieを削除
  setCookie(event, "jwt", "", {
    maxAge: -1,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return;
}
