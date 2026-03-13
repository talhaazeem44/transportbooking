"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#111",
          border: "1px solid #222",
          borderRadius: 16,
          padding: "3rem 2.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: 36,
          }}
        >
          ✓
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Payment Successful!
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 16, lineHeight: 1.6, marginBottom: "2rem" }}>
          Thank you for your reservation. Your payment has been processed
          successfully. Our team will contact you shortly to confirm your
          booking details.
        </p>
        {sessionId && (
          <p
            style={{
              color: "#6b7280",
              fontSize: 12,
              marginBottom: "2rem",
              wordBreak: "break-all",
            }}
          >
            Reference: {sessionId}
          </p>
        )}
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#D4AF37",
            color: "#000",
            padding: "0.85rem 2.5rem",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
          }}
        >
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
