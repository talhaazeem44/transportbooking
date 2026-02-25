"use client";

import { useEffect, useState } from "react";

interface ReservationSummary {
  id: string;
  status: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  vehiclePreference: string;
  pickupAt: string;
  pickupAddress: string;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reservations");
      if (!res.ok) throw new Error("Failed to load reservations");
      const data = await res.json();
      setReservations(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadReservations();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "#3b82f6";
      case "CONTACTED":
        return "#f59e0b";
      case "CONFIRMED":
        return "#10b981";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Reservations</h1>
        <div style={{ fontSize: 14, color: "#9ca3af" }}>
          Total: {reservations.length}
        </div>
      </div>

      {error && (
        <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "0.75rem", borderRadius: 6, marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>No reservations yet.</div>
      ) : (
        <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead style={{ background: "#0a0a0a" }}>
                <tr>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Created</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Service</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Vehicle</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Pickup</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #1f2937" }}>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: getStatusColor(r.status) + "20",
                          color: getStatusColor(r.status),
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: 13, color: "#d1d5db" }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.email}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.phone}</div>
                    </td>
                    <td style={{ padding: "1rem", fontSize: 13 }}>{r.serviceType}</td>
                    <td style={{ padding: "1rem", fontSize: 13 }}>{r.vehiclePreference}</td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: 13 }}>{new Date(r.pickupAt).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.pickupAddress}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <select
                        value={r.status}
                        onChange={(e) => updateReservationStatus(r.id, e.target.value)}
                        style={{
                          background: "#0a0a0a",
                          color: "#e5e7eb",
                          borderRadius: 4,
                          border: "1px solid #374151",
                          padding: "0.4rem 0.6rem",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
