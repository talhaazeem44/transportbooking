import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ServiceType } from "@/models/ServiceType";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  await dbConnect();
  const items = await ServiceType.find({}, { name: 1 })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(
    items.map((x) => ({ id: String(x._id), name: x.name }))
  );
}

export async function POST(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const { name } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await dbConnect();
  const created = await ServiceType.create({ name: name.trim() });
  return NextResponse.json(
    { id: String(created._id), name: created.name },
    { status: 201 }
  );
}

