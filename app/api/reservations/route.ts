import { dbConnect } from "@/lib/mongodb";
import { sendAdminNewReservationEmail } from "@/lib/email";
import { getIo } from "@/lib/socket";
import { createReservationSchema, toPickupAt } from "@/lib/validation";
import { NextResponse } from "next/server";
import { Reservation } from "@/models/Reservation";
import { ServiceType } from "@/models/ServiceType";
import { VehiclePreference } from "@/models/VehiclePreference";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = createReservationSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[Reservation] Validation error:", JSON.stringify(parsed.error.flatten(), null, 2));
    return NextResponse.json(
      { 
        error: "Invalid payload", 
        issues: parsed.error.flatten(),
        details: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const pickupAt = toPickupAt(payload.pickupDate, payload.pickupTime);

  await dbConnect();

  const [serviceType, vehiclePreference] = await Promise.all([
    ServiceType.findById(payload.serviceTypeId, { name: 1 }).lean(),
    VehiclePreference.findById(payload.vehiclePreferenceId, { name: 1 }).lean(),
  ]);

  if (!serviceType || !vehiclePreference) {
    return NextResponse.json(
      { error: "Invalid serviceTypeId or vehiclePreferenceId" },
      { status: 400 }
    );
  }

  const created = await Reservation.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    serviceTypeId: payload.serviceTypeId,
    vehiclePreferenceId: payload.vehiclePreferenceId,
    passengers: payload.passengers,
    bags: payload.bags,
    pickupAt,
    pickupAddress: payload.pickupAddress,
    destinationAddress: payload.destinationAddress,
    airline: payload.airline || null,
    flightNumber: payload.flightNumber || null,
    message: payload.message || null,
  });

  // Realtime admin notification
  try {
    const io = getIo();
    console.log("[Reservation] Socket.IO instance:", io ? "Found" : "Not found");
    
    if (io) {
      const notificationData = {
        id: String(created._id),
        createdAt: created.createdAt.toISOString(),
        name: created.name,
        email: created.email,
        phone: created.phone,
        serviceType: serviceType.name,
        vehiclePreference: vehiclePreference.name,
        pickupAt: created.pickupAt.toISOString(),
        pickupAddress: created.pickupAddress,
        destinationAddress: created.destinationAddress,
      };
      
      io.emit("reservation:new", notificationData);
      console.log("[Reservation] ✅ Socket notification sent:", notificationData);
      console.log("[Reservation] Connected clients:", io.sockets.sockets.size);
    } else {
      console.warn("[Reservation] ⚠️ Socket.IO instance not available. Make sure server.js is running.");
    }
  } catch (err: any) {
    console.error("[Reservation] ❌ Socket error:", err?.message || err);
    console.error("[Reservation] Socket error stack:", err?.stack);
  }

  // Email admin
  try {
    console.log("[Reservation] Sending email notification...");
    await sendAdminNewReservationEmail({
      reservationId: String(created._id),
      name: created.name,
      email: created.email,
      phone: created.phone,
      serviceType: serviceType.name,
      vehiclePreference: vehiclePreference.name,
      pickupAt: created.pickupAt,
      pickupAddress: created.pickupAddress,
      destinationAddress: created.destinationAddress,
    });
    console.log("[Reservation] ✅ Email notification sent successfully");
  } catch (err: any) {
    console.error("[Reservation] ❌ Email error:", err?.message || err);
    console.error("[Reservation] Email error stack:", err?.stack);
  }

  return NextResponse.json({ ok: true, reservationId: String(created._id) });
}

