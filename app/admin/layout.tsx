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
    { href: "/admin/airports",     label: "✈️ Airports",      icon: "✈️" },
    { href: "/admin/rates",        label: "💰 Rates",        icon: "💰" },
    { href: "/admin/reservations", label: "📋 Reservations", icon: "📋" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", color: "#1e293b", display: "flex" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
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
          <p style={{ fontSize: 12, color: "#64748b" }}>Admin Panel</p>
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
                  color: active ? "#D4AF37" : "#1e293b",
                  textDecoration: "none",
                  fontSize: 14,
                  transition: "all 0.2s",
                  background: active ? "rgba(212, 175, 55, 0.1)" : "transparent",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#f1f5f9";
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
        <div style={{ padding: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
            Authenticated
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <header
          style={{
            borderBottom: "1px solid #e2e8f0",
            padding: "1rem 2rem",
            background: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>Admin Dashboard</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <AdminNotifications />
              <div style={{ fontSize: 13, color: "#475569" }}>
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
