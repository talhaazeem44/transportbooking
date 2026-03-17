import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Airport } from "@/models/Airport";
import { Rate } from "@/models/Rate";
import { VehiclePreference } from "@/models/VehiclePreference";
import { ratesData } from "@/lib/ratesData";

// GET — list all airports
export async function GET() {
  await dbConnect();
  const items = await (Airport as any).find({}).sort({ code: 1 }).lean();
  return NextResponse.json(
    items.map((a: any) => ({
      id: String(a._id),
      name: a.name,
      code: a.code,
      createdAt: a.createdAt,
    }))
  );
}

// POST — create airport + auto-seed rates for all vehicles × all destinations
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, code } = body;

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
  }

  await dbConnect();

  const existing = await (Airport as any).findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    return NextResponse.json({ error: "Airport code already exists" }, { status: 409 });
  }

  const created = await (Airport as any).create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
  });

  // Get all vehicles
  const vehicles = await VehiclePreference.find({}).lean();

  // Seed rates: for each vehicle × each destination
  const rateDocs: any[] = [];
  for (const v of vehicles) {
    for (const r of ratesData) {
      rateDocs.push({
        destination: r.city,
        tariff: r.taxi ?? 0,
        carType: v.name,
        airport: created.code,
      });
    }
  }

  let ratesSeeded = 0;
  if (rateDocs.length > 0) {
    try {
      const result = await (Rate as any).insertMany(rateDocs, { ordered: false });
      ratesSeeded = result.length;
    } catch (e: any) {
      if (e?.code !== 11000) console.error("Rate seed error:", e);
      ratesSeeded = e?.insertedDocs?.length ?? rateDocs.length;
    }
  }

  return NextResponse.json(
    {
      id: String(created._id),
      name: created.name,
      code: created.code,
      createdAt: created.createdAt,
      ratesSeeded,
      vehicleCount: vehicles.length,
    },
    { status: 201 }
  );
}
