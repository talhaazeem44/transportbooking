import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";

// GET /api/rates/destinations?carType=Sedan
// Returns unique destinations for a given car type
export async function GET(req: NextRequest) {
  const carType = req.nextUrl.searchParams.get("carType");
  const airport = req.nextUrl.searchParams.get("airport") || "YYZ";
  if (!carType) {
    return NextResponse.json({ error: "carType query param required" }, { status: 400 });
  }

  await dbConnect();
  const destinations: string[] = await (Rate as any).distinct("destination", { carType, airport });
  destinations.sort((a: string, b: string) => a.localeCompare(b));

  return NextResponse.json(destinations);
}
