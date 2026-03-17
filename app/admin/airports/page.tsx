"use client";

import { useEffect, useState } from "react";

interface AirportEntry {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export default function AdminAirportsPage() {
  const [airports, setAirports] = useState<AirportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/airports");
      if (!res.ok) throw new Error("Failed to load airports");
      setAirports(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/airports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), code: newCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setSuccess(`"${data.name} (${data.code})" created — ${data.ratesSeeded} rates seeded for ${data.vehicleCount} vehicles!`);
      setNewName("");
      setNewCode("");
      setShowAdd(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim() || !editCode.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/airports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), code: editCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setSuccess(`Updated to "${data.name} (${data.code})" — all rates updated.`);
      setEditingId(null);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (a: AirportEntry) => {
    if (!confirm(`Delete "${a.name} (${a.code})"? This will also delete ALL rates for this airport.`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/airports/${a.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSuccess(`"${a.name} (${a.code})" and all its rates deleted.`);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.75rem",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    color: "#1e293b",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>Airports</h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Create an airport and all vehicle rates are auto-populated
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setNewName(""); setNewCode(""); }}
          style={{ padding: "0.7rem 1.4rem", background: "#D4AF37", color: "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
        >
          + Add Airport
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: 6, marginBottom: "1rem", fontSize: 14 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem 1rem", borderRadius: 6, marginBottom: "1rem", fontSize: 14 }}>
          {success}
        </div>
      )}

      {showAdd && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: "1rem", color: "#1e293b" }}>Add New Airport</h2>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Airport Name *
              </label>
              <input type="text" required placeholder="e.g. Toronto Pearson International"
                value={newName} onChange={(e) => setNewName(e.target.value)}
                style={{ ...inputStyle, width: "100%" }} />
            </div>
            <div style={{ width: 120 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Code *
              </label>
              <input type="text" required placeholder="e.g. YYZ" maxLength={5}
                value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                style={{ ...inputStyle, width: "100%", textTransform: "uppercase" }} />
            </div>
            <button type="submit" disabled={saving}
              style={{ padding: "0.6rem 1.4rem", background: saving ? "#e2e8f0" : "#D4AF37", color: saving ? "#94a3b8" : "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, whiteSpace: "nowrap" }}>
              {saving ? "Creating…" : "Create"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              style={{ padding: "0.6rem 1.2rem", background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
              Cancel
            </button>
          </form>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: "0.75rem" }}>
            All destinations × all vehicles will be auto-seeded with rates from the master rate sheet.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading…</div>
      ) : airports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          No airports yet. Click "+ Add Airport" to get started.
        </div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1.25rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>{airports.length} airport{airports.length !== 1 ? "s" : ""}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ textAlign: "left", padding: "0.75rem 1.25rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Code</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Name</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Created</th>
                <th style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #e2e8f0", background: i % 2 === 0 ? "transparent" : "#f8fafc" }}>
                  <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>
                    {editingId === a.id ? (
                      <input type="text" value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                        style={{ ...inputStyle, width: 80, textTransform: "uppercase" }} autoFocus />
                    ) : (
                      <span style={{ background: "#f1f5f9", padding: "0.25rem 0.75rem", borderRadius: 4, fontSize: 13, color: "#D4AF37" }}>{a.code}</span>
                    )}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#1e293b" }}>
                    {editingId === a.id ? (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleEdit(a.id); if (e.key === "Escape") setEditingId(null); }}
                          style={{ ...inputStyle, width: 250 }} />
                        <button onClick={() => handleEdit(a.id)} style={{ padding: "0.35rem 0.7rem", background: "#D4AF37", color: "#000", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: "0.35rem 0.7rem", background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                      </div>
                    ) : (
                      a.name
                    )}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#64748b", fontSize: 13 }}>
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "0.85rem 1.25rem", textAlign: "center" }}>
                    {editingId !== a.id && (
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <a href={`/admin/rates?airport=${encodeURIComponent(a.code)}`}
                          style={{ padding: "0.35rem 0.85rem", background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 4, cursor: "pointer", fontSize: 12, textDecoration: "none" }}>
                          View Rates
                        </a>
                        <button onClick={() => { setEditingId(a.id); setEditName(a.name); setEditCode(a.code); }}
                          style={{ padding: "0.35rem 0.85rem", background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(a)}
                          style={{ padding: "0.35rem 0.85rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
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
