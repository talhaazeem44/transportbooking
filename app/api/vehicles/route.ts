import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VehiclePreference } from "@/models/VehiclePreference";

export async function GET() {
  await dbConnect();
  const items = await VehiclePreference.find({})
    .sort({ name: 1 })
    .lean();
  return NextResponse.json({
    items: items.map((x) => ({
      id: String(x._id),
      name: x.name,
      category: x.category || "",
      image: x.image || "",
      passengers: x.passengers || 0,
      luggage: x.luggage || 0,
      description: x.description || "",
    })),
  });
}

