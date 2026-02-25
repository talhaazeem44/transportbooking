import mongoose, { Schema } from "mongoose";

export interface AdminDoc {
  _id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Admin =
  (mongoose.models.Admin as mongoose.Model<any>) ||
  mongoose.model<AdminDoc>("Admin", AdminSchema);
