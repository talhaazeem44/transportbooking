"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

interface AirportOption {
  id: string;
  name: string;
  code: string;
}

export default function VehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Rate calculator state
  const [airportsList, setAirportsList] = useState<AirportOption[]>([]);
  const [selectedAirport, setSelectedAirport] = useState("");
  const [airportSearch, setAirportSearch] = useState("");
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);

  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  const [direction, setDirection] = useState<"to" | "from">("to");
  const [rateResult, setRateResult] = useState<{
    base: number; fuel: number; hst: number; gratuity: number; total: number;
  } | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const airportDropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load vehicle data + airports
  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicles/${id}`).then(r => r.json()),
      fetch("/api/vehicles").then(r => r.json()),
      fetch("/api/airports").then(r => r.json()),
    ]).then(([veh, all, airports]) => {
      if (veh.error) { router.replace("/"); return; }
      setVehicle(veh);
      setAllVehicles((all.items || []).filter((v: Vehicle) => v.id !== id));
      setAirportsList(Array.isArray(airports) ? airports : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

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
    if (!selectedCity) { setRateError("Please select a city first."); return; }
    if (!vehicle) return;

    const airportCode = selectedAirport || "YYZ";
    try {
      const res = await fetch(`/api/rates/lookup?carType=${encodeURIComponent(vehicle.name)}&destination=${encodeURIComponent(selectedCity)}&airport=${encodeURIComponent(airportCode)}`);
      if (!res.ok) {
        setRateError("Rate not found for this combination. Please contact us.");
        return;
      }
      const data = await res.json();
      const base = data.tariff;
      const fuel = +(base * 0.05).toFixed(2);
      const hst = +(base * 0.13).toFixed(2);
      const gratuity = +(base * 0.15).toFixed(2);
      const total = +(base + fuel + hst + gratuity).toFixed(2);
      setRateResult({ base, fuel, hst, gratuity, total });
    } catch {
      setRateError("Something went wrong. Please try again.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.75rem",
    background: "#EFEBE0",
    border: "1px solid #E4DFD2",
    borderRadius: 6,
    color: "#12172B",
    fontSize: 14,
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

  if (loading) return (
    <main>
      <Navbar />
      <div style={{ paddingTop: 120, textAlign: "center", color: "#6C6C82", fontSize: 18 }}>Loading...</div>
      <Footer />
    </main>
  );

  if (!vehicle) return null;

  return (
    <main style={{ backgroundColor: "#F7F4EE", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 90 }}>

        {/* Breadcrumb */}
        <div style={{ background: "#EFEBE0", borderBottom: "1px solid #E4DFD2", padding: "0.75rem 1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", fontSize: 13, color: "#6C6C82" }}>
            <Link href="/" style={{ color: "#6C6C82", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <Link href="/#fleet" style={{ color: "#6C6C82", textDecoration: "none" }}>Vehicles</Link>
            <span style={{ margin: "0 0.5rem" }}>›</span>
            <span style={{ color: "#C9952A" }}>{vehicle.name}</span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }}>

            {/* LEFT — Vehicle detail */}
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 300, color: "#12172B", marginBottom: "0.25rem" }}>
                {vehicle.name}
              </h1>
              <p style={{ color: "#C9952A", fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: "1.5rem" }}>
                {vehicle.category || "Luxury Vehicle"}
              </p>

              {/* Vehicle image */}
              {vehicle.image && (
                <div style={{ background: "#ffffff", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid #E4DFD2", textAlign: "center", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain" }}
                  />
                </div>
              )}

              {/* Specs row */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {vehicle.passengers > 0 && (
                  <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 8, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#12172B", fontSize: 14 }}>
                    <svg width="18" height="18" fill="none" stroke="#C9952A" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Up to <strong>{vehicle.passengers}</strong> passengers
                  </div>
                )}
                {vehicle.luggage > 0 && (
                  <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 8, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#12172B", fontSize: 14 }}>
                    <svg width="18" height="18" fill="none" stroke="#C9952A" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    Up to <strong>{vehicle.luggage}</strong> luggage pieces
                  </div>
                )}
              </div>

              {/* Description */}
              {vehicle.description && (
                <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 10, padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ color: "#12172B", fontWeight: 500, marginBottom: "0.75rem", fontSize: 16 }}>About this Vehicle</h3>
                  <p style={{ color: "#6C6C82", lineHeight: 1.7, fontSize: 14 }}>{vehicle.description}</p>
                </div>
              )}

              {/* Rate Calculator — Dynamic */}
              <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 12, padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 300, color: "#12172B", marginBottom: "0.5rem" }}>
                  {vehicle.name} — Rate Calculator
                </h2>
                <p style={{ color: "#6C6C82", fontSize: 12, marginBottom: "1.25rem" }}>
                  One-way cost per vehicle · 5% Fuel Surcharge · 13% HST · 15% Driver Gratuity
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                  {/* Airport — searchable dropdown */}
                  <div ref={airportDropdownRef}>
                    <label style={{ display: "block", fontSize: 11, color: "#6C6C82", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Airport</label>
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

                  {/* City — searchable with lazy loading */}
                  <div ref={cityDropdownRef}>
                    <label style={{ display: "block", fontSize: 11, color: "#6C6C82", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>City</label>
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
                            <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>
                              No cities found for &quot;{citySearch}&quot;
                            </div>
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
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#12172B", fontSize: 14 }}>
                    <input type="radio" name="dir" checked={direction === "to"} onChange={() => setDirection("to")} style={{ accentColor: "#C9952A" }} />
                    Going TO airport
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#12172B", fontSize: 14 }}>
                    <input type="radio" name="dir" checked={direction === "from"} onChange={() => setDirection("from")} style={{ accentColor: "#C9952A" }} />
                    Coming FROM airport
                  </label>
                </div>

                {rateError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "0.75rem 1rem", color: "#dc2626", fontSize: 13, marginBottom: "1rem" }}>
                    {rateError}
                  </div>
                )}

                {rateResult && (
                  <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "1.25rem", marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.4rem" }}>
                      CA${rateResult.total.toFixed(2)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 1rem", fontSize: 13, color: "#6C6C82" }}>
                      <span>Base Rate:</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.base.toFixed(2)}</span>
                      <span>Fuel Surcharge (5%):</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.fuel.toFixed(2)}</span>
                      <span>HST (13%):</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.hst.toFixed(2)}</span>
                      <span>Driver Gratuity (15%):</span><span style={{ textAlign: "right", color: "#12172B" }}>CA${rateResult.gratuity.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    onClick={handleGetRates}
                    style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0.75rem 1.75rem", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5 }}
                  >
                    GET RATES
                  </button>
                  <Link
                    href="/#reservation-section"
                    style={{ background: "#C9952A", color: "#fff", padding: "0.75rem 1.75rem", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    BOOK THIS VEHICLE
                  </Link>
                </div>
              </div>

              {/* Services list */}
              <div style={{ background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 10, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ color: "#12172B", fontWeight: 500, marginBottom: "1rem", fontSize: 16 }}>Services Available</h3>
                <ul style={{ margin: 0, padding: "0 0 0 1.25rem", color: "#6C6C82", fontSize: 14, lineHeight: 2.1 }}>
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
                <h3 style={{ color: "#12172B", fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #E4DFD2" }}>
                  Other Vehicles
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {allVehicles.map(v => (
                    <Link
                      key={v.id}
                      href={`/vehicles/${v.id}`}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#ffffff", border: "1px solid #E4DFD2", borderRadius: 8, padding: "0.75rem", textDecoration: "none", transition: "border-color 0.2s" }}
                    >
                      {v.image ? (
                        <img src={v.image} alt={v.name} style={{ width: 72, height: 48, objectFit: "contain", flexShrink: 0, background: "#EFEBE0", borderRadius: 4, padding: 2 }} />
                      ) : (
                        <div style={{ width: 72, height: 48, background: "#EFEBE0", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="24" height="24" fill="none" stroke="#C9952A" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                        </div>
                      )}
                      <div>
                        <div style={{ color: "#12172B", fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{v.name}</div>
                        {v.passengers > 0 && (
                          <div style={{ color: "#6C6C82", fontSize: 11, marginTop: 2 }}>Up to {v.passengers} pax</div>
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
