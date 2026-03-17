"use client";
import React, { useState, useEffect } from "react";
import styles from "./Reservation.module.css";
import Map from "./Map";

interface ReservationProps {
  selectedVehicle?: string;
  isModal?: boolean;
  onClose?: () => void;
}

interface CompareEntry {
  carType: string;
  tariff: number;
  maxPassengers: number;
  total: number;
}

interface VehicleOption {
  id: string;
  name: string;
  image?: string;
  rate?: number;
  category?: string;
  passengers?: number;
  luggage?: number;
}

interface ServiceOption {
  id: string;
  name: string;
}

const MEET_GREET_FEE = 49;

interface FareBreakdown {
  base: number;
  fuel: number;
  hst: number;
  gratuity: number;
  meetGreetFee: number;
  total: number;
}

function buildFare(base: number, meetAndGreet: boolean): FareBreakdown {
  const fuel = +(base * 0.05).toFixed(2);
  const hst = +(base * 0.13).toFixed(2);
  const gratuity = +(base * 0.15).toFixed(2);
  const meetGreetFee = meetAndGreet ? MEET_GREET_FEE : 0;
  const total = +(base + fuel + hst + gratuity + meetGreetFee).toFixed(2);
  return { base, fuel, hst, gratuity, meetGreetFee, total };
}

export default function Reservation({
  selectedVehicle,
  isModal,
  onClose,
}: ReservationProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [compareRates, setCompareRates] = useState<CompareEntry[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceTypeId: "",
    carType: "",
    vehiclePreferenceId: "",
    passengers: "1",
    bags: "1",
    city: "",
    pickupDate: "",
    pickupTime: "",
    pickupAmPm: "AM",
    pickupAddress: "",
    extraStop: "",
    hasReturnTrip: false,
    returnDate: "",
    returnTime: "",
    returnAmPm: "AM",
    airline: "",
    flightNumber: "",
    destinationAddress: "",
    childSeat: "",
    meetAndGreet: false,
    message: "",
  });

  // Load service types + vehicles
  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, vRes] = await Promise.all([
          fetch("/api/service-types"),
          fetch("/api/vehicles"),
        ]);
        const [sData, vData] = await Promise.all([
          sRes.json(),
          vRes.json(),
        ]);
        setServiceTypes(sData.items || []);
        const vItems = vData.items || [];
        setVehicles(vItems);

        setFormData((prev) => {
          let serviceTypeId = prev.serviceTypeId;
          let vehiclePreferenceId = prev.vehiclePreferenceId;
          let carType = prev.carType;

          if (!serviceTypeId && sData.items?.length) {
            serviceTypeId = sData.items[0].id;
          }
          if (selectedVehicle && vItems.length) {
            const match = vItems.find(
              (v: VehicleOption) =>
                v.name.toLowerCase() === selectedVehicle.toLowerCase()
            );
            if (match) {
              vehiclePreferenceId = match.id;
              carType = match.name;
            }
          }
          if (!vehiclePreferenceId && vItems.length) {
            vehiclePreferenceId = vItems[0].id;
          }
          if (!carType && vItems.length) {
            carType = vItems[0].name;
          }
          return { ...prev, serviceTypeId, vehiclePreferenceId, carType };
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, [selectedVehicle]);

  // Load destinations when car type changes
  useEffect(() => {
    if (!formData.carType) {
      setDestinations([]);
      return;
    }
    const loadDest = async () => {
      try {
        const res = await fetch(`/api/rates/destinations?carType=${encodeURIComponent(formData.carType)}&airport=YYZ`);
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setDestinations([]);
      }
    };
    loadDest();
    // Reset city when car type changes
    setFormData((prev) => ({ ...prev, city: "" }));
    setCompareRates([]);
  }, [formData.carType]);

  // Load compare rates (other vehicles) when city changes
  useEffect(() => {
    if (!formData.city) {
      setCompareRates([]);
      return;
    }
    const loadCompare = async () => {
      try {
        const res = await fetch(`/api/rates/compare?destination=${encodeURIComponent(formData.city)}&airport=YYZ`);
        if (!res.ok) { setCompareRates([]); return; }
        const data = await res.json();
        setCompareRates(Array.isArray(data) ? data : []);
      } catch {
        setCompareRates([]);
      }
    };
    loadCompare();
  }, [formData.city]);

  const selectedVeh = vehicles.find((v) => v.id === formData.vehiclePreferenceId);

  // Live fare calculation — fetch from DB when carType + city changes
  useEffect(() => {
    if (!formData.carType || !formData.city) {
      setFare(null);
      return;
    }
    const lookupFare = async () => {
      try {
        const res = await fetch(
          `/api/rates/lookup?carType=${encodeURIComponent(formData.carType)}&destination=${encodeURIComponent(formData.city)}&airport=YYZ`
        );
        if (!res.ok) { setFare(null); return; }
        const data = await res.json();
        setFare(buildFare(data.tariff, formData.meetAndGreet));
      } catch {
        setFare(null);
      }
    };
    lookupFare();
  }, [formData.carType, formData.city, formData.meetAndGreet]);

  // ─── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (mode: "pay" | "quote") => {
    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceTypeId: formData.serviceTypeId,
        vehiclePreferenceId: formData.vehiclePreferenceId,
        passengers: Number(formData.passengers),
        bags: Number(formData.bags),
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        city: formData.city,
        pickupAddress: formData.pickupAddress,
        airline: formData.airline,
        flightNumber: formData.flightNumber,
        destinationAddress: formData.destinationAddress,
        message: [
          formData.message,
          formData.meetAndGreet ? `Meet & Greet Service (+CA$${MEET_GREET_FEE})` : "",
          formData.extraStop ? `Extra Stop: ${formData.extraStop}` : "",
          formData.childSeat ? `Child Seat: ${formData.childSeat}` : "",
          formData.hasReturnTrip
            ? `Return Trip: ${formData.returnDate} ${formData.returnTime} ${formData.returnAmPm}`
            : "",
        ]
          .filter(Boolean)
          .join(" | "),
      };

      if (mode === "pay") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.details?.join(", ") || data.error || "Payment failed");
        }
        const { url } = await res.json();
        if (url) window.location.href = url;
        else throw new Error("No checkout URL returned");
      } else {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.issues?.fieldErrors) {
            const msgs = Object.entries(data.issues.fieldErrors)
              .map(([f, e]: [string, any]) => `${f}: ${Array.isArray(e) ? e[0] : e}`)
              .join(", ");
            throw new Error(msgs || data.error || "Failed");
          }
          throw new Error(data.details?.join(", ") || data.error || "Failed to submit");
        }
        setSubmitState("success");
        if (isModal && onClose) setTimeout(() => onClose(), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong");
      setSubmitState("error");
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fare) {
      handleSubmit("pay");
    } else {
      handleSubmit("quote");
    }
  };

  const isFormDisabled =
    submitState === "submitting" || submitState === "success" || loadingOptions;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            pickupAddress:
              data.results?.[0]?.formatted_address ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        } catch {
          setFormData((prev) => ({
            ...prev,
            pickupAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        }
      },
      () => alert("Unable to retrieve your location")
    );
  };

  useEffect(() => {
    if (!formData.pickupAddress) handleLocateMe();
  }, []);

  // ─── JSX ─────────────────────────────────────────────────────────
  const formContent = (
    <div
      className={`${styles.formWrapper} ${isModal ? styles.modalContent : ""}`}
      style={{ position: "relative" }}
    >
      {isModal && submitState !== "submitting" && (
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      )}

      <form onSubmit={onFormSubmit} style={{ position: "relative" }}>

        {/* Vehicle Image Preview */}
        {selectedVeh?.image && (
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <img
              src={selectedVeh.image}
              alt={selectedVeh.name}
              style={{
                maxWidth: "100%",
                maxHeight: "220px",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))",
              }}
            />
          </div>
        )}

        <div className={styles.grid}>

          {/* ── Passenger Information ── */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <h3 className={styles.formSubtitle}>Passenger Information</h3>
          </div>
          <div className={styles.formGroup}>
            <label>Full Name *</label>
            <input type="text" name="name" placeholder="John Doe" required
              onChange={handleChange} value={formData.name} disabled={isFormDisabled} />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address *</label>
            <input type="email" name="email" placeholder="john@example.com" required
              onChange={handleChange} value={formData.email} disabled={isFormDisabled} />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number *</label>
            <input type="tel" name="phone" placeholder="(416) 000-0000" required
              onChange={handleChange} value={formData.phone} disabled={isFormDisabled} />
          </div>

          {/* ── Trip Details ── */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <h3 className={styles.formSubtitle}>Trip Details</h3>
          </div>

          <div className={styles.formGroup}>
            <label>Service Type</label>
            <select name="serviceTypeId" onChange={handleChange}
              value={formData.serviceTypeId} disabled={isFormDisabled}>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Vehicle</label>
            <select name="carType" onChange={(e) => {
              const val = e.target.value;
              const matched = vehicles.find((v) => v.name === val);
              setFormData((prev) => ({
                ...prev,
                carType: val,
                vehiclePreferenceId: matched?.id || prev.vehiclePreferenceId,
              }));
            }}
              value={formData.carType} disabled={isFormDisabled}>
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}{v.passengers ? ` — up to ${v.passengers} pax` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* ── City selection — triggers live rate ── */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>
              City / Municipality
              <span style={{ color: "#D4AF37", marginLeft: 6, fontSize: 12 }}>
                ← Select to see your fare
              </span>
            </label>
            <select name="city" onChange={handleChange}
              value={formData.city} disabled={isFormDisabled || !formData.carType}>
              <option value="">{formData.carType ? "Select a City" : "Select a Car Type first"}</option>
              {destinations.map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            <small style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
              Required for airport transfer flat-rate pricing.
            </small>
          </div>

          {/* ── Live Fare Preview ── */}
          {fare ? (
            <div className={`${styles.fullWidth}`}>
              <div style={{
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: 12,
                padding: "1.25rem 1.5rem",
                marginBottom: "0.5rem",
              }}>
                <div style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.75rem" }}>
                  Estimated Fare — {formData.city} → {formData.carType}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem 1rem", fontSize: 14, color: "#d1d5db", marginBottom: "0.75rem" }}>
                  <span>Base Rate:</span>
                  <span style={{ textAlign: "right" }}>CA${fare.base.toFixed(2)}</span>
                  <span>Fuel Surcharge (5%):</span>
                  <span style={{ textAlign: "right" }}>CA${fare.fuel.toFixed(2)}</span>
                  <span>HST (13%):</span>
                  <span style={{ textAlign: "right" }}>CA${fare.hst.toFixed(2)}</span>
                  <span>Driver Gratuity (15%):</span>
                  <span style={{ textAlign: "right" }}>CA${fare.gratuity.toFixed(2)}</span>
                  {fare.meetGreetFee > 0 && (
                    <>
                      <span style={{ color: "#D4AF37" }}>Meet &amp; Greet:</span>
                      <span style={{ textAlign: "right", color: "#D4AF37" }}>CA${fare.meetGreetFee.toFixed(2)}</span>
                    </>
                  )}
                </div>
                <div style={{ borderTop: "1px solid rgba(212,175,55,0.2)", paddingTop: "0.6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total (One Way)</span>
                  <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: 24 }}>CA${fare.total.toFixed(2)}</span>
                </div>
                <small style={{ fontSize: 11, color: "#6b7280", marginTop: "0.5rem", display: "block" }}>
                  Rate is per vehicle, one way. 407 tolls and extra stops billed separately.
                </small>
              </div>
            </div>
          ) : formData.city ? (
            <div className={`${styles.fullWidth}`}>
              <div style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "0.85rem 1rem",
                fontSize: 13,
                color: "#fca5a5",
              }}>
                No flat rate found for <strong>{formData.city}</strong>. Please call us at{" "}
                <a href="tel:4166190050" style={{ color: "#D4AF37" }}>(416) 619-0050</a>{" "}
                for a custom quote.
              </div>
            </div>
          ) : null}

          {/* In other vehicles table */}
          {formData.city && compareRates.length > 1 && (
            <div className={`${styles.fullWidth}`}>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: "0.5rem",
              }}>
                <div style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#e5e7eb" }}>
                    In other vehicles...
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ textAlign: "left", padding: "0.6rem 1rem", color: "#9ca3af", fontWeight: 500, fontSize: 12 }}>Vehicle</th>
                      <th style={{ textAlign: "center", padding: "0.6rem 1rem", color: "#9ca3af", fontWeight: 500, fontSize: 12 }}>Max. Passengers</th>
                      <th style={{ textAlign: "right", padding: "0.6rem 1rem", color: "#9ca3af", fontWeight: 500, fontSize: 12 }}>Base Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRates
                      .filter((cr) => cr.carType !== formData.carType)
                      .map((cr) => (
                        <tr
                          key={cr.carType}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onClick={() => setFormData((prev) => ({ ...prev, carType: cr.carType }))}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.06)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <td style={{ padding: "0.7rem 1rem", color: "#e5e7eb", fontWeight: 500 }}>{cr.carType}</td>
                          <td style={{ padding: "0.7rem 1rem", color: "#d1d5db", textAlign: "center" }}>{cr.maxPassengers}</td>
                          <td style={{ padding: "0.7rem 1rem", color: "#D4AF37", fontWeight: 600, textAlign: "right" }}>${cr.tariff.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Passengers</label>
            <select name="passengers" onChange={handleChange}
              value={formData.passengers} disabled={isFormDisabled}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Passenger" : "Passengers"}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Luggage / Bags</label>
            <select name="bags" onChange={handleChange}
              value={formData.bags} disabled={isFormDisabled}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Bag" : "Bags"}</option>
              ))}
            </select>
          </div>

          {/* ── Schedule ── */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <h3 className={styles.formSubtitle}>Schedule</h3>
          </div>

          <div className={styles.formGroup}>
            <label>Pickup Date *</label>
            <input type="date" name="pickupDate" required
              onChange={handleChange} value={formData.pickupDate}
              disabled={isFormDisabled} style={{ colorScheme: "dark" }} />
          </div>

          <div className={styles.formGroup}>
            <label>Pickup Time *</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="time" name="pickupTime" required step="60"
                onChange={handleChange} value={formData.pickupTime}
                disabled={isFormDisabled} style={{ flex: 1, colorScheme: "dark" }} />
              <select name="pickupAmPm" onChange={handleChange}
                value={formData.pickupAmPm} disabled={isFormDisabled}
                style={{ width: 70 }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <small style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
              Online reservations require at least 8 hours advance notice.
            </small>
          </div>

          {/* Return Trip */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input type="checkbox" name="hasReturnTrip"
                checked={formData.hasReturnTrip} onChange={handleChange}
                disabled={isFormDisabled}
                style={{ width: 16, height: 16, accentColor: "#D4AF37" }} />
              <span>I need a return trip (different date/time)</span>
            </label>
          </div>

          {formData.hasReturnTrip && (
            <>
              <div className={styles.formGroup}>
                <label>Return Date</label>
                <input type="date" name="returnDate" onChange={handleChange}
                  value={formData.returnDate} disabled={isFormDisabled}
                  style={{ colorScheme: "dark" }} />
              </div>
              <div className={styles.formGroup}>
                <label>Return Time</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="time" name="returnTime" step="60"
                    onChange={handleChange} value={formData.returnTime}
                    disabled={isFormDisabled} style={{ flex: 1, colorScheme: "dark" }} />
                  <select name="returnAmPm" onChange={handleChange}
                    value={formData.returnAmPm} disabled={isFormDisabled}
                    style={{ width: 70 }}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── Locations ── */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <h3 className={styles.formSubtitle}>Pickup &amp; Destination</h3>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Pickup Address / Airport *</label>
            <div className={styles.inputWithButton}>
              <input type="text" name="pickupAddress"
                placeholder="Enter address or airport (e.g. Toronto Pearson YYZ)"
                required onChange={handleChange} value={formData.pickupAddress}
                disabled={isFormDisabled} />
              <button type="button" className={styles.locateBtn}
                onClick={handleLocateMe} title="Locate Me" disabled={isFormDisabled}>
                Locate Me
              </button>
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Additional Stop (Optional)</label>
            <input type="text" name="extraStop"
              placeholder="Intermediate stop address (optional)"
              onChange={handleChange} value={formData.extraStop} disabled={isFormDisabled} />
            <small style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
              +$10 per 10 min wait / $15 per extra drop-off.
            </small>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Destination Address *</label>
            <input type="text" name="destinationAddress"
              placeholder="Enter destination address" required
              onChange={handleChange} value={formData.destinationAddress}
              disabled={isFormDisabled} />
          </div>

          {/* ── Flight Info ── */}
          <div className={styles.formGroup}>
            <label>Airline (Optional)</label>
            <input type="text" name="airline" placeholder="e.g. Air Canada"
              onChange={handleChange} value={formData.airline} disabled={isFormDisabled} />
          </div>
          <div className={styles.formGroup}>
            <label>Flight Number (Optional)</label>
            <input type="text" name="flightNumber" placeholder="e.g. AC123"
              onChange={handleChange} value={formData.flightNumber} disabled={isFormDisabled} />
          </div>

          {/* Meet & Greet */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="meetAndGreet"
                checked={formData.meetAndGreet}
                onChange={handleChange}
                disabled={isFormDisabled}
                style={{ width: 16, height: 16, marginTop: 2, accentColor: "#D4AF37", flexShrink: 0 }}
              />
              <span>
                <strong style={{ color: "#fff" }}>Meet &amp; Greet Service</strong>
                <span style={{ color: "#D4AF37", fontWeight: 700, marginLeft: 8 }}>+CA$49</span>
                <br />
                <small style={{ color: "#9ca3af", fontSize: 12 }}>
                  Your driver meets you inside the terminal at the arrivals gate with a name sign.
                </small>
              </span>
            </label>
          </div>

          {/* Child Seat */}
          <div className={styles.formGroup}>
            <label>Child Seat (Optional)</label>
            <select name="childSeat" onChange={handleChange}
              value={formData.childSeat} disabled={isFormDisabled}>
              <option value="">No child seat needed</option>
              <option value="Rear Facing (Infant)">Rear Facing Seat (Infant)</option>
              <option value="Forward Facing (Toddler)">Forward Facing Seat (Toddler)</option>
              <option value="Booster Seat">Booster Seat</option>
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Special Instructions / Notes</label>
            <textarea name="message" rows={3}
              placeholder="Additional requests, meet & greet, etc."
              onChange={handleChange} value={formData.message}
              disabled={isFormDisabled} />
          </div>

        </div>

        {/* ── Loading Overlay ── */}
        {submitState === "submitting" && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", borderRadius: 16, zIndex: 100,
          }}>
            <div style={{
              width: 50, height: 50,
              border: "4px solid rgba(212,175,55,0.3)",
              borderTop: "4px solid #D4AF37",
              borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "1.5rem",
            }} />
            <div style={{ color: "#D4AF37", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Processing...
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>
              Please wait, you will be redirected to secure payment
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {submitError && submitState === "error" && (
          <div style={{
            background: "#7f1d1d", border: "1px solid #991b1b", color: "#fca5a5",
            padding: "1rem 1.25rem", borderRadius: 8, marginTop: "1.5rem",
            marginBottom: "1rem", fontSize: 14,
            display: "flex", alignItems: "flex-start", gap: "0.75rem",
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Booking Error</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{submitError}</div>
            </div>
            <button type="button" onClick={() => { setSubmitError(null); setSubmitState("idle"); }}
              style={{ background: "transparent", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 20 }}>
              ×
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {submitState === "success" && (
          <div style={{
            background: "#14532d", border: "1px solid #166534", color: "#86efac",
            padding: "1rem 1.25rem", borderRadius: 8, marginTop: "1.5rem",
            marginBottom: "1rem", fontSize: 14,
            display: "flex", alignItems: "flex-start", gap: "0.75rem",
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>✓</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Reservation Request Submitted!</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                Thank you! Our team will contact you shortly to confirm your booking.
              </div>
            </div>
          </div>
        )}

        {/* ── Payment / Submit Section ── */}
        {fare ? (
          <div style={{
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 12, padding: "1.5rem", marginTop: "1.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ color: "#9ca3af", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  {formData.carType} — {formData.city}
                </div>
                <div style={{ color: "#D4AF37", fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>
                  CA${fare.total.toFixed(2)}
                </div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>
                  Base ${fare.base} + Fuel ${fare.fuel} + HST ${fare.hst} + Gratuity ${fare.gratuity}
                  {fare.meetGreetFee > 0 && ` + Meet & Greet $${fare.meetGreetFee}`}
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(99,91,255,0.1)", border: "1px solid rgba(99,91,255,0.25)",
                borderRadius: 6, padding: "6px 12px",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span style={{ color: "#635BFF", fontSize: 13, fontWeight: 600 }}>Stripe</span>
              </div>
            </div>

            <button type="submit" disabled={isFormDisabled}
              className={`btn-primary ${styles.submitBtn}`}
              style={{
                opacity: isFormDisabled ? 0.6 : 1,
                cursor: isFormDisabled ? "not-allowed" : "pointer",
                margin: 0, background: "#635BFF",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
              {submitState === "submitting" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.8s linear infinite",
                  }} />
                  Redirecting to Stripe...
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay CA${fare.total.toFixed(2)} &amp; Confirm Booking
                </>
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ color: "#6b7280", fontSize: 12 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>

            <button type="button" disabled={isFormDisabled} onClick={() => handleSubmit("quote")}
              style={{
                width: "100%", padding: "0.9rem", fontSize: "0.9rem",
                letterSpacing: 1, textTransform: "uppercase",
                background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8, color: "#9ca3af",
                cursor: isFormDisabled ? "not-allowed" : "pointer",
                opacity: isFormDisabled ? 0.6 : 1,
              }}>
              Request Quote Without Payment
            </button>
          </div>
        ) : (
          <button type="submit" disabled={isFormDisabled}
            className={`btn-primary ${styles.submitBtn}`}
            style={{ opacity: isFormDisabled ? 0.6 : 1, cursor: isFormDisabled ? "not-allowed" : "pointer" }}>
            {submitState === "submitting"
              ? "Submitting..."
              : submitState === "success"
                ? "Submitted ✓"
                : "Request Reservation Quote"}
          </button>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </form>

      <div className={styles.mapSide}>
        <h3 className={styles.mapTitle}>Pickup Location Preview</h3>
        <Map address={formData.pickupAddress || "Toronto Pearson Airport, ON"} height="100%" />
      </div>
    </div>
  );

  if (isModal) {
    return <div className={styles.modalOverlay}>{formContent}</div>;
  }

  return (
    <section id="book" className={styles.reservation}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Reserve Now</span>
          <h2 className={styles.sectionTitle}>Book Your Premium Experience</h2>
        </div>
        {formContent}
      </div>
    </section>
  );
}
