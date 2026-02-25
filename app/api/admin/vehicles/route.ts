import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VehiclePreference } from "@/models/VehiclePreference";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  await dbConnect();
  const items = await VehiclePreference.find({})
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
    }))
  );
}

export async function POST(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const body = await req.json().catch(() => ({}));
  const { name, category, image, passengers, luggage, description } = body;
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
  });
  return NextResponse.json(
    {
      id: String(created._id),
      name: created.name,
      category: created.category,
      image: created.image,
      passengers: created.passengers,
      luggage: created.luggage,
      description: created.description,
    },
    { status: 201 }
  );
}

