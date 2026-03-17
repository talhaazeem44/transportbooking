"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ratesData } from "@/lib/ratesData";

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

const PREMIUM_KEYWORDS = [
  "suv","limo","limousine","sprinter","stretch","van",
  "executive","luxury","premium","business","elite",
  "escalade","navigator","suburban","mercedes","bmw",
  "cadillac","lincoln",
];

function isLimoTier(name: string) {
  const n = name.toLowerCase();
  return PREMIUM_KEYWORDS.some(k => n.includes(k));
}

const AIRPORTS = [
  "YYZ – Toronto Pearson International",
  "YTZ – Billy Bishop Toronto City",
  "YZD – Downsview Airport",
  "YHM – John C. Munro Hamilton",
  "BUF – Buffalo Niagara International",
  "IAG – Niagara Falls International",
];

export default function VehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Rate calculator state
  const [city, setCity] = useState("");
  const [airport, setAirport] = useState(AIRPORTS[0]);
  const [direction, setDirection] = useState<"to" | "from">("to");
  const [rateResult, setRateResult] = useState<{
    base: number; fuel: number; hst: number; gratuity: number; total: number;
  } | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicles/${id}`).then(r => r.json()),
      fetch("/api/vehicles").then(r => r.json()),
    ]).then(([veh, all]) => {
      if (veh.error) { router.replace("/"); return; }
      setVehicle(veh);
      setAllVehicles((all.items || []).filter((v: Vehicle) => v.id !== id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleGetRates = () => {
    setRateError(null);
    setRateResult(null);
    if (!city) { setRateError("Please select a city first."); return; }
    const cityData = ratesData.find(c => c.city === city);
    if (!cityData) { setRateError("Rate not found for this city. Please call us."); return; }
    const limo = vehicle ? isLimoTier(vehicle.name) : false;
    const base = limo ? cityData.limo : cityData.taxi;
    if (!base) { setRateError("Rate not available for this combination. Please contact us."); return; }
    const fuel = +(base * 0.05).toFixed(2);
    const hst = +(base * 0.13).toFixed(2);
    const gratuity = +(base * 0.15).toFixed(2);
    const total = +(base + fuel + hst + gratuity).toFixed(2);
    setRateResult({ base, fuel, hst, gratuity, total });
  };

  if (loading) return (
    <main>
      <Navbar />
      <div style={{ paddingTop: 120, textAlign: "center", color: "#9ca3af", fontSize: 18 }}>Loading...</div>
      <Footer />
    </main>
  );

  if (!vehicle) return null;

  return (
    <main style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 90 }}>

        {/* Breadcrumb */}
        <div style={{ background: "#111827", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0.75rem 1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", fontSize: 13, color: "#6b7280" }}>
            <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <Link href="/#fleet" style={{ color: "#9ca3af", textDecoration: "none" }}>Vehicles</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <span style={{ color: "#D4AF37" }}>{vehicle.name}</span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }}>

            {/* LEFT — Vehicle detail */}
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 300, color: "#f9fafb", marginBottom: "0.25rem" }}>
                {vehicle.name}
              </h1>
              <p style={{ color: "#D4AF37", fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: "1.5rem" }}>
                {vehicle.category || "Luxury Vehicle"}
              </p>

              {/* Vehicle image */}
              {vehicle.image && (
                <div style={{ background: "#111827", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", padding: "1.5rem" }}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain", filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))" }}
                  />
                </div>
              )}

              {/* Specs row */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {vehicle.passengers > 0 && (
                  <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db", fontSize: 14 }}>
                    <svg width="18" height="18" fill="none" stroke="#D4AF37" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Up to <strong>{vehicle.passengers}</strong> passengers
                  </div>
                )}
                {vehicle.luggage > 0 && (
                  <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#d1d5db", fontSize: 14 }}>
                    <svg width="18" height="18" fill="none" stroke="#D4AF37" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    Up to <strong>{vehicle.luggage}</strong> luggage pieces
                  </div>
                )}
              </div>

              {/* Description */}
              {vehicle.description && (
                <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "1.5rem", marginBottom: "2rem" }}>
                  <h3 style={{ color: "#f3f4f6", fontWeight: 500, marginBottom: "0.75rem", fontSize: 16 }}>About this Vehicle</h3>
                  <p style={{ color: "#9ca3af", lineHeight: 1.7, fontSize: 14 }}>{vehicle.description}</p>
                </div>
              )}

              {/* Rate Calculator */}
              <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1.75rem", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 300, color: "#f3f4f6", marginBottom: "0.5rem" }}>
                  {vehicle.name} — Rate Calculator
                </h2>
                <p style={{ color: "#6b7280", fontSize: 12, marginBottom: "1.25rem" }}>
                  One-way cost per vehicle · 5% Fuel Surcharge · 13% HST · 15% Driver Gratuity
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>City</label>
                    <select
                      value={city}
                      onChange={e => { setCity(e.target.value); setRateResult(null); }}
                      style={{ width: "100%", padding: "0.65rem 0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#f9fafb", fontSize: 14, outline: "none" }}
                    >
                      <option value="">Select your city</option>
                      {ratesData.map(r => <option key={r.city} value={r.city}>{r.city}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Airport</label>
                    <select
                      value={airport}
                      onChange={e => setAirport(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#f9fafb", fontSize: 14, outline: "none" }}
                    >
                      {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#d1d5db", fontSize: 14 }}>
                    <input type="radio" name="dir" checked={direction === "to"} onChange={() => setDirection("to")} style={{ accentColor: "#4caf50" }} />
                    Going TO airport
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#d1d5db", fontSize: 14 }}>
                    <input type="radio" name="dir" checked={direction === "from"} onChange={() => setDirection("from")} style={{ accentColor: "#4caf50" }} />
                    Coming FROM airport
                  </label>
                </div>

                {rateError && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "0.75rem 1rem", color: "#fca5a5", fontSize: 13, marginBottom: "1rem" }}>
                    {rateError}
                  </div>
                )}

                {rateResult && (
                  <div style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, padding: "1.25rem", marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#4caf50", marginBottom: "0.4rem" }}>
                      CA${rateResult.total.toFixed(2)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 1rem", fontSize: 13, color: "#9ca3af" }}>
                      <span>Base Rate:</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.base.toFixed(2)}</span>
                      <span>Fuel Surcharge (5%):</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.fuel.toFixed(2)}</span>
                      <span>HST (13%):</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.hst.toFixed(2)}</span>
                      <span>Driver Gratuity (15%):</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.gratuity.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    onClick={handleGetRates}
                    style={{ background: "#4caf50", color: "#fff", border: "none", padding: "0.75rem 1.75rem", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5 }}
                  >
                    GET RATES
                  </button>
                  <Link
                    href="/#reservation-section"
                    style={{ background: "#D4AF37", color: "#000", padding: "0.75rem 1.75rem", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    BOOK THIS VEHICLE
                  </Link>
                </div>
              </div>

              {/* Services list */}
              <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "1.5rem" }}>
                <h3 style={{ color: "#f3f4f6", fontWeight: 500, marginBottom: "1rem", fontSize: 16 }}>Services Available</h3>
                <ul style={{ margin: 0, padding: "0 0 0 1.25rem", color: "#9ca3af", fontSize: 14, lineHeight: 2.1 }}>
                  <li>Airport Transfers (YYZ, YTZ, YHM, BUF, IAG)</li>
                  <li>Point-to-Point Service</li>
                  <li>Corporate & Business Travel</li>
                  <li>Weddings & Proms</li>
                  <li>Casino Trips & Wine Tours</li>
                  <li>Birthday & Graduation Parties</li>
                  <li>Hourly / As Directed</li>
                </ul>
              </div>
            </div>

            {/* RIGHT — Other vehicles sidebar */}
            <aside>
              <div style={{ position: "sticky", top: 100 }}>
                <h3 style={{ color: "#f3f4f6", fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  Other Vehicles
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {allVehicles.map(v => (
                    <Link
                      key={v.id}
                      href={`/vehicles/${v.id}`}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "0.75rem", textDecoration: "none", transition: "border-color 0.2s" }}
                    >
                      {v.image ? (
                        <img src={v.image} alt={v.name} style={{ width: 72, height: 48, objectFit: "contain", flexShrink: 0, background: "#0a0a0a", borderRadius: 4, padding: 2 }} />
                      ) : (
                        <div style={{ width: 72, height: 48, background: "#0f172a", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="24" height="24" fill="none" stroke="#374151" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                        </div>
                      )}
                      <div>
                        <div style={{ color: "#f3f4f6", fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{v.name}</div>
                        {v.passengers > 0 && (
                          <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>Up to {v.passengers} pax</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
