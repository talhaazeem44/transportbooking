"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import AdminNotifications from "@/components/AdminNotifications";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // If on login page, render without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "📊 Dashboard", icon: "📊" },
    { href: "/admin/vehicles", label: "🚗 Vehicles", icon: "🚗" },
    { href: "/admin/services", label: "🎯 Services", icon: "🎯" },
    { href: "/admin/reservations", label: "📋 Reservations", icon: "📋" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f9fafb", display: "flex" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "#020617",
          borderRight: "1px solid #1f2937",
          padding: "1.5rem 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#D4AF37", marginBottom: 4 }}>
            TORONTO LIMO
          </h1>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Admin Panel</p>
        </div>
        <nav style={{ padding: "0 1rem", flex: 1 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  borderRadius: 6,
                  marginBottom: 4,
                  color: active ? "#D4AF37" : "#e5e7eb",
                  textDecoration: "none",
                  fontSize: 14,
                  transition: "all 0.2s",
                  background: active ? "#1f2937" : "transparent",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#0a0a0a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "1.5rem", borderTop: "1px solid #1f2937" }}>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
            ✅ Authenticated
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <header
          style={{
            borderBottom: "1px solid #1f2937",
            padding: "1rem 2rem",
            background: "#020617",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e5e7eb" }}>Admin Dashboard</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <AdminNotifications />
              <div style={{ fontSize: 13, color: "#9ca3af" }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </header>
        <div style={{ padding: "2rem", flex: 1 }}>{children}</div>
      </main>
    </div>
  );
}
