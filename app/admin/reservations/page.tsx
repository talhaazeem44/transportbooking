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
  paymentStatus: string;
  amountPaid: number;
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
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>Reservations</h1>
        <div style={{ fontSize: 14, color: "#64748b" }}>
          Total: {reservations.length}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: 6, marginBottom: "1rem", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No reservations yet.</div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Created</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Customer</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Service</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Vehicle</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Pickup</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Payment</th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: getStatusColor(r.status) + "15",
                          color: getStatusColor(r.status),
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: 13, color: "#475569" }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{r.email}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{r.phone}</div>
                    </td>
                    <td style={{ padding: "1rem", fontSize: 13, color: "#1e293b" }}>{r.serviceType}</td>
                    <td style={{ padding: "1rem", fontSize: 13, color: "#1e293b" }}>{r.vehiclePreference}</td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: 13, color: "#1e293b" }}>{new Date(r.pickupAt).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{r.pickupAddress}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background:
                            r.paymentStatus === "PAID"
                              ? "#10b98115"
                              : r.paymentStatus === "PENDING"
                              ? "#f59e0b15"
                              : r.paymentStatus === "FAILED"
                              ? "#ef444415"
                              : r.paymentStatus === "REFUNDED"
                              ? "#8b5cf615"
                              : "#6b728015",
                          color:
                            r.paymentStatus === "PAID"
                              ? "#10b981"
                              : r.paymentStatus === "PENDING"
                              ? "#f59e0b"
                              : r.paymentStatus === "FAILED"
                              ? "#ef4444"
                              : r.paymentStatus === "REFUNDED"
                              ? "#8b5cf6"
                              : "#6b7280",
                        }}
                      >
                        {r.paymentStatus}
                      </span>
                      {r.amountPaid > 0 && (
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                          CA${(r.amountPaid / 100).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <select
                        value={r.status}
                        onChange={(e) => updateReservationStatus(r.id, e.target.value)}
                        style={{
                          background: "#f8fafc",
                          color: "#1e293b",
                          borderRadius: 4,
                          border: "1px solid #e2e8f0",
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
