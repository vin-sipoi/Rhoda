import { NextRequest, NextResponse } from "next/server";

// Set this to your Strapi backend URL, or use an environment variable
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_GOOGLE_CONNECT = `${STRAPI_URL}/api/connect/google`;

export async function GET(req: NextRequest) {
  // If Strapi redirected back with tokens, handle them
  const searchParams = req.nextUrl.searchParams;
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");

  if (accessToken || refreshToken) {
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    if (accessToken) {
      response.cookies.set("access_token", accessToken, { httpOnly: true });
    }
    if (refreshToken) {
      response.cookies.set("refresh_token", refreshToken, { httpOnly: true });
    }
    return response;
  }

  // Otherwise, start the OAuth flow by redirecting to Strapi
  return NextResponse.redirect(STRAPI_GOOGLE_CONNECT);
}

