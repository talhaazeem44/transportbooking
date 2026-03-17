"use client";
import { useState, useEffect, useRef, useMemo } from "react";

interface VehicleOption {
  id: string;
  name: string;
  rate?: number;
  image?: string;
  passengers?: number;
  bags?: number;
}

interface CompareEntry {
  carType: string;
  tariff: number;
  maxPassengers: number;
  total: number;
}

interface AirportOption {
  id: string;
  name: string;
  code: string;
}

export default function RateCalculator() {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [airportsList, setAirportsList] = useState<AirportOption[]>([]);
  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("");
  const [airportSearch, setAirportSearch] = useState("");
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [direction, setDirection] = useState("to");
  const [calculatedRate, setCalculatedRate] = useState<{
    base: number;
    total: number;
    fuel: number;
    hst: number;
    gratuity: number;
  } | null>(null);
  const [compareRates, setCompareRates] = useState<CompareEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const airportDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load vehicles + airports
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vRes, aRes] = await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/airports"),
        ]);
        const vData = await vRes.json();
        setVehicles(vData.items || []);
        if (aRes.ok) {
          const aData = await aRes.json();
          setAirportsList(Array.isArray(aData) ? aData : []);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
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
    setCalculatedRate(null);
    setCompareRates([]);
  }, [selectedAirport]);

  const airportOptions = useMemo(() =>
    airportsList.map((a) => ({ value: a.code, label: `${a.code} – ${a.name}` })),
    [airportsList]
  );

  const filteredAirports = airportOptions.filter((a) =>
    a.label.toLowerCase().includes(airportSearch.toLowerCase())
  );

  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) setShowCityDropdown(false);
      if (airportDropdownRef.current && !airportDropdownRef.current.contains(e.target as Node)) setShowAirportDropdown(false);
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) setShowVehicleDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter cities by search
  const filteredCities = allDestinations.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );
  const visibleCities = filteredCities.slice(0, visibleCount);

  // Lazy load more on scroll
  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setVisibleCount((prev) => Math.min(prev + 50, filteredCities.length));
    }
  };

  // Reset visible count on search change
  useEffect(() => {
    setVisibleCount(50);
  }, [citySearch]);

  const selectCity = (city: string) => {
    setSelectedCity(city);
    setCitySearch(city);
    setShowCityDropdown(false);
    setCalculatedRate(null);
    setCompareRates([]);
  };

  const handleGetRates = async () => {
    setError(null);
    setCalculatedRate(null);
    setCompareRates([]);

    if (!selectedCity || !selectedVehicle) {
      setError("Please select a City and Vehicle first.");
      return;
    }

    const airportCode = selectedAirport || "YYZ";
    try {
      const res = await fetch(`/api/rates/lookup?carType=${encodeURIComponent(selectedVehicle)}&destination=${encodeURIComponent(selectedCity)}&airport=${encodeURIComponent(airportCode)}`);
      if (!res.ok) {
        setError("Rate not found for this combination. Please contact us.");
        return;
      }
      const data = await res.json();
      const baseRate = data.tariff;
      const fuel = baseRate * 0.05;
      const hst = baseRate * 0.13;
      const gratuity = baseRate * 0.15;
      const total = baseRate + fuel + hst + gratuity;
      setCalculatedRate({ base: baseRate, total, fuel, hst, gratuity });

      const cRes = await fetch(`/api/rates/compare?destination=${encodeURIComponent(selectedCity)}&airport=${encodeURIComponent(airportCode)}`);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCompareRates(Array.isArray(cData) ? cData : []);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const scrollToReservation = () => {
    const el = document.getElementById("reservation-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const otherVehicles = compareRates.filter((cr) => cr.carType !== selectedVehicle);

  const selectStyle: React.CSSProperties = {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    fontSize: "1rem",
    color: "#1e293b",
    outline: "none",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif", color: "#1e293b" }}>
      <h2 style={{ fontSize: "2.5rem", fontWeight: "300", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
        Limo Rates Calculator
      </h2>

      <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#475569", marginBottom: "1rem" }}>
        <strong>Please Note:</strong> Rate estimates shown, represent the "one-way" cost "per vehicle" to/from the airport for each of the respective city/vehicle combinations; and are for the vehicle, not the number of passengers.
      </p>

      <ul style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#475569", paddingLeft: "2rem", marginBottom: "2rem" }}>
        <li>Additional fee charged for use of toll highway 407.</li>
        <li>Additional charges apply for extra stops for respective vehicles.</li>
        <li>Please call us if you don't see your city/town.</li>
        <li>All rates are subject to 5% Fuel Surcharge</li>
        <li>All rates are subject to 13% HST (government tax)</li>
        <li>All reservations are subject to 15% driver gratuity</li>
      </ul>

      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>

          {/* 1. City — searchable with lazy loading */}
          <div style={{ display: "flex", flexDirection: "column" }} ref={cityDropdownRef}>
            <label style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>City</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder={loadingCities ? "Loading cities..." : "Type to search city..."}
                value={showCityDropdown ? citySearch : selectedCity || citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setSelectedCity("");
                  setShowCityDropdown(true);
                }}
                onFocus={() => { setShowCityDropdown(true); setCitySearch(""); }}
                disabled={loadingCities}
                autoComplete="off"
                style={{
                  ...selectStyle,
                  cursor: loadingCities ? "wait" : "text",
                  color: loadingCities ? "#94a3b8" : "#1e293b",
                }}
              />
              {showCityDropdown && !loadingCities && (
                <div
                  ref={listRef}
                  onScroll={handleScroll}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: 250,
                    overflowY: "auto",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0 0 6px 6px",
                    zIndex: 999,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  }}
                >
                  {visibleCities.length === 0 ? (
                    <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>
                      No cities found for "{citySearch}"
                    </div>
                  ) : (
                    visibleCities.map((city) => (
                      <div
                        key={city}
                        onMouseDown={(e) => { e.preventDefault(); selectCity(city); }}
                        style={{
                          padding: "0.6rem 1rem",
                          cursor: "pointer",
                          fontSize: 14,
                          color: "#1e293b",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.1)"; }}
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

          {/* 2. Airport */}
          <div style={{ display: "flex", flexDirection: "column" }} ref={airportDropdownRef}>
            <label style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>Airport</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search airport..."
                value={showAirportDropdown ? airportSearch : (airportOptions.find(a => a.value === selectedAirport)?.label || airportSearch)}
                onChange={(e) => { setAirportSearch(e.target.value); setSelectedAirport(""); setShowAirportDropdown(true); }}
                onFocus={() => { setShowAirportDropdown(true); setAirportSearch(""); }}
                autoComplete="off"
                style={selectStyle}
              />
              {showAirportDropdown && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, maxHeight: 250, overflowY: "auto",
                  background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0 0 6px 6px",
                  zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}>
                  {filteredAirports.length === 0 ? (
                    <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>No airports found</div>
                  ) : (
                    filteredAirports.map((a) => (
                      <div
                        key={a.value}
                        onMouseDown={(e) => { e.preventDefault(); setSelectedAirport(a.value); setAirportSearch(a.label); setShowAirportDropdown(false); }}
                        style={{ padding: "0.6rem 1rem", cursor: "pointer", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.1)"; }}
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

          {/* 3. Vehicle */}
          <div style={{ display: "flex", flexDirection: "column" }} ref={vehicleDropdownRef}>
            <label style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>Vehicle</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search vehicle..."
                value={showVehicleDropdown ? vehicleSearch : selectedVehicle || vehicleSearch}
                onChange={(e) => { setVehicleSearch(e.target.value); setSelectedVehicle(""); setShowVehicleDropdown(true); }}
                onFocus={() => { setShowVehicleDropdown(true); setVehicleSearch(""); }}
                autoComplete="off"
                style={selectStyle}
              />
              {showVehicleDropdown && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, maxHeight: 250, overflowY: "auto",
                  background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0 0 6px 6px",
                  zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}>
                  {filteredVehicles.length === 0 ? (
                    <div style={{ padding: "0.75rem 1rem", color: "#94a3b8", fontSize: 14 }}>No vehicles found</div>
                  ) : (
                    filteredVehicles.map((v) => (
                      <div
                        key={v.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedVehicle(v.name);
                          setVehicleSearch(v.name);
                          setShowVehicleDropdown(false);
                          setCalculatedRate(null);
                          setCompareRates([]);
                        }}
                        style={{ padding: "0.6rem 1rem", cursor: "pointer", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.1)"; }}
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

        {/* Vehicle Image Preview */}
        {(() => {
          const selectedVehObj = vehicles.find(v => v.name === selectedVehicle);
          if (selectedVehObj && selectedVehObj.image) {
            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "2rem", padding: "1.5rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <img src={selectedVehObj.image} alt={selectedVehObj.name} style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))", marginBottom: "1rem" }} />
                <div style={{ display: "flex", gap: "1.5rem", color: "#475569", fontSize: "0.95rem" }}>
                  {selectedVehObj.passengers && <span><strong>Passengers:</strong> Up to {selectedVehObj.passengers}</span>}
                  {selectedVehObj.bags && <span><strong>Luggage:</strong> Up to {selectedVehObj.bags}</span>}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {error && (
          <div style={{ backgroundColor: "#fef2f2", borderLeft: "4px solid #dc2626", padding: "1.25rem", borderRadius: "4px", color: "#dc2626", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            <strong>Note:</strong> {error}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem", marginBottom: calculatedRate ? "2rem" : "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#475569" }}>
              <input type="radio" name="direction" checked={direction === "to"} onChange={() => setDirection("to")} style={{ width: "18px", height: "18px", accentColor: "#16a34a" }} />
              I'm going TO the airport
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#475569" }}>
              <input type="radio" name="direction" checked={direction === "from"} onChange={() => setDirection("from")} style={{ width: "18px", height: "18px", accentColor: "#16a34a" }} />
              I'm coming FROM the airport
            </label>
          </div>

          <button
            onClick={handleGetRates}
            style={{ backgroundColor: "#4caf50", color: "white", border: "none", padding: "0.75rem 2rem", fontSize: "1rem", fontWeight: "600", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            GET RATES
          </button>
        </div>

        {/* Calculated Rate Result */}
        {calculatedRate && (
          <div style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #16a34a", padding: "1.5rem", borderRadius: "4px", marginBottom: "2rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}>
              Total: ${calculatedRate.total.toFixed(2)}
            </div>
            <div style={{ fontSize: "0.95rem", color: "#64748b", fontStyle: "italic" }}>
              (Base Rate: ${calculatedRate.base.toFixed(2)} + 5% Fuel Surcharge + 13% HST + 15% Driver Gratuity)
            </div>
          </div>
        )}

        {/* Book Now Button */}
        {calculatedRate && (
          <div style={{ marginBottom: "2rem" }}>
            <button
              onClick={scrollToReservation}
              style={{ backgroundColor: "#6366f1", color: "white", border: "none", padding: "0.75rem 1.5rem", fontSize: "0.95rem", fontWeight: "500", borderRadius: "4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20h14"></path><path d="M5 4v16"></path><path d="M19 4v16"></path><path d="M5 8h14"></path><path d="M5 12h14"></path><path d="M5 16h14"></path></svg>
              BOOK YOUR LIMO NOW
            </button>
          </div>
        )}

        {/* In other vehicles table */}
        {calculatedRate && otherVehicles.length > 0 && (
          <div>
            <h3 style={{ fontSize: "1.75rem", fontWeight: "300", color: "#1e293b", marginBottom: "1rem" }}>
              In other vehicles...
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 600 }}>Vehicle</th>
                    <th style={{ textAlign: "center", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 600 }}>Max. Passengers</th>
                    <th style={{ textAlign: "right", padding: "0.75rem 1rem", color: "#64748b", fontWeight: 600 }}>Base Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {otherVehicles.map((cr) => (
                    <tr
                      key={cr.carType}
                      style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => {
                        setSelectedVehicle(cr.carType);
                        setCalculatedRate(null);
                        setCompareRates([]);
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.06)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "0.75rem 1rem", color: "#1e293b", fontWeight: 500 }}>{cr.carType}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#475569", textAlign: "center" }}>{cr.maxPassengers}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#D4AF37", fontWeight: 600, textAlign: "right" }}>${cr.tariff.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div style={{ marginTop: "3rem" }}>
        <h3 style={{ fontSize: "2rem", fontWeight: "300", color: "#1e293b", marginBottom: "1.5rem" }}>
          Services Offered in this Vehicle
        </h3>
        <ul style={{ fontSize: "0.95rem", lineHeight: "2", color: "#475569", paddingLeft: "2rem" }}>
          <li>Point to point service</li>
          <li>Dedicated chauffeur service</li>
          <li style={{ color: "#16a34a" }}>Airport transfer</li>
          <li>Night life service</li>
          <li>Birthday parties</li>
          <li style={{ color: "#16a34a" }}>Prom and Graduation Limo Rental</li>
          <li style={{ color: "#16a34a" }}>Casino trips</li>
          <li>Scenic tours</li>
          <li style={{ color: "#16a34a" }}>Wine tours</li>
          <li>Sport events</li>
          <li>and more..</li>
        </ul>
      </div>
    </div>
  );
}
