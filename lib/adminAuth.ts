import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_COOKIE = "tb_admin";
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || "change-this-secret-key-in-production";

// Generate a secure token for admin session
export function generateAdminToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Store token in memory (in production, use Redis or database)
const validTokens = new Set<string>();

export function addValidToken(token: string) {
  validTokens.add(token);
}

export function removeValidToken(token: string) {
  validTokens.delete(token);
}

export function isValidToken(token: string): boolean {
  return validTokens.has(token);
}

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function isAdminFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}
