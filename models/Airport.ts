import mongoose, { Schema } from "mongoose";

export interface AirportDoc {
  _id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const AirportSchema = new Schema<AirportDoc>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  },
  { timestamps: true }
);

export const Airport =
  (mongoose.models.Airport as mongoose.Model<any>) ||
  mongoose.model<AirportDoc>("Airport", AirportSchema);
