import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";
import { VehiclePreference } from "@/models/VehiclePreference";

// GET /api/rates/compare?destination=Barrie
// Returns all vehicles with their tariff for a given destination
export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination");
  const airport = req.nextUrl.searchParams.get("airport") || "YYZ";
  if (!destination) {
    return NextResponse.json({ error: "destination query param required" }, { status: 400 });
  }

  await dbConnect();

  // Get all rates for this destination + airport
  const rates = await (Rate as any).find({ destination, airport }).lean();

  // Get all vehicles to include passengers
  const vehicles = await VehiclePreference.find({}).lean();
  const vehicleMap: Record<string, number> = {};
  for (const v of vehicles) {
    vehicleMap[v.name] = v.passengers ?? 4;
  }

  const result = rates.map((r: any) => ({
    carType: r.carType,
    tariff: r.tariff,
    maxPassengers: vehicleMap[r.carType] ?? 4,
    total: +(r.tariff * 1.33).toFixed(2),
  }));

  // Sort by tariff ascending
  result.sort((a: any, b: any) => a.tariff - b.tariff);

  return NextResponse.json(result);
}
