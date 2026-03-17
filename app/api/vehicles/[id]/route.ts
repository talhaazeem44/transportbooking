import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VehiclePreference } from "@/models/VehiclePreference";
import mongoose from "mongoose";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const v = await (VehiclePreference as any).findById(id).lean();
  if (!v) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: String(v._id),
    name: v.name,
    category: v.category || "",
    image: v.image || "",
    passengers: v.passengers || 0,
    luggage: v.luggage || 0,
    description: v.description || "",
    rate: v.rate || 0,
  });
}
