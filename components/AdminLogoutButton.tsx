"use client";

import { useState } from "react";

export default function AdminLogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      // Redirect regardless of response
      window.location.href = "/admin/login";
    } catch (e) {
      console.error("Logout error:", e);
      window.location.href = "/admin/login";
    }
  };

  return (
    <form onSubmit={handleLogout} style={{ marginTop: 8 }}>
      <button
        type="submit"
        disabled={loggingOut}
        style={{
          width: "100%",
          padding: "0.5rem",
          background: loggingOut ? "#e2e8f0" : "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          color: "#475569",
          fontSize: 12,
          cursor: loggingOut ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </form>
  );
}
