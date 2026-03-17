import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Airport } from "@/models/Airport";

export async function GET() {
  await dbConnect();
  const items = await (Airport as any).find({}).sort({ code: 1 }).lean();
  return NextResponse.json(
    items.map((a: any) => ({
      id: String(a._id),
      name: a.name,
      code: a.code,
    }))
  );
}
