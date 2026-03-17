import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Rate } from "@/models/Rate";

export async function GET() {
  await dbConnect();
  const items = await (Rate as any).find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(
    items.map((r: any) => ({
      id: String(r._id),
      destination: r.destination,
      tariff: r.tariff,
      carType: r.carType,
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  await dbConnect();

  // Accept both a single object and an array
  const entries = Array.isArray(body) ? body : [body];

  const invalid = entries.findIndex(
    (e) => !e.destination || !e.carType || e.tariff === undefined
  );
  if (invalid !== -1) {
    return NextResponse.json(
      { error: `Entry at index ${invalid} is missing destination, tariff, or carType` },
      { status: 400 }
    );
  }

  const docs = entries.map((e) => ({
    destination: String(e.destination).trim(),
    tariff:      Number(e.tariff),
    carType:     String(e.carType).trim(),
  }));

  const created = await (Rate as any).insertMany(docs, { ordered: false });

  const result = created.map((r: any) => ({
    id:          String(r._id),
    destination: r.destination,
    tariff:      r.tariff,
    carType:     r.carType,
  }));

  // Return single object for single entry, array for bulk
  return NextResponse.json(
    result.length === 1 ? result[0] : result,
    { status: 201 }
  );
}
