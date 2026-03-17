"use client";

import { useEffect, useState } from "react";

interface RateEntry {
  id: string;
  destination: string;
  tariff: number;
  carType: string;
}

const emptyForm = { id: "", destination: "", tariff: 0, carType: "" };

export default function AdminRatesPage() {
  const [rates, setRates]           = useState<RateEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [formData, setFormData]     = useState<typeof emptyForm>({ ...emptyForm });
  const [search, setSearch]         = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("All");
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/rates");
      if (!res.ok) throw new Error("Failed to load rates");
      setRates(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (r: RateEntry) => {
    setEditingId(r.id);
    setFormData({ id: r.id, destination: r.destination, tariff: r.tariff, carType: r.carType });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/rates/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination: formData.destination, tariff: formData.tariff, carType: formData.carType }),
        });
        if (!res.ok) throw new Error("Failed to update rate");
      } else {
        const res = await fetch("/api/admin/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination: formData.destination, tariff: formData.tariff, carType: formData.carType }),
        });
        if (!res.ok) throw new Error("Failed to create rate");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rate?")) return;
    try {
      await fetch(`/api/admin/rates/${id}`, { method: "DELETE" });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const uniqueCarTypes = ["All", ...Array.from(new Set(rates.map(r => r.carType))).sort()];

  const filtered = rates.filter(r => {
    const matchesSearch = r.destination.toLowerCase().includes(search.toLowerCase()) ||
      r.carType.toLowerCase().includes(search.toLowerCase());
    const matchesType = carTypeFilter === "All" || r.carType === carTypeFilter;
    return matchesSearch && matchesType;
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.75rem",
    background: "#0a0a0a", border: "1px solid #374151",
    borderRadius: 6, color: "#e5e7eb", fontSize: 14, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>Rates Management</h1>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Manage destination rates by car type</p>
        </div>
        <button onClick={openAdd}
          style={{ padding: "0.7rem 1.4rem", background: "#D4AF37", color: "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          + Add Rate
        </button>
      </div>

      {error && (
        <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: 6, marginBottom: "1rem", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: "1.25rem", color: "#f3f4f6" }}>
            {editingId ? "Edit Rate" : "Add New Rate"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barrie"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Tariff (CAD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.tariff || ""}
                  onChange={e => setFormData({ ...formData, tariff: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Car Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sedan, SUV, Stretch Limo"
                  value={formData.carType}
                  onChange={e => setFormData({ ...formData, carType: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Live preview */}
            {formData.destination && formData.tariff > 0 && formData.carType && (
              <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: 13, color: "#d1d5db" }}>
                <strong style={{ color: "#D4AF37" }}>Preview:</strong> {formData.destination} · {formData.carType} ·{" "}
                <strong style={{ color: "#4caf50" }}>CA${Number(formData.tariff).toFixed(2)}</strong>{" "}
                <span style={{ color: "#6b7280" }}>
                  → Total with fees: CA${(formData.tariff * 1.33).toFixed(2)}
                  <span style={{ fontSize: 11, marginLeft: 4 }}>(+5% fuel +13% HST +15% gratuity)</span>
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" disabled={saving}
                style={{ padding: "0.6rem 1.4rem", background: saving ? "#374151" : "#D4AF37", color: saving ? "#9ca3af" : "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontSize: 14 }}>
                {saving ? "Saving…" : editingId ? "Update Rate" : "Create Rate"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ ...emptyForm }); }}
                style={{ padding: "0.6rem 1.2rem", background: "#1f2937", color: "#e5e7eb", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Car Type Filter */}
      <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="text"
          placeholder="Search by destination or car type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 360 }}
        />
        {uniqueCarTypes.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {uniqueCarTypes.map(ct => {
              const active = carTypeFilter === ct;
              const count  = ct === "All" ? rates.length : rates.filter(r => r.carType === ct).length;
              return (
                <button
                  key={ct}
                  onClick={() => setCarTypeFilter(ct)}
                  style={{
                    padding: "0.3rem 0.85rem",
                    borderRadius: 20,
                    border: active ? "1px solid #D4AF37" : "1px solid #374151",
                    background: active ? "rgba(212,175,55,0.15)" : "#0a0a0a",
                    color: active ? "#D4AF37" : "#9ca3af",
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {ct} <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Loading rates…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          {search ? "No rates match your search." : "No rates yet. Click \"+ Add Rate\" to get started."}
        </div>
      ) : (
        <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1.25rem", background: "#0a0a0a", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{filtered.length} rate{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#0a0a0a", borderBottom: "1px solid #1f2937" }}>
                <th style={{ textAlign: "left", padding: "0.75rem 1.25rem", color: "#9ca3af", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Destination</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Car Type</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Tariff</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Total (with fees)</th>
                <th style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: "#9ca3af", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #1f2937", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td style={{ padding: "0.85rem 1.25rem", color: "#f3f4f6", fontWeight: 500 }}>{r.destination}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#d1d5db" }}>
                    <span style={{ background: "#1f2937", padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: 12 }}>{r.carType}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#D4AF37", fontWeight: 700, textAlign: "right" }}>
                    CA${r.tariff.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#4caf50", fontWeight: 600, textAlign: "right" }}>
                    CA${(r.tariff * 1.33).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1.25rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button onClick={() => openEdit(r)}
                        style={{ padding: "0.35rem 0.85rem", background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        style={{ padding: "0.35rem 0.85rem", background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Delete
                      </button>
                    </div>
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
