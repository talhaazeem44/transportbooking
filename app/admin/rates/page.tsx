"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface RateEntry {
  id: string;
  destination: string;
  tariff: number;
  carType: string;
  airport: string;
}

interface AirportOption {
  id: string;
  name: string;
  code: string;
}

const emptyForm = { id: "", destination: "", tariff: 0, carType: "", airport: "" };

export default function AdminRatesPage() {
  const searchParams = useSearchParams();
  const [rates, setRates]           = useState<RateEntry[]>([]);
  const [airports, setAirports]     = useState<AirportOption[]>([]);
  const [vehicles, setVehicles]     = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [formData, setFormData]     = useState<typeof emptyForm>({ ...emptyForm });
  const [search, setSearch]         = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("");
  const [airportFilter, setAirportFilter] = useState(searchParams.get("airport") || "");
  const [saving, setSaving]         = useState(false);
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(25);
  const [bulkAdjust, setBulkAdjust] = useState<number>(0);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [success, setSuccess]       = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rRes, aRes, vRes] = await Promise.all([
        fetch("/api/admin/rates"),
        fetch("/api/admin/airports"),
        fetch("/api/vehicles"),
      ]);
      if (!rRes.ok) throw new Error("Failed to load rates");
      setRates(await rRes.json());
      if (aRes.ok) setAirports(await aRes.json());
      if (vRes.ok) {
        const vData = await vRes.json();
        setVehicles((vData.items || []).map((v: any) => ({ id: v.id, name: v.name })));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, carType: carTypeFilter, airport: airportFilter });
    setShowForm(true);
  };

  const openEdit = (r: RateEntry) => {
    setEditingId(r.id);
    setFormData({ id: r.id, destination: r.destination, tariff: r.tariff, carType: r.carType, airport: r.airport });
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
          body: JSON.stringify({ destination: formData.destination, tariff: formData.tariff, carType: formData.carType, airport: formData.airport }),
        });
        if (!res.ok) throw new Error("Failed to update rate");
      } else {
        const res = await fetch("/api/admin/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination: formData.destination, tariff: formData.tariff, carType: formData.carType, airport: formData.airport }),
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

  const handleBulkAdjust = async () => {
    if (!bulkAdjust || !carTypeFilter) return;
    const action = bulkAdjust > 0 ? `+$${bulkAdjust}` : `-$${Math.abs(bulkAdjust)}`;
    if (!confirm(`Apply ${action} to ALL destinations for "${carTypeFilter}"?`)) return;
    setBulkSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/rates/bulk-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carType: carTypeFilter, adjustment: bulkAdjust, airport: airportFilter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(`${action} applied to ${data.modifiedCount} rates for "${carTypeFilter}"`);
      setBulkAdjust(0);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBulkSaving(false);
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

  const airportRates = airportFilter ? rates.filter(r => r.airport === airportFilter) : rates;
  const uniqueCarTypes = Array.from(new Set(airportRates.map(r => r.carType))).sort();

  const uniqueAirports = Array.from(new Set(rates.map(r => r.airport))).sort();

  // Auto-select first airport if none selected
  if (!airportFilter && uniqueAirports.length > 0 && !loading) {
    setAirportFilter(uniqueAirports[0]);
  }

  // Auto-select first car type if none selected
  if (!carTypeFilter && uniqueCarTypes.length > 0 && !loading) {
    setCarTypeFilter(uniqueCarTypes[0]);
  }

  const filtered = rates.filter(r => {
    const matchesSearch = r.destination.toLowerCase().includes(search.toLowerCase()) ||
      r.carType.toLowerCase().includes(search.toLowerCase());
    const matchesType = r.carType === carTypeFilter;
    const matchesAirport = !airportFilter || r.airport === airportFilter;
    return matchesSearch && matchesType && matchesAirport;
  }).sort((a, b) => a.destination.localeCompare(b.destination));

  const totalPages = Math.ceil(filtered.length / perPage);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.75rem",
    background: "#ffffff", border: "1px solid #d1d5db",
    borderRadius: 6, color: "#1e293b", fontSize: 14, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>Rates Management</h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Manage destination rates by car type</p>
        </div>
        <button onClick={openAdd}
          style={{ padding: "0.7rem 1.4rem", background: "#D4AF37", color: "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          + Add Rate
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: 6, marginBottom: "1rem", fontSize: 14, border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "0.75rem 1rem", borderRadius: 6, marginBottom: "1rem", fontSize: 14, border: "1px solid #bbf7d0" }}>
          {success}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: "1.25rem", color: "#1e293b" }}>
            {editingId ? "Edit Rate" : "Add New Rate"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Airport *
                </label>
                <select
                  required
                  value={formData.airport}
                  onChange={e => setFormData({ ...formData, airport: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select Airport</option>
                  {airports.map(a => (
                    <option key={a.id} value={a.code}>{a.code} – {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Vehicle *
                </label>
                <select
                  required
                  value={formData.carType}
                  onChange={e => setFormData({ ...formData, carType: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
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
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
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
            </div>

            {/* Live preview */}
            {formData.destination && formData.tariff > 0 && formData.carType && (
              <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: 13, color: "#64748b" }}>
                <strong style={{ color: "#D4AF37" }}>Preview:</strong> {formData.destination} · {formData.carType} ·{" "}
                <strong style={{ color: "#16a34a" }}>CA${Number(formData.tariff).toFixed(2)}</strong>{" "}
                <span style={{ color: "#64748b" }}>
                  → Fuel 5%: CA${(formData.tariff * 0.05).toFixed(2)} · HST 13%: CA${(formData.tariff * 0.13).toFixed(2)} · Gratuity 15%: CA${(formData.tariff * 0.15).toFixed(2)} · <strong style={{ color: "#16a34a" }}>Total: CA${(formData.tariff * 1.33).toFixed(2)}</strong>
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" disabled={saving}
                style={{ padding: "0.6rem 1.4rem", background: saving ? "#e2e8f0" : "#D4AF37", color: saving ? "#94a3b8" : "#000", border: "none", borderRadius: 6, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontSize: 14 }}>
                {saving ? "Saving…" : editingId ? "Update Rate" : "Create Rate"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ ...emptyForm }); }}
                style={{ padding: "0.6rem 1.2rem", background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Airport + Car Type Filter + Search */}
      <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* Airport Filter */}
        {uniqueAirports.length > 0 && (
          <div>
            <span style={{ fontSize: 12, color: "#64748b", marginRight: 8 }}>Airport:</span>
            <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {uniqueAirports.map(ap => {
                const active = airportFilter === ap;
                const apInfo = airports.find(a => a.code === ap);
                const label = apInfo ? `${ap} – ${apInfo.name}` : ap;
                return (
                  <button key={ap} onClick={() => { setAirportFilter(ap); setCarTypeFilter(""); setPage(1); }}
                    style={{
                      padding: "0.3rem 0.85rem", borderRadius: 20, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                      border: active ? "1px solid #60a5fa" : "1px solid #e2e8f0",
                      background: active ? "#eff6ff" : "#ffffff",
                      color: active ? "#2563eb" : "#64748b",
                      fontWeight: active ? 600 : 400,
                    }}>
                    {label}
                  </button>
                );
              })}
            </span>
          </div>
        )}

        <input
          type="text"
          placeholder="Search by destination or car type…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputStyle, maxWidth: 360 }}
        />
        {uniqueCarTypes.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {uniqueCarTypes.map(ct => {
              const active = carTypeFilter === ct;
              const count  = rates.filter(r => r.carType === ct).length;
              return (
                <button
                  key={ct}
                  onClick={() => { setCarTypeFilter(ct); setPage(1); }}
                  style={{
                    padding: "0.3rem 0.85rem",
                    borderRadius: 20,
                    border: active ? "1px solid #D4AF37" : "1px solid #e2e8f0",
                    background: active ? "rgba(212,175,55,0.1)" : "#ffffff",
                    color: active ? "#D4AF37" : "#64748b",
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

        {/* Bulk Adjust */}
        {carTypeFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Bulk adjust all tariffs for <strong style={{ color: "#1e293b" }}>{carTypeFilter}</strong>:</span>
            <input
              type="number"
              value={bulkAdjust || ""}
              onChange={(e) => setBulkAdjust(Number(e.target.value))}
              placeholder="+10 or -5"
              style={{ width: 100, padding: "0.4rem 0.6rem", background: "#ffffff", border: "1px solid #d1d5db", borderRadius: 4, color: "#1e293b", fontSize: 13, outline: "none", textAlign: "center" }}
            />
            <button
              onClick={handleBulkAdjust}
              disabled={!bulkAdjust || bulkSaving}
              style={{
                padding: "0.4rem 1rem", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: !bulkAdjust || bulkSaving ? "not-allowed" : "pointer",
                background: !bulkAdjust || bulkSaving ? "#e2e8f0" : bulkAdjust > 0 ? "#16a34a" : "#dc2626",
                color: !bulkAdjust || bulkSaving ? "#94a3b8" : "#fff",
                border: "none",
              }}
            >
              {bulkSaving ? "Applying..." : bulkAdjust > 0 ? `+$${bulkAdjust} All` : bulkAdjust < 0 ? `-$${Math.abs(bulkAdjust)} All` : "Apply"}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading rates…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          {search ? "No rates match your search." : "No rates yet. Click \"+ Add Rate\" to get started."}
        </div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1.25rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Showing {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filtered.length)} of {filtered.length} rate{filtered.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Per page:</span>
              {[25, 50, 100].map(n => (
                <button key={n} onClick={() => { setPerPage(n); setPage(1); }}
                  style={{
                    padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: 12, cursor: "pointer",
                    border: perPage === n ? "1px solid #D4AF37" : "1px solid #e2e8f0",
                    background: perPage === n ? "rgba(212,175,55,0.1)" : "#ffffff",
                    color: perPage === n ? "#D4AF37" : "#64748b",
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ textAlign: "left", padding: "0.75rem 1.25rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Destination</th>
                <th style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Car Type</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Tariff</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Fuel 5%</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>HST 13%</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Gratuity 15%</th>
                <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Total</th>
                <th style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: "#64748b", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #e2e8f0", background: i % 2 === 0 ? "transparent" : "#f8fafc" }}>
                  <td style={{ padding: "0.85rem 1.25rem", color: "#1e293b", fontWeight: 500 }}>{r.destination}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>
                    <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: 12, color: "#1e293b" }}>{r.carType}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#D4AF37", fontWeight: 700, textAlign: "right" }}>
                    CA${r.tariff.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#64748b", textAlign: "right" }}>
                    CA${(r.tariff * 0.05).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#64748b", textAlign: "right" }}>
                    CA${(r.tariff * 0.13).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#64748b", textAlign: "right" }}>
                    CA${(r.tariff * 0.15).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#16a34a", fontWeight: 600, textAlign: "right" }}>
                    CA${(r.tariff * 1.33).toFixed(2)}
                  </td>
                  <td style={{ padding: "0.85rem 1.25rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button onClick={() => openEdit(r)}
                        style={{ padding: "0.35rem 0.85rem", background: "#f1f5f9", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        style={{ padding: "0.35rem 0.85rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "0.75rem 1.25rem", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                style={{
                  padding: "0.4rem 1rem", borderRadius: 4, fontSize: 13, cursor: safePage <= 1 ? "not-allowed" : "pointer",
                  border: "1px solid #e2e8f0", background: "#ffffff",
                  color: safePage <= 1 ? "#94a3b8" : "#1e293b",
                }}
              >
                Previous
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`dots-${idx}`} style={{ color: "#94a3b8", fontSize: 13, padding: "0 0.3rem" }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          padding: "0.3rem 0.65rem", borderRadius: 4, fontSize: 13, cursor: "pointer",
                          border: p === safePage ? "1px solid #D4AF37" : "1px solid #e2e8f0",
                          background: p === safePage ? "rgba(212,175,55,0.1)" : "#ffffff",
                          color: p === safePage ? "#D4AF37" : "#64748b",
                          fontWeight: p === safePage ? 600 : 400,
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={{
                  padding: "0.4rem 1rem", borderRadius: 4, fontSize: 13, cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                  border: "1px solid #e2e8f0", background: "#ffffff",
                  color: safePage >= totalPages ? "#94a3b8" : "#1e293b",
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fee Notes */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
          <strong style={{ color: "#D4AF37" }}>Fee Breakdown:</strong><br />
          • All rates are subject to <strong style={{ color: "#1e293b" }}>5% Fuel Surcharge</strong><br />
          • All rates are subject to <strong style={{ color: "#1e293b" }}>13% HST</strong> (government tax)<br />
          • All reservations are subject to <strong style={{ color: "#1e293b" }}>15% Driver Gratuity</strong>
        </div>
      )}
    </div>
  );
}
