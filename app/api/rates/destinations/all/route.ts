import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";

// GET /api/rates/destinations/all?airport=YYZ
export async function GET(req: NextRequest) {
  const airport = req.nextUrl.searchParams.get("airport") || "YYZ";
  await dbConnect();
  const destinations: string[] = await (Rate as any).distinct("destination", { airport });
  destinations.sort((a: string, b: string) => a.localeCompare(b));
  return NextResponse.json(destinations);
}
