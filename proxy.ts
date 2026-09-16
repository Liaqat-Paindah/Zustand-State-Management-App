import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/register",
  "/products"
];

interface JwtPayload {
  userId: string;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);

  // Preserve the complete requested URL.
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  const response = NextResponse.redirect(loginUrl);

  // Remove invalid/expired token.
  response.cookies.delete("token");

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static/public files.
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes.
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // JWT secret must exist.
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  // Read JWT from HttpOnly cookie.
  const token = request.cookies.get("token")?.value;

  // User is not authenticated.
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    // Verify signature + expiration + JWT validity.
    const payload = jwt.verify(token, secret);

    // Make sure this is the JWT payload shape your application expects.
    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof (payload as JwtPayload).userId !== "string"
    ) {
      return redirectToLogin(request);
    }

    // Authentication successful.
    return NextResponse.next();
  } catch {
    // Invalid, expired, malformed, or incorrectly signed JWT.
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: [
    /*
     * Run proxy for application routes.
     * Static Next.js assets are excluded here.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};