import { dbConnect } from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import { createReservationSchema, toPickupAt } from "@/lib/validation";
import { NextResponse } from "next/server";
import { Reservation } from "@/models/Reservation";
import { ServiceType } from "@/models/ServiceType";
import { VehiclePreference } from "@/models/VehiclePreference";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = createReservationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        issues: parsed.error.flatten(),
        details: parsed.error.issues.map(
          (e: any) => `${e.path.join(".")}: ${e.message}`
        ),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const pickupAt = toPickupAt(payload.pickupDate, payload.pickupTime);

  await dbConnect();

  const [serviceType, vehiclePreference] = await Promise.all([
    ServiceType.findOne(
      { _id: payload.serviceTypeId } as any,
      { name: 1 } as any
    ).lean(),
    VehiclePreference.findOne(
      { _id: payload.vehiclePreferenceId } as any,
      { name: 1, rate: 1 } as any
    ).lean(),
  ]);

  if (!serviceType || !vehiclePreference) {
    return NextResponse.json(
      { error: "Invalid serviceTypeId or vehiclePreferenceId" },
      { status: 400 }
    );
  }

  const rate = (vehiclePreference as any).rate || 0;
  if (rate <= 0) {
    return NextResponse.json(
      { error: "This vehicle does not have a price set. Please contact us." },
      { status: 400 }
    );
  }

  // Create reservation with PENDING payment status
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
    paymentStatus: "PENDING",
  });

  const amountInCents = Math.round(rate * 100);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: payload.email,
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: `${(serviceType as any).name} - ${(vehiclePreference as any).name}`,
            description: `Pickup: ${payload.pickupAddress} → ${payload.destinationAddress}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      reservationId: String(created._id),
    },
    success_url: `${getBaseUrl(req)}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl(req)}/booking/cancel?reservation_id=${String(created._id)}`,
  });

  // Save session ID on reservation
  await Reservation.updateOne(
    { _id: created._id } as any,
    { stripeSessionId: session.id } as any
  );

  return NextResponse.json({ url: session.url });
}

function getBaseUrl(req: Request): string {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}
