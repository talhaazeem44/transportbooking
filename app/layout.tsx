import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { dbConnect } from "@/lib/mongodb";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toronto Airport Limo | Premium Chauffeur Service",
  description: "Elite limousine and luxury transportation services in the Greater Toronto Area. Affordable, reliable, and elegant travel for any occasion.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to connect to MongoDB, but don't block the app if it fails
  try {
    await dbConnect();
    console.log("[MongoDB] ✅ Connected successfully");
  } catch (error: any) {
    console.error("[MongoDB] ❌ Connection failed:", error?.message || error);
    console.error("[MongoDB] ⚠️  Please check:");
    console.error("   1. MongoDB Atlas Network Access - Add your IP address");
    console.error("   2. MONGODB_URI in .env file is correct");
    console.error("   3. MongoDB Atlas cluster is running");
    // Don't throw - let the app continue, API routes will handle their own connections
  }

  // Check if we're on admin login page - don't show navbar
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const showNavbar = !pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
