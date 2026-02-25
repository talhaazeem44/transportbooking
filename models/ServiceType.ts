import mongoose, { Schema } from "mongoose";

const ServiceTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const ServiceType =
  (mongoose.models.ServiceType as mongoose.Model<any>) ||
  mongoose.model("ServiceType", ServiceTypeSchema);

