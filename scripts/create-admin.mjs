import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || "admin";
  const password = args[1] || "admin123";

  if (!password || password.length < 6) {
    console.error("❌ Password must be at least 6 characters long");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "transportbooking",
  });

  console.log("🔗 Connected to MongoDB");

  // Check if admin already exists
  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`⚠️  Admin "${username}" already exists. Updating password...`);
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.updateOne({ username }, { passwordHash });
    console.log(`✅ Password updated for admin "${username}"`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ username, passwordHash });
    console.log(`✅ Admin created successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
  }

  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
