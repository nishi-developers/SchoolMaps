import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY!; // JWTの秘密鍵
if (!SECRET_KEY || SECRET_KEY.length === 0) {
  throw new Error("JWT_SECRET_KEY is not defined");
}

// Function to generate a JWT
interface generatePayload {
  authed: boolean;
}
export function generateJwtToken(
  payload: generatePayload,
  expiresIn: number
): string {
  // expiresIn -> 現在からの秒指定
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Function to verify a JWT
interface verifyPayload {
  authed: boolean;
  iat: number; // 発行時間
  exp: number; // 有効期限
}
export function verifyJwtToken(token: string): verifyPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // トークンが有効(Payloadを返す)
    return decoded as verifyPayload;
  } catch {
    // トークンが無効(Nullを返す)
    // 有効期限が過ぎている場合もここに来る
    return null;
  }
}
