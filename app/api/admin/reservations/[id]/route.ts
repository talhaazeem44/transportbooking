import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Reservation, ReservationStatus } from "@/models/Reservation";
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
  const { status } = await req.json().catch(() => ({}));
  const allowed: ReservationStatus[] = [
    "NEW",
    "CONTACTED",
    "CONFIRMED",
    "CANCELLED",
  ];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await dbConnect();
  await Reservation.updateOne({ _id: id }, { $set: { status } });
  return NextResponse.json({ ok: true });
}

