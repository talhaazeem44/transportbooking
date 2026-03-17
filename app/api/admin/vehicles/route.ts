import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VehiclePreference } from "@/models/VehiclePreference";
import { isAdminRequest } from "@/lib/adminAuth";
import { Rate } from "@/models/Rate";
import { Airport } from "@/models/Airport";
import { ratesData } from "@/lib/ratesData";

export async function GET(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  await dbConnect();
  const items = await VehiclePreference.find({} as any)
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(
    items.map((x) => ({
      id: String(x._id),
      name: x.name,
      category: x.category || "",
      image: x.image || "",
      passengers: x.passengers || 0,
      luggage: x.luggage || 0,
      description: x.description || "",
      rate: x.rate || 0,
    }))
  );
}

export async function POST(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const body = await req.json().catch(() => ({}));
  const { name, category, image, passengers, luggage, description, rate } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await dbConnect();
  const created = await VehiclePreference.create({
    name: name.trim(),
    category: category?.trim() || "",
    image: image?.trim() || "",
    passengers: Number(passengers) || 0,
    luggage: Number(luggage) || 0,
    description: description?.trim() || "",
    rate: Number(rate) || 0,
  });
  // Auto-seed rates for this vehicle across ALL airports
  const carTypeName = created.name.trim();
  const airports = await (Airport as any).find({}).lean();
  const rateDocs: any[] = [];
  for (const ap of airports) {
    for (const r of ratesData) {
      rateDocs.push({
        destination: r.city,
        tariff: r.taxi ?? 0,
        carType: carTypeName,
        airport: ap.code,
      });
    }
  }

  let ratesSeeded = 0;
  try {
    const result = await (Rate as any).insertMany(rateDocs, { ordered: false });
    ratesSeeded = result.length;
  } catch (e: any) {
    if (e?.code !== 11000) console.error("Rate seed error:", e);
    ratesSeeded = e?.insertedDocs?.length ?? rateDocs.length;
  }

  return NextResponse.json(
    {
      id: String(created._id),
      name: created.name,
      category: created.category,
      image: created.image,
      passengers: created.passengers,
      luggage: created.luggage,
      description: created.description,
      rate: created.rate,
      ratesSeeded,
    },
    { status: 201 }
  );
}

