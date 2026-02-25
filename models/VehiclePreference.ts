import mongoose, { Schema } from "mongoose";

export interface VehiclePreferenceDoc {
  _id: string;
  name: string;
  category?: string;
  image?: string;
  passengers?: number;
  luggage?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehiclePreferenceSchema = new Schema<VehiclePreferenceDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true },
    image: { type: String, trim: true },
    passengers: { type: Number, default: 0 },
    luggage: { type: Number, default: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const VehiclePreference =
  (mongoose.models.VehiclePreference as mongoose.Model<any>) ||
  mongoose.model<VehiclePreferenceDoc>("VehiclePreference", VehiclePreferenceSchema);

