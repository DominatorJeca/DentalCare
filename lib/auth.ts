import { SignJWT, jwtVerify } from "jose"
import type { AdminSession } from "@/types"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
export const COOKIE_NAME = "admin_session"

export async function signToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}
