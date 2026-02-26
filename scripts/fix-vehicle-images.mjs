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

loadEnvFile(".env.local");
loadEnvFile(".env");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/transportbooking";

// Vehicle images with external URLs (Unsplash)
const vehicleImages = {
  "Executive Sedan": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
  "Luxury SUV": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
  "Tesla Model S": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop",
  "Stretch Limousine": "https://images.unsplash.com/photo-1511210352396-54a060633c32?q=80&w=2114&auto=format&fit=crop",
  "Mercedes Sprinter": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop",
  "SUV Stretch Limo": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop",
  "Executive Sedans": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop",
  "Luxury SUVs": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
  "Mercedes Sprinter Van": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop",
  "SUV Stretch Limo XL": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop",
};

async function main() {
  console.log("🔧 Fixing vehicle images...");
  console.log("📡 Connecting to MongoDB...");
  
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "transportbooking",
  });

  console.log("✅ Connected to MongoDB");

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

  const vehicles = await VehiclePreference.find({}).lean();
  console.log(`📦 Found ${vehicles.length} vehicles`);

  let updated = 0;
  for (const vehicle of vehicles) {
    const vehicleName = vehicle.name;
    const currentImage = vehicle.image || "";
    
    // Check if image is a local/relative path (needs fixing)
    const needsFix = !currentImage || 
                     currentImage.startsWith("/uploads/") || 
                     currentImage.includes("railway.app/uploads/") ||
                     currentImage.includes("localhost");
    
    if (needsFix && vehicleImages[vehicleName]) {
      await VehiclePreference.updateOne(
        { _id: vehicle._id },
        { $set: { image: vehicleImages[vehicleName] } }
      );
      console.log(`  ✓ Updated: ${vehicleName} -> ${vehicleImages[vehicleName]}`);
      updated++;
    } else if (needsFix) {
      console.log(`  ⚠️  No image mapping for: ${vehicleName}`);
    } else {
      console.log(`  ✓ OK: ${vehicleName} (already has external URL)`);
    }
  }

  console.log(`\n✅ Fixed ${updated} vehicle images!`);
}

main()
  .then(async () => {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await mongoose.disconnect();
    process.exit(1);
  });
