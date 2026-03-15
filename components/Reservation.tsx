"use client";
import React, { useState, useEffect } from "react";
import styles from "./Reservation.module.css";
import Map from "./Map";
import { ratesData } from "@/lib/ratesData";

interface ReservationProps {
  selectedVehicle?: string;
  isModal?: boolean;
  onClose?: () => void;
}

interface VehicleOption {
  id: string;
  name: string;
  image?: string;
  rate?: number;
  category?: string;
}

interface ServiceOption {
  id: string;
  name: string;
}

export default function Reservation({
  selectedVehicle,
  isModal,
  onClose,
}: ReservationProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
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
    vehiclePreferenceId: "",
    passengers: "1",
    bags: "1",
    pickupDate: "",
    pickupTime: "",
    city: "",
    pickupAddress: "",
    airline: "",
    flightNumber: "",
    destinationAddress: "",
    message: "",
  });

  // Load options from API
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
        setVehicles(vData.items || []);

        setFormData((prev) => {
          let serviceTypeId = prev.serviceTypeId;
          let vehiclePreferenceId = prev.vehiclePreferenceId;

          if (!serviceTypeId && sData.items?.length) {
            serviceTypeId = sData.items[0].id;
          }

          if (selectedVehicle && vData.items?.length) {
            const match = vData.items.find(
              (v: VehicleOption) =>
                v.name.toLowerCase() === selectedVehicle.toLowerCase()
            );
            if (match) {
              vehiclePreferenceId = match.id;
            }
          }

          if (!vehiclePreferenceId && vData.items?.length) {
            vehiclePreferenceId = vData.items[0].id;
          }

          return { ...prev, serviceTypeId, vehiclePreferenceId };
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, [selectedVehicle]);

  const selectedVeh = vehicles.find(
    (v) => v.id === formData.vehiclePreferenceId
  );
  
  // Calculate base rate dynamically based on selected city (if any)
  let baseRate = selectedVeh?.rate || 0;
  
  if (formData.city && selectedVeh) {
    const cityData = ratesData.find(c => c.city === formData.city);
    if (cityData) {
      const isLimoOrSuv = selectedVeh.name.toLowerCase().includes("suv") || 
                          selectedVeh.name.toLowerCase().includes("limo") || 
                          selectedVeh.name.toLowerCase().includes("sprinter");
      
      const cityRate = isLimoOrSuv ? cityData.limo : cityData.taxi;
      if (cityRate) {
        baseRate = cityRate;
      }
    }
  }

  // Calculate specific surcharges
  const fuelSurcharge = baseRate * 0.05;
  const hst = baseRate * 0.13;
  const gratuity = baseRate * 0.15;
  
  // Total
  const totalRate = baseRate + fuelSurcharge + hst + gratuity;

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
        message: formData.message,
      };

      if (mode === "pay") {
        // Stripe Checkout flow
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.details?.join(", ") || data.error || "Payment failed"
          );
        }
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } else {
        // Quote-only flow (no payment)
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.issues?.fieldErrors) {
            const fieldErrors = Object.entries(data.issues.fieldErrors)
              .map(([field, errors]: [string, any]) => {
                const errorMsg = Array.isArray(errors) ? errors[0] : errors;
                return `${field}: ${errorMsg}`;
              })
              .join(", ");
            throw new Error(fieldErrors || data.error || "Failed");
          }
          throw new Error(
            data.details?.join(", ") || data.error || "Failed to submit"
          );
        }
        setSubmitState("success");
        if (isModal && onClose) {
          setTimeout(() => onClose(), 3000);
        }
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong");
      setSubmitState("error");
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default submit = pay if rate exists, else quote
    handleSubmit(baseRate > 0 ? "pay" : "quote");
  };

  const isFormDisabled =
    submitState === "submitting" || submitState === "success" || loadingOptions;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await res.json();
          if (data.results && data.results[0]) {
            setFormData((prev) => ({
              ...prev,
              pickupAddress: data.results[0].formatted_address,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              pickupAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            }));
          }
        } catch {
          setFormData((prev) => ({
            ...prev,
            pickupAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        }
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  useEffect(() => {
    if (!formData.pickupAddress) {
      handleLocateMe();
    }
  }, []);

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
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <img 
              src={selectedVeh.image} 
              alt={selectedVeh.name} 
              style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }} 
            />
          </div>
        )}

        <div className={styles.grid}>
          {/* Passenger Information */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <h3 className={styles.formSubtitle}>Passenger Information</h3>
          </div>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              required
              onChange={handleChange}
              value={formData.name}
              disabled={isFormDisabled}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              required
              onChange={handleChange}
              value={formData.email}
              disabled={isFormDisabled}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="(416) 000-0000"
              required
              onChange={handleChange}
              value={formData.phone}
              disabled={isFormDisabled}
            />
          </div>

          {/* Trip Information */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <h3 className={styles.formSubtitle}>Trip Details</h3>
          </div>
          <div className={styles.formGroup}>
            <label>Service Type</label>
            <select
              name="serviceTypeId"
              onChange={handleChange}
              value={formData.serviceTypeId}
              disabled={isFormDisabled}
            >
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Vehicle Preference</label>
            <select
              name="vehiclePreferenceId"
              onChange={handleChange}
              value={formData.vehiclePreferenceId}
              disabled={isFormDisabled}
            >
              {vehicles.map((v) => {
                let displayRate = v.rate || 0;
                
                // If a city is selected, we must show the flat airport rate for this specific vehicle category
                if (formData.city) {
                  const cityData = ratesData.find(c => c.city === formData.city);
                  if (cityData) {
                    const isPremium = v.name.toLowerCase().includes("suv") || 
                                      v.name.toLowerCase().includes("limo") || 
                                      v.name.toLowerCase().includes("sprinter") ||
                                      (v.category && v.category.toLowerCase().includes("business")) ||
                                      (v.category && v.category.toLowerCase().includes("elite"));
                    
                    const cityRate = isPremium ? cityData.limo : cityData.taxi;
                    if (cityRate) displayRate = cityRate;
                  }
                }

                return (
                  <option key={v.id} value={v.id}>
                    {v.name}
                    {displayRate > 0 ? ` — CA$${displayRate.toFixed(2)} Base` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Passengers</label>
            <select
              name="passengers"
              onChange={handleChange}
              value={formData.passengers}
              disabled={isFormDisabled}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Passenger" : "Passengers"}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Luggage / Bags</label>
            <select
              name="bags"
              onChange={handleChange}
              value={formData.bags}
              disabled={isFormDisabled}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Bag" : "Bags"}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className={styles.formGroup}>
            <label>Pickup Date</label>
            <input
              type="date"
              name="pickupDate"
              required
              onChange={handleChange}
              value={formData.pickupDate}
              disabled={isFormDisabled}
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Pickup Time (24-Hour Format)</label>
            <input
              type="time"
              name="pickupTime"
              required
              onChange={handleChange}
              value={formData.pickupTime}
              step="60"
              disabled={isFormDisabled}
              style={{
                fontFamily: "monospace",
                letterSpacing: "0.05em",
                fontSize: "14px",
                colorScheme: "dark",
              }}
              placeholder="HH:mm"
              title="24-hour format: HH:mm (00:00 to 23:59)"
            />
            <small
              style={{
                fontSize: 11,
                color: "#9ca3af",
                marginTop: 4,
                display: "block",
              }}
            >
              24-Hour Format: HH:mm (e.g. 09:00 = 9 AM, 14:30 = 2:30 PM)
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>City / Municipality (For Airport Transfers)</label>
            <select
              name="city"
              onChange={handleChange}
              value={formData.city}
              disabled={isFormDisabled}
            >
              <option value="">Select a City (Optional)</option>
              {ratesData.map(r => (
                <option key={r.city} value={r.city}>
                  {r.city}
                </option>
              ))}
            </select>
            <small style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
              Select your city to see exact airport transfer rates.
            </small>
          </div>

          {/* Pickup Location */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Pickup Address / Airport</label>
            <div className={styles.inputWithButton}>
              <input
                type="text"
                name="pickupAddress"
                placeholder="Enter address or airport code"
                required
                onChange={handleChange}
                value={formData.pickupAddress}
                disabled={isFormDisabled}
              />
              <button
                type="button"
                className={styles.locateBtn}
                onClick={handleLocateMe}
                title="Locate Me"
                disabled={isFormDisabled}
              >
                Locate Me
              </button>
            </div>
          </div>

          {/* Airline / Flight info */}
          <div className={styles.formGroup}>
            <label>Airline (if airport)</label>
            <input
              type="text"
              name="airline"
              placeholder="e.g. Air Canada"
              onChange={handleChange}
              value={formData.airline}
              disabled={isFormDisabled}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Flight Number</label>
            <input
              type="text"
              name="flightNumber"
              placeholder="e.g. AC123"
              onChange={handleChange}
              value={formData.flightNumber}
              disabled={isFormDisabled}
            />
          </div>

          {/* Destination */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Destination Address</label>
            <input
              type="text"
              name="destinationAddress"
              placeholder="Enter destination address"
              required
              onChange={handleChange}
              value={formData.destinationAddress}
              disabled={isFormDisabled}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Special Instructions / Notes</label>
            <textarea
              name="message"
              rows={3}
              placeholder="Additional requests..."
              onChange={handleChange}
              value={formData.message}
              disabled={isFormDisabled}
            ></textarea>
          </div>
        </div>

        {/* Loading Overlay */}
        {submitState === "submitting" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                border: "4px solid rgba(212, 175, 55, 0.3)",
                borderTop: "4px solid #D4AF37",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "1.5rem",
              }}
            />
            <div
              style={{
                color: "#D4AF37",
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Processing...
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>
              Please wait, you will be redirected shortly
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && submitState === "error" && (
          <div
            style={{
              background: "#7f1d1d",
              border: "1px solid #991b1b",
              color: "#fca5a5",
              padding: "1rem 1.25rem",
              borderRadius: 8,
              marginTop: "1.5rem",
              marginBottom: "1rem",
              fontSize: 14,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>!</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Error
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{submitError}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                setSubmitState("idle");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#fca5a5",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
              }}
            >
              x
            </button>
          </div>
        )}

        {/* Success Message (quote only) */}
        {submitState === "success" && (
          <div
            style={{
              background: "#14532d",
              border: "1px solid #166534",
              color: "#86efac",
              padding: "1rem 1.25rem",
              borderRadius: 8,
              marginTop: "1.5rem",
              marginBottom: "1rem",
              fontSize: 14,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>&#10003;</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Reservation Request Submitted!
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                Thank you! Our team will contact you shortly to confirm your
                booking.
              </div>
            </div>
          </div>
        )}

        {/* ─── Payment Section ─── */}
        {baseRate > 0 && (
          <div
            style={{
              background: "rgba(212, 175, 55, 0.06)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: 12,
              padding: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {selectedVeh?.name} (Total Fare)
                </div>
                <div
                  style={{
                    color: "#D4AF37",
                    fontSize: 28,
                    fontWeight: 700,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  CA${totalRate.toFixed(2)}
                </div>
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                    fontStyle: "italic",
                    maxWidth: "350px",
                  }}
                >
                  (Base Rate: ${baseRate.toFixed(2)} + 5% Fuel Surcharge + 13% HST + 15% Driver Gratuity)
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(99, 91, 255, 0.1)",
                  border: "1px solid rgba(99, 91, 255, 0.25)",
                  borderRadius: 6,
                  padding: "6px 12px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#635BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span style={{ color: "#635BFF", fontSize: 13, fontWeight: 600 }}>
                  Stripe
                </span>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className={`btn-primary ${styles.submitBtn}`}
              style={{
                opacity: isFormDisabled ? 0.6 : 1,
                cursor: isFormDisabled ? "not-allowed" : "pointer",
                margin: 0,
                background: "#635BFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {submitState === "submitting" ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Redirecting to Stripe...
                </span>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="1"
                      y="4"
                      width="22"
                      height="16"
                      rx="2"
                      ry="2"
                    />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay CA${totalRate.toFixed(2)} &amp; Confirm Booking
                </>
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                margin: "1rem 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <span style={{ color: "#6b7280", fontSize: 12 }}>OR</span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                }}
              />
            </div>

            {/* Request Quote Button */}
            <button
              type="button"
              disabled={isFormDisabled}
              onClick={() => handleSubmit("quote")}
              style={{
                width: "100%",
                padding: "0.9rem",
                fontSize: "0.9rem",
                letterSpacing: 1,
                textTransform: "uppercase",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                color: "#9ca3af",
                cursor: isFormDisabled ? "not-allowed" : "pointer",
                opacity: isFormDisabled ? 0.6 : 1,
                transition: "all 0.3s ease",
              }}
            >
              Request Quote Without Payment
            </button>
          </div>
        )}

        {/* Fallback if no rate — just show quote button */}
        {baseRate <= 0 && (
          <button
            type="submit"
            disabled={isFormDisabled}
            className={`btn-primary ${styles.submitBtn}`}
            style={{
              opacity: isFormDisabled ? 0.6 : 1,
              cursor: isFormDisabled ? "not-allowed" : "pointer",
            }}
          >
            {submitState === "submitting"
              ? "Submitting..."
              : submitState === "success"
                ? "Submitted"
                : "Request Reservation Quote"}
          </button>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `,
          }}
        />
      </form>
      <div className={styles.mapSide}>
        <h3 className={styles.mapTitle}>Pickup Location Preview</h3>
        <Map address={formData.pickupAddress || "Toronto, ON"} height="100%" />
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
          <h2 className={styles.sectionTitle}>
            Book Your Premium Experience
          </h2>
        </div>
        {formContent}
      </div>
    </section>
  );
}
