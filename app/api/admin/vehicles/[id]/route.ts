import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VehiclePreference } from "@/models/VehiclePreference";
import { isAdminRequest } from "@/lib/adminAuth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const { name, category, image, passengers, luggage, description } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await dbConnect();
  await VehiclePreference.updateOne(
    { _id: id },
    {
      $set: {
        name: name.trim(),
        category: category?.trim() || "",
        image: image?.trim() || "",
        passengers: Number(passengers) || 0,
        luggage: Number(luggage) || 0,
        description: description?.trim() || "",
      },
    }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const { id } = await context.params;
  await dbConnect();
  await VehiclePreference.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

