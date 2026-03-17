import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Airport } from "@/models/Airport";
import { Rate } from "@/models/Rate";

// PATCH — update airport name/code (updates related rates too)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const { name, code } = body;

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
  }

  await dbConnect();

  const airport = await (Airport as any).findById(id);
  if (!airport) {
    return NextResponse.json({ error: "Airport not found" }, { status: 404 });
  }

  const oldCode = airport.code;
  const newCode = code.trim().toUpperCase();

  airport.name = name.trim();
  airport.code = newCode;
  await airport.save();

  // Update all rates if code changed
  if (oldCode !== newCode) {
    await (Rate as any).updateMany(
      { airport: oldCode },
      { $set: { airport: newCode } }
    );
  }

  return NextResponse.json({
    id: String(airport._id),
    name: airport.name,
    code: airport.code,
    createdAt: airport.createdAt,
  });
}

// DELETE — delete airport + all its rates
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await dbConnect();

  const airport = await (Airport as any).findById(id);
  if (!airport) {
    return NextResponse.json({ error: "Airport not found" }, { status: 404 });
  }

  await (Rate as any).deleteMany({ airport: airport.code });
  await (Airport as any).findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
