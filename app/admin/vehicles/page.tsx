"use client";

import { useEffect, useState } from "react";

interface Vehicle {
  id: string;
  name: string;
  category: string;
  image: string;
  passengers: number;
  luggage: number;
  description: string;
  rate: number;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<Vehicle>({
    id: "",
    name: "",
    category: "",
    image: "",
    passengers: 0,
    luggage: 0,
    description: "",
    rate: 0,
  });

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vehicles");
      if (!res.ok) throw new Error("Failed to load vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/admin/vehicles/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/admin/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setEditingId(null);
      setShowForm(false);
      setFormData({ id: "", name: "", category: "", image: "", passengers: 0, luggage: 0, description: "", rate: 0 });
      loadVehicles();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setShowForm(true);
    setFormData(v);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
      loadVehicles();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    color: "#1e293b",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>Vehicle Management</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
            setFormData({ id: "", name: "", category: "", image: "", passengers: 0, luggage: 0, description: "", rate: 0 });
          }}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: loading ? "#e2e8f0" : "#D4AF37",
            color: loading ? "#94a3b8" : "#000",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.2s",
          }}
        >
          + Add Vehicle
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: 6, marginBottom: "1rem", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 18, marginBottom: "1rem", color: "#1e293b" }}>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Vehicle Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Business Class"
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Vehicle Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 5 * 1024 * 1024) {
                      setError("Image size must be less than 5MB");
                      return;
                    }

                    setUploadingImage(true);
                    setError(null);

                    try {
                      const uploadFormData = new FormData();
                      uploadFormData.append("file", file);

                      console.log("[Upload] Uploading file:", file.name, "Size:", file.size);

                      const res = await fetch("/api/admin/upload", {
                        method: "POST",
                        body: uploadFormData,
                      });

                      console.log("[Upload] Response status:", res.status);

                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        console.error("[Upload] Error response:", errorData);
                        throw new Error(errorData.error || "Failed to upload image");
                      }

                      const data = await res.json();
                      console.log("[Upload] Success! URL:", data.url);

                      if (data.url) {
                        setFormData((prev) => ({ ...prev, image: data.url }));
                        console.log("[Upload] Form data updated with URL:", data.url);
                      } else {
                        throw new Error("No URL returned from server");
                      }
                    } catch (err: any) {
                      console.error("[Upload] Error:", err);
                      setError(err.message || "Failed to upload image");
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  disabled={uploadingImage}
                  style={{
                    ...inputStyle,
                    fontSize: 13,
                    cursor: uploadingImage ? "not-allowed" : "pointer",
                    opacity: uploadingImage ? 0.6 : 1,
                  }}
                />
                {uploadingImage && (
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    ⏳ Uploading image...
                  </div>
                )}
                {formData.image && !uploadingImage && (
                  <div style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}>
                    ✅ Image uploaded successfully
                  </div>
                )}
                {formData.image && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        borderRadius: 4,
                        border: "1px solid #e2e8f0",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <small style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                  Upload an image from your device. Max size: 5MB (JPG, PNG, GIF, WebP)
                </small>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Passengers</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Luggage</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.luggage}
                    onChange={(e) => setFormData({ ...formData, luggage: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Rate (CAD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#475569" }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical" as const,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1rem",
                  background: "#D4AF37",
                  color: "#000",
                  border: "none",
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setShowForm(false);
                  setFormData({ id: "", name: "", category: "", image: "", passengers: 0, luggage: 0, description: "", rate: 0 });
                }}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No vehicles yet. Add one to get started.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {vehicles.map((v) => (
            <div
              key={v.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              {v.image && (
                <div style={{ width: "100%", height: 200, overflow: "hidden", background: "#f1f5f9" }}>
                  <img src={v.image} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ padding: "1rem" }}>
                {v.category && (
                  <div style={{ fontSize: 12, color: "#D4AF37", marginBottom: 4, fontWeight: 600 }}>{v.category}</div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#1e293b" }}>{v.name}</h3>
                <div style={{ display: "flex", gap: "1rem", marginBottom: 8, fontSize: 13, color: "#64748b" }}>
                  <span>👥 {v.passengers}</span>
                  <span>🧳 {v.luggage}</span>
                </div>
                {v.rate > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#D4AF37" }}>
                      ${v.rate.toFixed(2)}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4 }}>CAD</span>
                  </div>
                )}
                {v.description && (
                  <p style={{ fontSize: 13, color: "#475569", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {v.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => handleEdit(v)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
