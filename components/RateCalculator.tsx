"use client";
import React, { useState, useEffect } from "react";
import { ratesData } from "@/lib/ratesData";

interface VehicleOption {
  id: string;
  name: string;
  rate?: number;
  image?: string;
  passengers?: number;
  bags?: number;
}

export default function RateCalculator() {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("Toronto Pearson Airport (YYZ)");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [direction, setDirection] = useState("to"); // "to" or "from"
  const [calculatedRate, setCalculatedRate] = useState<{
    base: number;
    total: number;
    fuel: number;
    hst: number;
    gratuity: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        setVehicles(data.items || []);
      } catch (e) {
        console.error("Failed to load vehicles", e);
      }
    };
    loadVehicles();
  }, []);

  const handleGetRates = () => {
    setError(null);
    if (!selectedCity || !selectedVehicle) {
      setError("Please select a City and a Vehicle first.");
      return;
    }

    // Find city rate
    const cityData = ratesData.find(c => c.city === selectedCity);
    if (!cityData) {
      setError("Rate not found for this city. Please call us.");
      return;
    }

    // Determine base rate depending on vehicle category?
    // Wait, the `ratesData` has `taxi` and `limo` rates.
    // If the vehicle name includes 'suv' or 'limo', maybe we use `limo` rate?
    // The reference site uses the rate based on vehicle type.
    // We can check if `cityData.limo` is not null and vehicle is a limo/suv, or just default to taxi/limo based on the selected vehicle's own `rate`?
    // Actually, `ratesData` has `taxi` and `limo` columns. But in Reservation we use the vehicle's own rate?
    // Ah, wait! `ratesData` is per-city airport transfer rates. `vehicles` has an hourly/point-to-point rate? 
    // In torontoairportlimo, base rate depends on city AND vehicle.
    // Since we only have `taxi` and `limo` in `ratesData.ts`, we will use `limo` rate for SUV/Limo and `taxi` for sedan/taxi.
    const isLimoOrSuv = selectedVehicle.toLowerCase().includes("suv") || selectedVehicle.toLowerCase().includes("limo") || selectedVehicle.toLowerCase().includes("sprinter");
    const baseRate = isLimoOrSuv ? cityData.limo : cityData.taxi;

    if (!baseRate) {
      setError("Rate not available for this combination. Please contact us.");
      return;
    }

    const fuel = baseRate * 0.05;
    const hst = baseRate * 0.13;
    const gratuity = baseRate * 0.15;
    const total = baseRate + fuel + hst + gratuity;

    setCalculatedRate({
      base: baseRate,
      total,
      fuel,
      hst,
      gratuity
    });
  };

  const scrollToReservation = () => {
    const el = document.getElementById("reservation-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif", color: "#f9fafb" }}>
      <h2 style={{ fontSize: "2.5rem", fontWeight: "300", color: "#f3f4f6", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
        Limo Rates Calculator
      </h2>
      
      <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#d1d5db", marginBottom: "1rem" }}>
        <strong>Please Note:</strong> Rate estimates shown, represent the "one-way" cost "per vehicle" to/from the airport for each of the respective city/vehicle combinations; and are for the vehicle, not the number of passengers.
      </p>

      <ul style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#d1d5db", paddingLeft: "2rem", marginBottom: "2rem" }}>
        <li>Additional fee charged for use of toll highway 407.</li>
        <li>Additional charges apply for extra stops for respective vehicles.</li>
        <li>Please call us if you don't see your city/town.</li>
        <li>All rates are subject to 5% Fuel Surcharge</li>
        <li>All rates are subject to 13% HST (government tax)</li>
        <li>All reservations are subject to 15% driver gratuity</li>
      </ul>

      <div style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "2rem", borderRadius: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "1.5rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>City</label>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: "0.75rem", border: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", backgroundColor: "#111827", fontSize: "1rem", color: "#f9fafb", outline: "none", cursor: "pointer" }}
            >
              <option value="">Select your City</option>
              {ratesData.map(r => (
                <option key={r.city} value={r.city}>{r.city}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
             <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>Airport</label>
            <select 
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value)}
              style={{ padding: "0.75rem", border: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", backgroundColor: "#111827", fontSize: "1rem", color: "#f9fafb", outline: "none", cursor: "pointer" }}
            >
              <option value="Toronto Pearson Airport (YYZ)">Toronto Pearson Airport (YYZ)</option>
              <option value="Billy Bishop Airport (YTZ)">Billy Bishop Airport (YTZ)</option>
              <option value="John C. Munro Hamilton (YHM)">John C. Munro Hamilton (YHM)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
             <label style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.5rem" }}>Vehicle</label>
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              style={{ padding: "0.75rem", border: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", backgroundColor: "#111827", fontSize: "1rem", color: "#f9fafb", outline: "none", cursor: "pointer" }}
            >
              <option value="">Select your Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(() => {
          const selectedVehObj = vehicles.find(v => v.name === selectedVehicle);
          if (selectedVehObj && selectedVehObj.image) {
            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "2rem", padding: "1.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <img src={selectedVehObj.image} alt={selectedVehObj.name} style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.5))", marginBottom: "1rem" }} />
                <div style={{ display: "flex", gap: "1.5rem", color: "#d1d5db", fontSize: "0.95rem" }}>
                   {selectedVehObj.passengers && <span><strong>Passengers:</strong> Up to {selectedVehObj.passengers}</span>}
                   {selectedVehObj.bags && <span><strong>Luggage:</strong> Up to {selectedVehObj.bags}</span>}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", padding: "1.25rem", borderRadius: "4px", color: "#fca5a5", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            <strong>Note:</strong> {error}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem", marginBottom: calculatedRate ? "2rem" : "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#d1d5db" }}>
              <input type="radio" name="direction" checked={direction === "to"} onChange={() => setDirection("to")} style={{ width: "18px", height: "18px", accentColor: "#4ade80" }} />
              I'm going TO the airport
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#d1d5db" }}>
              <input type="radio" name="direction" checked={direction === "from"} onChange={() => setDirection("from")} style={{ width: "18px", height: "18px", accentColor: "#4ade80" }} />
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

        {calculatedRate && (
          <div style={{ backgroundColor: "rgba(76, 175, 80, 0.1)", borderLeft: "4px solid #4caf50", padding: "1.5rem", borderRadius: "4px", marginBottom: "2rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff", marginBottom: "0.5rem" }}>
              Estimated Total: CA${calculatedRate.total.toFixed(2)}
            </div>
            <div style={{ fontSize: "0.95rem", color: "#9ca3af", fontStyle: "italic" }}>
              (Base Rate: ${calculatedRate.base.toFixed(2)} + 5% Fuel Surcharge + 13% HST + 15% Driver Gratuity)
            </div>
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <button 
             onClick={scrollToReservation}
             style={{ backgroundColor: "#6366f1", color: "white", border: "none", padding: "0.75rem 1.5rem", fontSize: "0.95rem", fontWeight: "500", borderRadius: "4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20h14"></path><path d="M5 4v16"></path><path d="M19 4v16"></path><path d="M5 8h14"></path><path d="M5 12h14"></path><path d="M5 16h14"></path><circle cx="9" cy="4" r="1"></circle><circle cx="15" cy="4" r="1"></circle></svg>
            BOOK YOUR LIMO NOW
          </button>
        </div>
      </div>

      <div style={{ marginTop: "3rem" }}>
        <h3 style={{ fontSize: "2rem", fontWeight: "300", color: "#f3f4f6", marginBottom: "1.5rem" }}>
          Services Offered in this Vehicle
        </h3>
        <ul style={{ fontSize: "0.95rem", lineHeight: "2", color: "#d1d5db", paddingLeft: "2rem" }}>
          <li style={{ color: "#d1d5db" }}>Point to point service</li>
          <li style={{ color: "#d1d5db" }}>Dedicated chauffeur service</li>
          <li style={{ color: "#4ade80" }}>Airport transfer</li>
          <li style={{ color: "#d1d5db" }}>Night life service</li>
          <li style={{ color: "#d1d5db" }}>Birthday parties</li>
          <li style={{ color: "#4ade80" }}>Prom and Graduation Limo Rental</li>
          <li style={{ color: "#4ade80" }}>Casino trips</li>
          <li style={{ color: "#d1d5db" }}>Scenic tours</li>
          <li style={{ color: "#4ade80" }}>Wine tours</li>
          <li style={{ color: "#d1d5db" }}>Sport events</li>
          <li style={{ color: "#d1d5db" }}>and more..</li>
        </ul>
      </div>
    </div>
  );
}
