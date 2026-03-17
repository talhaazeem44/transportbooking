import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";

// POST /api/admin/rates/bulk-adjust
// Body: { carType: string, adjustment: number }
// Adds/subtracts the adjustment value to all tariffs for the given carType
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { carType, adjustment, airport } = body;

  if (!carType || typeof carType !== "string") {
    return NextResponse.json({ error: "carType is required" }, { status: 400 });
  }
  if (adjustment === undefined || typeof adjustment !== "number" || adjustment === 0) {
    return NextResponse.json({ error: "adjustment must be a non-zero number" }, { status: 400 });
  }

  await dbConnect();

  const filter: any = { carType };
  if (airport) filter.airport = airport;

  const result = await (Rate as any).updateMany(
    filter,
    { $inc: { tariff: adjustment } }
  );

  return NextResponse.json({
    carType,
    adjustment,
    modifiedCount: result.modifiedCount,
  });
}
