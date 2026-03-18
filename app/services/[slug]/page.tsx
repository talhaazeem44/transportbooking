"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { servicesData } from "@/lib/servicesData";

interface AirportOption {
  id: string;
  name: string;
  code: string;
}

interface VehicleOption {
  id: string;
  name: string;
}

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const service = servicesData.find(s => s.slug === slug);

  // Dynamic rate calculator state
  const [airportsList, setAirportsList] = useState<AirportOption[]>([]);
  const [vehiclesList, setVehiclesList] = useState<VehicleOption[]>([]);
  const [selectedAirport, setSelectedAirport] = useState("");
  const [airportSearch, setAirportSearch] = useState("");
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);

  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  const [direction, setDirection] = useState<"to"|"from">("to");
  const [rateResult, setRateResult] = useState<{ base: number; fuel: number; hst: number; gratuity: number; total: number } | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const airportDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (!service) {
    router.replace("/");
    return null;
  }

  // Load airports + vehicles
  useEffect(() => {
    Promise.all([
      fetch("/api/airports").then(r => r.json()),
      fetch("/api/vehicles").then(r => r.json()),
    ]).then(([airports, vData]) => {
      setAirportsList(Array.isArray(airports) ? airports : []);
      setVehiclesList(vData.items || []);
    }).catch(() => {});
  }, []);

  // Load cities when airport changes
  useEffect(() => {
    const airportCode = selectedAirport || "YYZ";
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch(`/api/rates/destinations/all?airport=${encodeURIComponent(airportCode)}`);
        const data = await res.json();
        setAllDestinations(Array.isArray(data) ? data : []);
      } catch {
        setAllDestinations([]);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
    setRateResult(null);
    setSelectedCity("");
    setCitySearch("");
  }, [selectedAirport]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) setShowCityDropdown(false);
      if (airportDropdownRef.current && !airportDropdownRef.current.contains(e.target as Node)) setShowAirportDropdown(false);
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) setShowVehicleDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const airportOptions = useMemo(() =>
    airportsList.map((a) => ({ value: a.code, label: `${a.code} – ${a.name}` })),
    [airportsList]
  );

  const filteredAirports = airportOptions.filter((a) =>
    a.label.toLowerCase().includes(airportSearch.toLowerCase())
  );

  const filteredVehicles = vehiclesList.filter((v) =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const filteredCities = allDestinations.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );
  const visibleCities = filteredCities.slice(0, visibleCount);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setVisibleCount((prev) => Math.min(prev + 50, filteredCities.length));
    }
  };

  useEffect(() => { setVisibleCount(50); }, [citySearch]);

  const handleGetRates = async () => {
    setRateError(null);
    setRateResult(null);
    if (!selectedCity || !selectedVehicle) { setRateError("Please select a city and vehicle."); return; }
    const airportCode = selectedAirport || "YYZ";
    try {
      const res = await fetch(`/api/rates/lookup?carType=${encodeURIComponent(selectedVehicle)}&destination=${encodeURIComponent(selectedCity)}&airport=${encodeURIComponent(airportCode)}`);
      if (!res.ok) { setRateError("Rate not available for this combination. Please contact us."); return; }
      const data = await res.json();
      const base = data.tariff;
      const fuel = +(base * 0.05).toFixed(2);
      const hst  = +(base * 0.13).toFixed(2);
      const gratuity = +(base * 0.15).toFixed(2);
      const total = +(base + fuel + hst + gratuity).toFixed(2);
      setRateResult({ base, fuel, hst, gratuity, total });
    } catch {
      setRateError("Something went wrong. Please try again.");
    }
  };

  const otherServices = servicesData.filter(s => s.slug !== slug);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    background: "#EFEBE0",
    border: "1px solid #E4DFD2",
    borderRadius: 6,
    color: "#12172B",
    fontSize: 13,
    outline: "none",
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: 250,
    overflowY: "auto",
    background: "#ffffff",
    border: "1px solid #E4DFD2",
    borderRadius: "0 0 6px 6px",
    zIndex: 999,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "0.6rem 1rem",
    cursor: "pointer",
    fontSize: 14,
    color: "#12172B",
    borderBottom: "1px solid #F7F4EE",
    transition: "background 0.1s",
  };

  return (
    <main style={{ backgroundColor: "#F7F4EE", minHeight: "100vh" }}>
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
            <p style={{ color: "#12172B", lineHeight: 1.8, fontSize: 15, marginBottom: "2rem" }}>{service.description}</p>

            {/* Features */}
            <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 10, padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ color: "#12172B", fontSize: 17, fontWeight: 600, marginBottom: "1rem" }}>What's Included</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {service.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "#12172B", fontSize: 13, lineHeight: 1.4 }}>
                    <span style={{ color: "#16a34a", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Tables */}
            {service.rateTables.map((table, ti) => (
              <div key={ti} style={{ background: "#ffffff", border: "1px solid rgba(201,149,42,0.25)", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h2 style={{ color: "#12172B", fontSize: 17, fontWeight: 600, marginBottom: "1.25rem" }}>{table.label}</h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E4DFD2" }}>
                        <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#6C6C82", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Vehicle</th>
                        <th style={{ textAlign: "center", padding: "0.6rem 0.75rem", color: "#6C6C82", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Passengers</th>
                        <th style={{ textAlign: "right", padding: "0.6rem 0.75rem", color: "#6C6C82", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Rate (CAD)</th>
                        <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#6C6C82", fontWeight: 500, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: "1px solid #E4DFD2", background: ri % 2 === 0 ? "transparent" : "#EFEBE0" }}>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#12172B" }}>{row.vehicle}</td>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#6C6C82", textAlign: "center" }}>Up to {row.passengers}</td>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#C9952A", fontWeight: 700, textAlign: "right", fontSize: 15 }}>{row.rate}</td>
                          <td style={{ padding: "0.7rem 0.75rem", color: "#6C6C82", fontSize: 12 }}>{row.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {table.note && <p style={{ color: "#6C6C82", fontSize: 12, marginTop: "0.75rem", fontStyle: "italic" }}>{table.note}</p>}
              </div>
            ))}

            {/* Rate Calculator — Dynamic */}
            {service.usesRateCalculator && (
              <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h2 style={{ color: "#12172B", fontSize: 17, fontWeight: 600, marginBottom: "0.4rem" }}>Rate Calculator</h2>
                <p style={{ color: "#6C6C82", fontSize: 12, marginBottom: "1.25rem" }}>
                  One-way per vehicle · 5% Fuel Surcharge · 13% HST · 15% Driver Gratuity
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                  {/* Airport */}
                  <div ref={airportDropdownRef}>
                    <label style={{ display: "block", fontSize: 11, color: "#6C6C82", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Airport</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search airport..."
                        value={showAirportDropdown ? airportSearch : (airportOptions.find(a => a.value === selectedAirport)?.label || airportSearch)}
                        onChange={(e) => { setAirportSearch(e.target.value); setSelectedAirport(""); setShowAirportDropdown(true); }}
                        onFocus={() => { setShowAirportDropdown(true); setAirportSearch(""); }}
                        autoComplete="off"
                        style={inputStyle}
                      />
                      {showAirportDropdown && (
                        <div style={dropdownMenuStyle}>
                          {filteredAirports.length === 0 ? (
                            <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>No airports found</div>
                          ) : (
                            filteredAirports.map((a) => (
                              <div
                                key={a.value}
                                onMouseDown={(e) => { e.preventDefault(); setSelectedAirport(a.value); setAirportSearch(a.label); setShowAirportDropdown(false); }}
                                style={dropdownItemStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,149,42,0.1)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                              >
                                {a.label}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* City */}
                  <div ref={cityDropdownRef}>
                    <label style={{ display: "block", fontSize: 11, color: "#6C6C82", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>City</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder={loadingCities ? "Loading cities..." : "Type to search city..."}
                        value={showCityDropdown ? citySearch : selectedCity || citySearch}
                        onChange={(e) => { setCitySearch(e.target.value); setSelectedCity(""); setShowCityDropdown(true); }}
                        onFocus={() => { setShowCityDropdown(true); setCitySearch(""); }}
                        disabled={loadingCities}
                        autoComplete="off"
                        style={{ ...inputStyle, cursor: loadingCities ? "wait" : "text", color: loadingCities ? "#94a3b8" : "#12172B" }}
                      />
                      {showCityDropdown && !loadingCities && (
                        <div ref={listRef} onScroll={handleScroll} style={dropdownMenuStyle}>
                          {visibleCities.length === 0 ? (
                            <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>No cities found</div>
                          ) : (
                            visibleCities.map((city) => (
                              <div
                                key={city}
                                onMouseDown={(e) => { e.preventDefault(); setSelectedCity(city); setCitySearch(city); setShowCityDropdown(false); setRateResult(null); }}
                                style={dropdownItemStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,149,42,0.1)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                              >
                                {city}
                              </div>
                            ))
                          )}
                          {visibleCities.length < filteredCities.length && (
                            <div style={{ padding: "0.5rem 1rem", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
                              Scroll for more... ({filteredCities.length - visibleCities.length} remaining)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div ref={vehicleDropdownRef}>
                    <label style={{ display: "block", fontSize: 11, color: "#6C6C82", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Vehicle Type</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search vehicle..."
                        value={showVehicleDropdown ? vehicleSearch : selectedVehicle || vehicleSearch}
                        onChange={(e) => { setVehicleSearch(e.target.value); setSelectedVehicle(""); setShowVehicleDropdown(true); }}
                        onFocus={() => { setShowVehicleDropdown(true); setVehicleSearch(""); }}
                        autoComplete="off"
                        style={inputStyle}
                      />
                      {showVehicleDropdown && (
                        <div style={dropdownMenuStyle}>
                          {filteredVehicles.length === 0 ? (
                            <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>No vehicles found</div>
                          ) : (
                            filteredVehicles.map((v) => (
                              <div
                                key={v.id}
                                onMouseDown={(e) => { e.preventDefault(); setSelectedVehicle(v.name); setVehicleSearch(v.name); setShowVehicleDropdown(false); setRateResult(null); }}
                                style={dropdownItemStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,149,42,0.1)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                              >
                                {v.name}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#12172B", fontSize: 13 }}>
                    <input type="radio" name="svcdir" checked={direction === "to"} onChange={() => setDirection("to")} style={{ accentColor: "#C9952A" }} />
                    Going TO airport
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#12172B", fontSize: 13 }}>
                    <input type="radio" name="svcdir" checked={direction === "from"} onChange={() => setDirection("from")} style={{ accentColor: "#C9952A" }} />
                    Coming FROM airport
                  </label>
                </div>

                {rateError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "0.6rem 0.9rem", color: "#dc2626", fontSize: 12, marginBottom: "0.75rem" }}>
                    {rateError}
                  </div>
                )}

                {rateResult && (
                  <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "1.25rem", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.4rem" }}>CA${rateResult.total.toFixed(2)}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 1rem", fontSize: 12, color: "#6C6C82" }}>
                      <span>Base Rate:</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.base.toFixed(2)}</span>
                      <span>Fuel Surcharge (5%):</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.fuel.toFixed(2)}</span>
                      <span>HST (13%):</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.hst.toFixed(2)}</span>
                      <span>Driver Gratuity (15%):</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.gratuity.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button onClick={handleGetRates}
                  style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0.7rem 1.75rem", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5 }}>
                  GET RATES
                </button>
              </div>
            )}

            {/* Disclaimer */}
            {service.disclaimer && (
              <div style={{ background: "#EFEBE0", border: "1px solid #E4DFD2", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "2rem" }}>
                <ul style={{ margin: 0, padding: "0 0 0 1.1rem", color: "#6C6C82", fontSize: 12, lineHeight: 2 }}>
                  <li>Rates shown are estimates. Final fare confirmed at booking.</li>
                  <li>{service.disclaimer}</li>
                  <li>Additional fee charged for use of toll highway 407.</li>
                  <li>Please call us if you don't see your city/town: <strong style={{ color: "#12172B" }}>(416) 619-0050</strong></li>
                </ul>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/#reservation-section"
                style={{ background: "#C9952A", color: "#fff", padding: "0.85rem 2rem", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                BOOK NOW
              </Link>
              <a href="tel:4166190050"
                style={{ background: "transparent", color: "#12172B", padding: "0.85rem 2rem", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid #E4DFD2", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                📞 (416) 619-0050
              </a>
            </div>
          </div>

          {/* SIDEBAR — other services */}
          <aside>
            <div style={{ position: "sticky", top: 100 }}>
              <h3 style={{ color: "#12172B", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #E4DFD2" }}>
                Other Services
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {otherServices.map(s => (
                  <Link key={s.slug} href={`/services/${s.slug}`}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 8, padding: "0.75rem 1rem", textDecoration: "none" }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <div style={{ color: "#12172B", fontSize: 13, fontWeight: 500 }}>{s.title}</div>
                      <div style={{ color: "#C9952A", fontSize: 11, marginTop: 1 }}>{s.startingFrom}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Contact box */}
              <div style={{ background: "#ffffff", border: "1px solid rgba(201,149,42,0.3)", borderRadius: 10, padding: "1.25rem", marginTop: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ color: "#C9952A", fontWeight: 600, fontSize: 13, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 1 }}>Need Help?</div>
                <p style={{ color: "#6C6C82", fontSize: 12, lineHeight: 1.6, marginBottom: "0.75rem" }}>
                  Call us 24/7 or email for same-day bookings and custom quotes.
                </p>
                <a href="tel:4166190050" style={{ display: "block", color: "#12172B", fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: "0.3rem" }}>📞 (416) 619-0050</a>
                <a href="mailto:reservations@torontoairportlimo.com" style={{ display: "block", color: "#6C6C82", fontSize: 11, textDecoration: "none" }}>reservations@torontoairportlimo.com</a>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <Footer />
    </main>
  );
}
