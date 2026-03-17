import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { destination, tariff, carType, airport } = body;

  await dbConnect();
  const updated = await (Rate as any).findByIdAndUpdate(
    id,
    {
      ...(destination !== undefined && { destination: String(destination).trim() }),
      ...(tariff    !== undefined && { tariff: Number(tariff) }),
      ...(carType   !== undefined && { carType: String(carType).trim() }),
      ...(airport   !== undefined && { airport: String(airport).trim() }),
    },
    { new: true }
  );

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: String(updated._id), destination: updated.destination, tariff: updated.tariff, carType: updated.carType, airport: updated.airport });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await dbConnect();
  await (Rate as any).findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
