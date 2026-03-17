import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/mongodb";
import { Reservation } from "@/models/Reservation";
import { ServiceType } from "@/models/ServiceType";
import { VehiclePreference } from "@/models/VehiclePreference";
import { sendAdminNewReservationEmail } from "@/lib/email";
import { getIo } from "@/lib/socket";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const reservationId = session.metadata?.reservationId;

    if (!reservationId) {
      console.error("[Stripe Webhook] No reservationId in metadata");
      return NextResponse.json({ received: true });
    }

    await dbConnect();

    // Update reservation payment status
    await Reservation.updateOne(
      { _id: reservationId } as any,
      {
        paymentStatus: "PAID",
        stripePaymentIntentId: session.payment_intent,
        amountPaid: session.amount_total,
      } as any
    );

    // Fetch reservation with related data for notifications
    const reservation = await (Reservation as any).findOne({ _id: reservationId }).lean();
    if (!reservation) {
      console.error("[Stripe Webhook] Reservation not found:", reservationId);
      return NextResponse.json({ received: true });
    }

    const [serviceType, vehiclePreference] = await Promise.all([
      ServiceType.findOne(
        { _id: (reservation as any).serviceTypeId } as any,
        { name: 1 } as any
      ).lean(),
      VehiclePreference.findOne(
        { _id: (reservation as any).vehiclePreferenceId } as any,
        { name: 1 } as any
      ).lean(),
    ]);

    // Socket notification
    try {
      const io = getIo() || (global as any).tbIo || (global as any).io;
      if (io) {
        io.emit("reservation:new", {
          id: String((reservation as any)._id),
          createdAt: (reservation as any).createdAt,
          name: (reservation as any).name,
          email: (reservation as any).email,
          phone: (reservation as any).phone,
          serviceType: (serviceType as any)?.name,
          vehiclePreference: (vehiclePreference as any)?.name,
          pickupAt: (reservation as any).pickupAt,
          pickupAddress: (reservation as any).pickupAddress,
          destinationAddress: (reservation as any).destinationAddress,
          paymentStatus: "PAID",
        });
        console.log("[Stripe Webhook] Socket notification emitted for reservation:", reservationId);
      } else {
        console.warn("[Stripe Webhook] Socket.IO instance not found - notification skipped. Make sure app is started via 'node server.js'");
      }
    } catch (err: any) {
      console.error("[Stripe Webhook] Socket error:", err?.message);
    }

    // Email notification
    try {
      await sendAdminNewReservationEmail({
        reservationId: String((reservation as any)._id),
        name: (reservation as any).name,
        email: (reservation as any).email,
        phone: (reservation as any).phone,
        serviceType: (serviceType as any)?.name || "Unknown",
        vehiclePreference: (vehiclePreference as any)?.name || "Unknown",
        pickupAt: (reservation as any).pickupAt,
        pickupAddress: (reservation as any).pickupAddress,
        destinationAddress: (reservation as any).destinationAddress,
      });
    } catch (err: any) {
      console.error("[Stripe Webhook] Email error:", err?.message);
    }

    console.log("[Stripe Webhook] Payment confirmed for reservation:", reservationId);
  }

  return NextResponse.json({ received: true });
}
