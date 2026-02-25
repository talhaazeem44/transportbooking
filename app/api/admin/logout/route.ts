import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, removeValidToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(adminCookieName())?.value;
  if (token) {
    removeValidToken(token);
  }

  const response = NextResponse.redirect(new URL("/admin/login", req.url));
  response.cookies.delete(adminCookieName());
  return response;
}
