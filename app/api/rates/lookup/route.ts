import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";

// GET /api/rates/lookup?carType=Sedan&destination=Barrie
// Returns the tariff for a specific car type + destination
export async function GET(req: NextRequest) {
  const carType = req.nextUrl.searchParams.get("carType");
  const destination = req.nextUrl.searchParams.get("destination");
  const airport = req.nextUrl.searchParams.get("airport") || "YYZ";

  if (!carType || !destination) {
    return NextResponse.json({ error: "carType and destination required" }, { status: 400 });
  }

  await dbConnect();
  const rate = await (Rate as any).findOne({ carType, destination, airport }).lean();

  if (!rate) {
    return NextResponse.json({ error: "Rate not found" }, { status: 404 });
  }

  return NextResponse.json({
    destination: rate.destination,
    carType: rate.carType,
    tariff: rate.tariff,
  });
}
