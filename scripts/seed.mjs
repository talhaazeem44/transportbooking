import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env or .env.local if they exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadEnvFile = (filename) => {
  const envPath = join(__dirname, "..", filename);
  try {
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...values] = trimmed.split("=");
        if (key && values.length) {
          const value = values.join("=").trim().replace(/^["']|["']$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
    return true;
  } catch (e) {
    return false;
  }
};

// Try .env.local first, then .env
loadEnvFile(".env.local");
loadEnvFile(".env");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/transportbooking";

const serviceTypes = [
  "Airport Transfer",
  "Point to Point",
  "Hourly / Charter",
  "Wedding Service",
  "Prom / Graduation",
  "Corporate Event",
];

const vehicles = [
  {
    name: "Executive Sedan",
    category: "Business Class",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
    passengers: 3,
    luggage: 3,
    description: "Elegant BMW 7 Series or Lincoln Continental for sophisticated city travel.",
    rate: 120,
  },
  {
    name: "Luxury SUV",
    category: "Elite Comfort",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
    passengers: 6,
    luggage: 6,
    description: "Cadillac Escalade or GMC Yukon XL offering spacious, premium travel.",
    rate: 180,
  },
  {
    name: "Tesla Model S",
    category: "Eco-Luxury",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
    passengers: 3,
    luggage: 3,
    description: "Zero-emission, silent, and cutting-edge luxury at our standard rates.",
    rate: 150,
  },
  {
    name: "Stretch Limousine",
    category: "Classic Luxury",
    image: "https://images.unsplash.com/photo-1511210352396-54a060633c32?q=80&w=2114&auto=format&fit=crop",
    passengers: 8,
    luggage: 4,
    description: "The ultimate statement for weddings, proms, and gala events.",
    rate: 250,
  },
  {
    name: "Mercedes Sprinter",
    category: "Group Travel",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop",
    passengers: 14,
    luggage: 14,
    description: "Premium group transportation with ample space for luggage and comfort.",
    rate: 300,
  },
  {
    name: "SUV Stretch Limo",
    category: "Party Elite",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop",
    passengers: 16,
    luggage: 8,
    description: "Massive presence and ultra-luxury interior for the biggest occasions.",
    rate: 350,
  },
];

async function main() {
  console.log("🌱 Starting database seed...");
  console.log("📡 Connecting to MongoDB...");
  
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "transportbooking",
  });

  console.log("✅ Connected to MongoDB");

  const ServiceType =
    mongoose.models.ServiceType ||
    mongoose.model(
      "ServiceType",
      new mongoose.Schema(
        { name: { type: String, required: true, unique: true, trim: true } },
        { timestamps: true }
      )
    );

  const VehiclePreference =
    mongoose.models.VehiclePreference ||
    mongoose.model(
      "VehiclePreference",
      new mongoose.Schema(
        {
          name: { type: String, required: true, unique: true, trim: true },
          category: { type: String, trim: true },
          image: { type: String, trim: true },
          passengers: { type: Number, default: 0 },
          luggage: { type: Number, default: 0 },
          description: { type: String, trim: true },
          rate: { type: Number, default: 0 },
        },
        { timestamps: true }
      )
    );

  console.log("📝 Seeding service types...");
  for (const name of serviceTypes) {
    await ServiceType.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    console.log(`  ✓ ${name}`);
  }

  console.log("🚗 Seeding vehicles...");
  for (const vehicle of vehicles) {
    // Update image if it's a local path, otherwise just upsert
    const updateData = {
      $setOnInsert: {
        name: vehicle.name,
        category: vehicle.category,
        image: vehicle.image,
        passengers: vehicle.passengers,
        luggage: vehicle.luggage,
        description: vehicle.description,
        rate: vehicle.rate || 0,
      },
    };
    
    // If vehicle exists with local image path, update it
    const existing = await VehiclePreference.findOne({ name: vehicle.name }).lean();
    if (existing && (existing.image?.startsWith("/uploads/") || existing.image?.includes("railway.app/uploads/"))) {
      updateData.$set = { image: vehicle.image, rate: vehicle.rate || 0 };
    }
    
    await VehiclePreference.updateOne(
      { name: vehicle.name },
      updateData,
      { upsert: true }
    );
    console.log(`  ✓ ${vehicle.name}`);
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .then(async () => {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await mongoose.disconnect();
    process.exit(1);
  });
