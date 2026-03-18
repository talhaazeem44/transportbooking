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
            background: "rgba(239, 68, 68, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: 36,
            color: "#dc2626",
          }}
        >
          ✕
        </div>
        <h1
          style={{
            color: "#12172B",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Payment Cancelled
        </h1>
        <p
          style={{
            color: "#6C6C82",
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
            background: "#C9952A",
            color: "#fff",
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
