import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { ServiceType } from "@/models/ServiceType";
import { VehiclePreference } from "@/models/VehiclePreference";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  // TEMPORARY: Allow without auth for testing
  // if (!isAdminRequest(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  await dbConnect();

  const reservations = await Reservation.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const serviceIds = Array.from(
    new Set(reservations.map((r) => String(r.serviceTypeId)))
  );
  const vehicleIds = Array.from(
    new Set(reservations.map((r) => String(r.vehiclePreferenceId)))
  );

  const [services, vehicles] = await Promise.all([
    ServiceType.find({ _id: { $in: serviceIds } }, { name: 1 }).lean(),
    VehiclePreference.find({ _id: { $in: vehicleIds } }, { name: 1 }).lean(),
  ]);

  const serviceMap = new Map(services.map((s) => [String(s._id), s.name]));
  const vehicleMap = new Map(vehicles.map((v) => [String(v._id), v.name]));

  const data = reservations.map((r) => ({
    id: String(r._id),
    status: r.status,
    createdAt: r.createdAt,
    name: r.name,
    email: r.email,
    phone: r.phone,
    serviceType: serviceMap.get(String(r.serviceTypeId)) ?? "",
    vehiclePreference: vehicleMap.get(String(r.vehiclePreferenceId)) ?? "",
    pickupAt: r.pickupAt,
    pickupAddress: r.pickupAddress,
  }));

  return NextResponse.json(data);
}

