import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Grab query params from Strapi
  const searchParams = req.nextUrl.searchParams;
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");

  // You can store tokens in cookies for session handling
  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  if (accessToken) {
    response.cookies.set("access_token", accessToken, { httpOnly: true });
  }
  if (refreshToken) {
    response.cookies.set("refresh_token", refreshToken, { httpOnly: true });
  }

  return response;
}

