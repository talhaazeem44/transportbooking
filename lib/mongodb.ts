import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/transportbooking";

const isDev = process.env.NODE_ENV !== "production";

let cached = globalThis.mongooseConn;
if (!cached) {
  cached = globalThis.mongooseConn = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = (async () => {
      // Log connection attempt (hide credentials)
      const safeUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
      console.log("[MongoDB] Connecting to", safeUri);
      try {
        const conn = await mongoose.connect(MONGODB_URI, {
          dbName: process.env.MONGODB_DB || "transportbooking",
        });
        console.log("[MongoDB] ✅ Connected successfully");
        return conn;
      } catch (err: any) {
        console.error("[MongoDB] ❌ Connection error:", err?.message || err);
        throw err;
      }
    })();
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}

