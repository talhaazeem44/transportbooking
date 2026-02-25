import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ServiceType } from "@/models/ServiceType";
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
  const { name } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await dbConnect();
  await ServiceType.updateOne({ _id: id }, { $set: { name: name.trim() } });
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
  await ServiceType.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

