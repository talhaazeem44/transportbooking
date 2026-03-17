import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { VehiclePreference } from "@/models/VehiclePreference";
import { isAdminRequest } from "@/lib/adminAuth";
import { Rate } from "@/models/Rate";

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
  const { name, category, image, passengers, luggage, description, rate } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await dbConnect();

  // Get old name to update rates if renamed
  const existing = await (VehiclePreference as any).findById(id).lean();
  const oldName = existing?.name;
  const newName = name.trim();

  await VehiclePreference.updateOne(
    { _id: id },
    {
      $set: {
        name: newName,
        category: category?.trim() || "",
        image: image?.trim() || "",
        passengers: Number(passengers) || 0,
        luggage: Number(luggage) || 0,
        description: description?.trim() || "",
        rate: Number(rate) || 0,
      },
    }
  );

  // Update all rates if name changed
  if (oldName && oldName !== newName) {
    await (Rate as any).updateMany(
      { carType: oldName },
      { $set: { carType: newName } }
    );
  }

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

  // Get vehicle name to delete related rates
  const vehicle = await (VehiclePreference as any).findById(id).lean();
  if (vehicle?.name) {
    await (Rate as any).deleteMany({ carType: vehicle.name });
  }

  await VehiclePreference.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

