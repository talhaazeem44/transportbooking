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
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Service Types</h1>
      </div>

      {error && (
        <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "0.75rem", borderRadius: 6, marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 8, padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 18, marginBottom: "1rem" }}>Add New Service Type</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            placeholder="Service type name"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && createService()}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#0a0a0a",
              border: "1px solid #374151",
              borderRadius: 4,
              color: "#e5e7eb",
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
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Loading services...</div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>No service types yet.</div>
      ) : (
        <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#0a0a0a" }}>
              <tr>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 14, fontWeight: 600 }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "right", fontSize: 14, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #1f2937" }}>
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
                          background: "#0a0a0a",
                          border: "1px solid #374151",
                          borderRadius: 4,
                          color: "#e5e7eb",
                        }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontSize: 14 }}>{s.name}</span>
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
                            background: "#374151",
                            color: "#e5e7eb",
                            border: "none",
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
                            background: "#1f2937",
                            color: "#e5e7eb",
                            border: "1px solid #374151",
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
                            background: "#7f1d1d",
                            color: "#fca5a5",
                            border: "1px solid #991b1b",
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
