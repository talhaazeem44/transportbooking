"use client";

import Link from "next/link";

export default function BookingCancelPage() {
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
            background: "rgba(239, 68, 68, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: 36,
          }}
        >
          ✕
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Payment Cancelled
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Your payment was cancelled. No charges have been made. You can try
          booking again whenever you are ready.
        </p>
        <Link
          href="/#book"
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
          Try Again
        </Link>
      </div>
    </div>
  );
}
