"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalReservations: number;
  newReservations: number;
  totalVehicles: number;
  totalServices: number;
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
  image: string;
  passengers: number;
  luggage: number;
  description: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    newReservations: 0,
    totalVehicles: 0,
    totalServices: 0,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [rRes, vRes, sRes] = await Promise.all([
          fetch("/api/admin/reservations"),
          fetch("/api/admin/vehicles"),
          fetch("/api/admin/service-types"),
        ]);
        if (rRes.ok && vRes.ok && sRes.ok) {
          const [reservations, vehiclesData, services] = await Promise.all([
            rRes.json(),
            vRes.json(),
            sRes.json(),
          ]);
          setStats({
            totalReservations: reservations.length,
            newReservations: reservations.filter((r: any) => r.status === "NEW").length,
            totalVehicles: vehiclesData.length,
            totalServices: services.length,
          });
          setVehicles(vehiclesData.slice(0, 6)); // Show first 6 vehicles
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setVehiclesLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: "2rem", color: "#1e293b" }}>Dashboard Overview</h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <Link
            href="/admin/reservations"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "1.5rem",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#D4AF37";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>Total Reservations</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#D4AF37" }}>{stats.totalReservations}</div>
            {stats.newReservations > 0 && (
              <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 4 }}>
                {stats.newReservations} new
              </div>
            )}
          </Link>

          <Link
            href="/admin/vehicles"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "1.5rem",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#D4AF37";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>Vehicles</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#D4AF37" }}>{stats.totalVehicles}</div>
          </Link>

          <Link
            href="/admin/services"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "1.5rem",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#D4AF37";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>Service Types</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#D4AF37" }}>{stats.totalServices}</div>
          </Link>
        </div>
      )}

      {/* Vehicles List Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b" }}>Recent Vehicles</h2>
          <Link
            href="/admin/vehicles"
            style={{
              padding: "0.5rem 1rem",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            View All →
          </Link>
        </div>

        {vehiclesLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            No vehicles yet. <Link href="/admin/vehicles" style={{ color: "#D4AF37", textDecoration: "underline" }}>Add one</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {vehicles.map((v) => (
              <div
                key={v.id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  overflow: "hidden",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {v.image && (
                  <div style={{ width: "100%", height: 160, overflow: "hidden", background: "#e2e8f0" }}>
                    <img
                      src={v.image}
                      alt={v.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div style={{ padding: "1rem" }}>
                  {v.category && (
                    <div style={{ fontSize: 11, color: "#D4AF37", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      {v.category}
                    </div>
                  )}
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#1e293b" }}>{v.name}</h3>
                  <div style={{ display: "flex", gap: "1rem", marginBottom: 8, fontSize: 12, color: "#64748b" }}>
                    <span>👥 {v.passengers}</span>
                    <span>🧳 {v.luggage}</span>
                  </div>
                  {v.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#475569",
                        marginBottom: 0,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {v.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 18, marginBottom: "1rem", color: "#1e293b" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/admin/vehicles"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#D4AF37",
              color: "#000",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Manage Vehicles
          </Link>
          <Link
            href="/admin/services"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Manage Services
          </Link>
          <Link
            href="/admin/reservations"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            View Reservations
          </Link>
        </div>
      </div>
    </div>
  );
}
