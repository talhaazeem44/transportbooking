"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { servicesData } from "@/lib/servicesData";
import { ratesData } from "@/lib/ratesData";

const PREMIUM_KEYWORDS = [
  "suv","limo","limousine","sprinter","stretch","van",
  "executive","luxury","premium","business","elite",
  "escalade","navigator","suburban","mercedes","bmw","cadillac","lincoln",
];

const AIRPORTS = [
  "YYZ – Toronto Pearson International",
  "YTZ – Billy Bishop Toronto City",
  "YZD – Downsview Airport",
  "YHM – John C. Munro Hamilton",
  "BUF – Buffalo Niagara International",
  "IAG – Niagara Falls International",
];

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const service = servicesData.find(s => s.slug === slug);

  const [city, setCity] = useState("");
  const [airport, setAirport] = useState(AIRPORTS[0]);
  const [vehicle, setVehicle] = useState("");
  const [direction, setDirection] = useState<"to"|"from">("to");
  const [rateResult, setRateResult] = useState<{ base: number; fuel: number; hst: number; gratuity: number; total: number } | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  if (!service) {
    router.replace("/");
    return null;
  }

  const handleGetRates = () => {
    setRateError(null);
    setRateResult(null);
    if (!city || !vehicle) { setRateError("Please select a city and vehicle."); return; }
    const cityData = ratesData.find(c => c.city === city);
    if (!cityData) { setRateError("Rate not found for this city. Please call us."); return; }
    const vLower = vehicle.toLowerCase();
    const isLimo = PREMIUM_KEYWORDS.some(k => vLower.includes(k));
    const base = isLimo ? cityData.limo : cityData.taxi;
    if (!base) { setRateError("Rate not available for this combination."); return; }
    const fuel = +(base * 0.05).toFixed(2);
    const hst  = +(base * 0.13).toFixed(2);
    const gratuity = +(base * 0.15).toFixed(2);
    const total = +(base + fuel + hst + gratuity).toFixed(2);
    setRateResult({ base, fuel, hst, gratuity, total });
  };

  const otherServices = servicesData.filter(s => s.slug !== slug);

  return (
    <main style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 90 }}>

        {/* Hero banner */}
        <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
          <img src={service.image} alt={service.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: "0.5rem" }}>{service.icon}</div>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 300, color: "#fff", marginBottom: "0.5rem", letterSpacing: 1 }}>{service.title}</h1>
            <p style={{ color: "#D4AF37", fontSize: 14, textTransform: "uppercase", letterSpacing: 3 }}>{service.subtitle}</p>
          </div>
          {/* Breadcrumb */}
          <div style={{ position: "absolute", bottom: 14, left: "1.5rem", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 0.4rem" }}>›</span>
            <Link href="/#services" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Services</Link>
            <span style={{ margin: "0 0.4rem" }}>›</span>
            <span style={{ color: "#D4AF37" }}>{service.title}</span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2.5rem", alignItems: "start" }}>

          {/* MAIN */}
          <div>
            {/* Description */}
            <p style={{ color: "#d1d5db", lineHeight: 1.8, fontSize: 15, marginBottom: "2rem" }}>{service.description}</p>

            {/* Features */}
            <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "1.5rem", marginBottom: "2rem" }}>
              <h2 style={{ color: "#f3f4f6", fontSize: 17, fontWeight: 600, marginBottom: "1rem" }}>What's Included</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {service.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "#d1d5db", fontSize: 13, lineHeight: 1.4 }}>
                    <span style={{ color: "#4caf50", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Tables */}
            {service.rateTables.map((table, ti) => (
              <div key={ti} style={{ background: "#111827", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h2 style={{ color: "#f3f4f6", fontSize: 17, fontWeight: 600, marginBottom: "1.25rem" }}>{table.label}</h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Vehicle</th>
                        <th style={{ textAlign: "center", padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Passengers</th>
                        <th style={{ textAlign: "right", padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Rate (CAD)</th>
                        <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#f3f4f6" }}>{row.vehicle}</td>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#9ca3af", textAlign: "center" }}>Up to {row.passengers}</td>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#D4AF37", fontWeight: 700, textAlign: "right", fontSize: 15 }}>{row.rate}</td>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#6b7280", fontSize: 12 }}>{row.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {table.note && <p style={{ color: "#6b7280", fontSize: 12, marginTop: "0.75rem", fontStyle: "italic" }}>{table.note}</p>}
              </div>
            ))}

            {/* Rate Calculator (airport / corporate) */}
            {service.usesRateCalculator && (
              <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h2 style={{ color: "#f3f4f6", fontSize: 17, fontWeight: 600, marginBottom: "0.4rem" }}>Rate Calculator</h2>
                <p style={{ color: "#6b7280", fontSize: 12, marginBottom: "1.25rem" }}>
                  One-way per vehicle · 5% Fuel Surcharge · 13% HST · 15% Driver Gratuity
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>City</label>
                    <select value={city} onChange={e => { setCity(e.target.value); setRateResult(null); }}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#f9fafb", fontSize: 13, outline: "none" }}>
                      <option value="">Select city</option>
                      {ratesData.map(r => <option key={r.city} value={r.city}>{r.city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Airport</label>
                    <select value={airport} onChange={e => setAirport(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#f9fafb", fontSize: 13, outline: "none" }}>
                      {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Vehicle Type</label>
                    <select value={vehicle} onChange={e => { setVehicle(e.target.value); setRateResult(null); }}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#f9fafb", fontSize: 13, outline: "none" }}>
                      <option value="">Select vehicle</option>
                      <option value="Lincoln Town Car">Lincoln Town Car (4 pax)</option>
                      <option value="Mercedes C300">Mercedes C300 (4 pax)</option>
                      <option value="BMW 750Li">BMW 750Li (4 pax)</option>
                      <option value="Tesla Model S">Tesla Model S (3 pax)</option>
                      <option value="Mercedes Sprinter Van">Mercedes Sprinter Van (11 pax)</option>
                      <option value="Cadillac Escalade SUV">Cadillac Escalade SUV (6 pax)</option>
                      <option value="Stretch Limo">Stretch Limo (6–8 pax)</option>
                      <option value="SUV Stretch Limo">SUV Stretch Limo (10 pax)</option>
                      <option value="SUV Stretch Limo XL">SUV Stretch Limo XL (14 pax)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#d1d5db", fontSize: 13 }}>
                    <input type="radio" name="svcdir" checked={direction === "to"} onChange={() => setDirection("to")} style={{ accentColor: "#4caf50" }} />
                    Going TO airport
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#d1d5db", fontSize: 13 }}>
                    <input type="radio" name="svcdir" checked={direction === "from"} onChange={() => setDirection("from")} style={{ accentColor: "#4caf50" }} />
                    Coming FROM airport
                  </label>
                </div>

                {rateError && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "0.6rem 0.9rem", color: "#fca5a5", fontSize: 12, marginBottom: "0.75rem" }}>
                    {rateError}
                  </div>
                )}

                {rateResult && (
                  <div style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, padding: "1.25rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#4caf50", marginBottom: "0.4rem" }}>CA${rateResult.total.toFixed(2)}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 1rem", fontSize: 12, color: "#9ca3af" }}>
                      <span>Base Rate:</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.base.toFixed(2)}</span>
                      <span>Fuel Surcharge (5%):</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.fuel.toFixed(2)}</span>
                      <span>HST (13%):</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.hst.toFixed(2)}</span>
                      <span>Driver Gratuity (15%):</span><span style={{ textAlign: "right", color: "#d1d5db" }}>CA${rateResult.gratuity.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button onClick={handleGetRates}
                  style={{ background: "#4caf50", color: "#fff", border: "none", padding: "0.7rem 1.75rem", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5 }}>
                  GET RATES
                </button>
              </div>
            )}

            {/* Disclaimer */}
            {service.disclaimer && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "2rem" }}>
                <ul style={{ margin: 0, padding: "0 0 0 1.1rem", color: "#6b7280", fontSize: 12, lineHeight: 2 }}>
                  <li>Rates shown are estimates. Final fare confirmed at booking.</li>
                  <li>{service.disclaimer}</li>
                  <li>Additional fee charged for use of toll highway 407.</li>
                  <li>Please call us if you don't see your city/town: <strong style={{ color: "#d1d5db" }}>(416) 619-0050</strong></li>
                </ul>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/#reservation-section"
                style={{ background: "#D4AF37", color: "#000", padding: "0.85rem 2rem", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                BOOK NOW
              </Link>
              <a href="tel:4166190050"
                style={{ background: "transparent", color: "#d1d5db", padding: "0.85rem 2rem", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                📞 (416) 619-0050
              </a>
            </div>
          </div>

          {/* SIDEBAR — other services */}
          <aside>
            <div style={{ position: "sticky", top: 100 }}>
              <h3 style={{ color: "#f3f4f6", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                Other Services
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {otherServices.map(s => (
                  <Link key={s.slug} href={`/services/${s.slug}`}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "0.75rem 1rem", textDecoration: "none" }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <div style={{ color: "#f3f4f6", fontSize: 13, fontWeight: 500 }}>{s.title}</div>
                      <div style={{ color: "#D4AF37", fontSize: 11, marginTop: 1 }}>{s.startingFrom}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Contact box */}
              <div style={{ background: "#111827", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "1.25rem", marginTop: "1.5rem" }}>
                <div style={{ color: "#D4AF37", fontWeight: 600, fontSize: 13, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 1 }}>Need Help?</div>
                <p style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6, marginBottom: "0.75rem" }}>
                  Call us 24/7 or email for same-day bookings and custom quotes.
                </p>
                <a href="tel:4166190050" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: "0.3rem" }}>📞 (416) 619-0050</a>
                <a href="mailto:reservations@torontoairportlimo.com" style={{ display: "block", color: "#9ca3af", fontSize: 11, textDecoration: "none" }}>reservations@torontoairportlimo.com</a>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <Footer />
    </main>
  );
}
