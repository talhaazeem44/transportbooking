import mongoose, { Schema } from "mongoose";

export type ReservationStatus = "NEW" | "CONTACTED" | "CONFIRMED" | "CANCELLED";

const ReservationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"],
      default: "NEW",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceTypeId: { type: Schema.Types.ObjectId, ref: "ServiceType", required: true },
    vehiclePreferenceId: {
      type: Schema.Types.ObjectId,
      ref: "VehiclePreference",
      required: true,
    },
    passengers: { type: Number, required: true },
    bags: { type: Number, required: true },
    pickupAt: { type: Date, required: true },
    pickupAddress: { type: String, required: true, trim: true },
    destinationAddress: { type: String, required: true, trim: true },
    airline: { type: String, default: null, trim: true },
    flightNumber: { type: String, default: null, trim: true },
    message: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

export const Reservation =
  (mongoose.models.Reservation as mongoose.Model<any>) ||
  mongoose.model("Reservation", ReservationSchema);

