/**
 * @file middleware.js
 * @description Middleware for handling security headers and CORS
 * @requires next/server
 */

import { NextResponse } from 'next/server';

/**
 * Validates environment variables
 * @throws {Error} If required environment variables are missing
 */
const validateEnvVars = () => {
  const requiredVars = [
    'NEXT_PUBLIC_HUDDLE_API_KEY',
    'NEXT_PUBLIC_PROJECT_ID',
    'NEXT_PUBLIC_CLIENT_KEY',
    'NEXT_PUBLIC_SERVER_KEY',
    'NEXT_PUBLIC_APP_ID'
  ];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

/**
 * Middleware function to handle security headers and CORS
 * @param {Request} request - The incoming request
 * @returns {NextResponse} The response with security headers
 */
export function middleware(request) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=()");

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}

/**
 * Configuration for middleware matcher
 * @type {Object}
 */
export const config = {
  matcher: "/api/:path*",
}; 