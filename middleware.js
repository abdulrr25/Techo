import { NextResponse } from "next/server";

/**
 * Middleware for API routes — adds CORS headers.
 * Security headers (X-Frame-Options, CSP, etc.) are handled in next.config.js.
 */
export function middleware(request) {
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
