"use client";

import { useEffect, useState } from "react";

interface ServiceType {
  id: string;
  name: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newService, setNewService] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/service-types");
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setServices(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const createService = async () => {
    if (!newService.trim()) return;
    try {
      await fetch("/api/admin/service-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newService }),
      });
      setNewService("");
      loadServices();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const updateService = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await fetch(`/api/admin/service-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      setEditingId(null);
      setEditName("");
      loadServices();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service type?")) return;
    try {
      await fetch(`/api/admin/service-types/${id}`, { method: "DELETE" });
      loadServices();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>Service Types</h1>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: 6, marginBottom: "1rem", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 18, marginBottom: "1rem", color: "#1e293b" }}>Add New Service Type</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            placeholder="Service type name"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && createService()}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              color: "#1e293b",
            }}
          />
          <button
            onClick={createService}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#D4AF37",
              color: "#000",
              border: "none",
              borderRadius: 4,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading services...</div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No service types yet.</div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 14, fontWeight: 600, color: "#475569" }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "right", fontSize: 14, fontWeight: 600, color: "#475569" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem" }}>
                    {editingId === s.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && updateService(s.id)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          color: "#1e293b",
                        }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontSize: 14, color: "#1e293b" }}>{s.name}</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    {editingId === s.id ? (
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => updateService(s.id)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            background: "#D4AF37",
                            color: "#000",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditName("");
                          }}
                          style={{
                            padding: "0.4rem 0.8rem",
                            background: "#f1f5f9",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => {
                            setEditingId(s.id);
                            setEditName(s.name);
                          }}
                          style={{
                            padding: "0.4rem 0.8rem",
                            background: "#f1f5f9",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteService(s.id)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
