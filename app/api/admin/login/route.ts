import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import bcrypt from "bcryptjs";
import { generateAdminToken, addValidToken, adminCookieName } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json().catch(() => ({}));

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    let dbConnected = false;
    try {
      await dbConnect();
      dbConnected = true;
    } catch (dbError: any) {
      console.error("[Login] Database connection error:", dbError?.message || dbError);
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: process.env.NODE_ENV === "development" ? dbError?.message : undefined
        },
        { status: 500 }
      );
    }

    if (!dbConnected) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 500 }
      );
    }

    // Find admin by username
    let admin = null;
    try {
      admin = await Admin.findOne({ username: username.trim() }).lean();
      console.log("[Login] Admin lookup:", admin ? "Found" : "Not found", "for username:", username.trim());
    } catch (findError: any) {
      console.error("[Login] Admin find error:", findError?.message || findError);
      return NextResponse.json(
        { 
          error: "Failed to query database",
          details: process.env.NODE_ENV === "development" ? findError?.message : undefined
        },
        { status: 500 }
      );
    }

    if (!admin) {
      console.log("[Login] Admin not found for username:", username.trim());
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if passwordHash exists
    if (!admin.passwordHash) {
      console.error("[Login] Admin found but no passwordHash");
      return NextResponse.json(
        { error: "Admin account is not properly configured" },
        { status: 500 }
      );
    }

    // Verify password
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, admin.passwordHash);
      console.log("[Login] Password verification:", isValid ? "Valid" : "Invalid");
    } catch (bcryptError: any) {
      console.error("[Login] Bcrypt error:", bcryptError?.message || bcryptError);
      return NextResponse.json(
        { 
          error: "Password verification failed",
          details: process.env.NODE_ENV === "development" ? bcryptError?.message : undefined
        },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate secure token
    let token: string;
    try {
      token = generateAdminToken();
      addValidToken(token);
      console.log("[Login] Token generated and added");
    } catch (tokenError: any) {
      console.error("[Login] Token generation error:", tokenError?.message || tokenError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Set cookie and send token in response
    try {
      const res = NextResponse.json({ 
        ok: true, 
        username: admin.username,
        token: token 
      });
      res.cookies.set(adminCookieName(), token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      console.log("[Login] Login successful for:", admin.username);
      return res;
    } catch (cookieError: any) {
      console.error("[Login] Cookie set error:", cookieError?.message || cookieError);
      return NextResponse.json(
        { error: "Failed to set session cookie" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Login] Unexpected error:", error);
    console.error("[Login] Error stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
