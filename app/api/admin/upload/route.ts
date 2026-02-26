import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "vehicles");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);
    console.log("[Upload] File saved to:", filepath);

    // Return public URL
    // In production, use absolute URL if available
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.RAILWAY_PUBLIC_DOMAIN ? 
                      `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 
                      '';
    const publicUrl = baseUrl ? `${baseUrl}/uploads/vehicles/${filename}` : `/uploads/vehicles/${filename}`;
    
    console.log("[Upload] Returning URL:", publicUrl);
    const response = NextResponse.json({ url: publicUrl });
    console.log("[Upload] Response:", JSON.stringify({ url: publicUrl }));
    return response;
  } catch (error: any) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error?.message },
      { status: 500 }
    );
  }
}
