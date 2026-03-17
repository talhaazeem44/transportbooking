import mongoose, { Schema } from "mongoose";

export interface RateDoc {
  _id: string;
  destination: string;
  tariff: number;
  carType: string;
  airport: string;
  createdAt: Date;
  updatedAt: Date;
}

const RateSchema = new Schema<RateDoc>(
  {
    destination: { type: String, required: true, trim: true },
    tariff:      { type: Number, required: true },
    carType:     { type: String, required: true, trim: true },
    airport:     { type: String, required: true, trim: true, default: "YYZ" },
  },
  { timestamps: true }
);

export const Rate =
  (mongoose.models.Rate as mongoose.Model<any>) ||
  mongoose.model<RateDoc>("Rate", RateSchema);
