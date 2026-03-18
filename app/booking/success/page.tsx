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
        background: "#F7F4EE",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#ffffff",
          border: "1px solid #E4DFD2",
          borderRadius: 16,
          padding: "3rem 2.5rem",
          textAlign: "center",
          boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: 36,
            color: "#16a34a",
          }}
        >
          ✓
        </div>
        <h1
          style={{
            color: "#12172B",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Payment Successful!
        </h1>
        <p style={{ color: "#6C6C82", fontSize: 16, lineHeight: 1.6, marginBottom: "2rem" }}>
          Thank you for your reservation. Your payment has been processed
          successfully. Our team will contact you shortly to confirm your
          booking details.
        </p>
        {sessionId && (
          <p
            style={{
              color: "#94a3b8",
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
            background: "#C9952A",
            color: "#fff",
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
            background: "#F7F4EE",
            color: "#12172B",
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
