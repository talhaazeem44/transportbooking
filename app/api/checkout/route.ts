import { dbConnect } from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import { ratesData } from "@/lib/ratesData";
import { createReservationSchema, toPickupAt } from "@/lib/validation";
import { NextResponse } from "next/server";
import { Reservation } from "@/models/Reservation";
import { ServiceType } from "@/models/ServiceType";
import { VehiclePreference } from "@/models/VehiclePreference";
import { getIo } from "@/lib/socket";

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
      { name: 1, rate: 1, category: 1 } as any
    ).lean(),
  ]);

  if (!serviceType || !vehiclePreference) {
    return NextResponse.json(
      { error: "Invalid serviceTypeId or vehiclePreferenceId" },
      { status: 400 }
    );
  }

  // Determine base rate
  let baseRate = (vehiclePreference as any).rate || 0;
  
  if (payload.city) {
    const cityData = ratesData.find(c => c.city === payload.city);
    if (cityData) {
      const vPref = vehiclePreference as any;
      const isPremium = vPref.name.toLowerCase().includes("suv") || 
                        vPref.name.toLowerCase().includes("limo") || 
                        vPref.name.toLowerCase().includes("sprinter") ||
                        (vPref.category && vPref.category.toLowerCase().includes("business")) ||
                        (vPref.category && vPref.category.toLowerCase().includes("elite"));
      
      const cityRate = isPremium ? cityData.limo : cityData.taxi;
      if (cityRate) {
        baseRate = cityRate;
      }
    }
  }

  if (baseRate <= 0) {
    return NextResponse.json(
      { error: "This vehicle does not have a price set. Please contact us." },
      { status: 400 }
    );
  }
  
  // Calculate total with surcharges to match frontend
  const fuelSurcharge = baseRate * 0.05;
  const hst = baseRate * 0.13;
  const gratuity = baseRate * 0.15;
  const totalRate = baseRate + fuelSurcharge + hst + gratuity;

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
    city: payload.city || null,
    pickupAddress: payload.pickupAddress,
    destinationAddress: payload.destinationAddress,
    airline: payload.airline || null,
    flightNumber: payload.flightNumber || null,
    message: payload.message || null,
    paymentStatus: "PENDING",
  });

  const amountInCents = Math.round(totalRate * 100);

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

  // Emit socket notification to admin
  try {
    const io = getIo() || (global as any).tbIo || (global as any).io;
    if (io) {
      io.emit("reservation:new", {
        id: String(created._id),
        createdAt: created.createdAt,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        serviceType: (serviceType as any).name,
        vehiclePreference: (vehiclePreference as any).name,
        pickupAt,
        pickupAddress: payload.pickupAddress,
        destinationAddress: payload.destinationAddress,
        paymentStatus: "PENDING",
      });
      console.log("[Checkout] Socket notification emitted for reservation:", String(created._id));
    } else {
      console.warn("[Checkout] Socket.IO instance not found - notification skipped");
    }
  } catch (err: any) {
    console.error("[Checkout] Socket error:", err?.message);
  }

  return NextResponse.json({ url: session.url });
}

function getBaseUrl(req: Request): string {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}
