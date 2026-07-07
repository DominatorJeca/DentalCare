import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { COOKIE_NAME } from "@/lib/auth"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login", "/api/admin/auth/logout"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const isApiRoute = pathname.startsWith("/api/admin")
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    if (isApiRoute) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    if (isApiRoute) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
}
