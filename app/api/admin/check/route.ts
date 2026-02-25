import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const isAdmin = isAdminRequest(req);
  return NextResponse.json({ authenticated: isAdmin });
}
