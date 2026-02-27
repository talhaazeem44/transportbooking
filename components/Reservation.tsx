"use client";
import React, { useState, useEffect } from "react";
import styles from "./Reservation.module.css";
import Map from "./Map";

interface ReservationProps {
  selectedVehicle?: string;
  isModal?: boolean;
  onClose?: () => void;
}

interface Option {
  id: string;
  name: string;
}

export default function Reservation({
  selectedVehicle,
  isModal,
  onClose,
}: ReservationProps) {
  const [serviceTypes, setServiceTypes] = useState<Option[]>([]);
  const [vehicles, setVehicles] = useState<Option[]>([]);
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

          // If a vehicle was pre-selected from Fleet, try to map by name.
          if (selectedVehicle && vData.items?.length) {
            const match = vData.items.find(
              (v: Option) =>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("submitting");
    setSubmitError(null);

    // Debug: Log the time value being sent
    console.log("[Reservation] Pickup Time value:", formData.pickupTime);
    console.log("[Reservation] Pickup Date value:", formData.pickupDate);

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
        pickupAddress: formData.pickupAddress,
        airline: formData.airline,
        flightNumber: formData.flightNumber,
        destinationAddress: formData.destinationAddress,
        message: formData.message,
      };

      console.log("[Reservation] Submitting payload:", payload);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Show detailed validation errors if available
        if (data.issues?.fieldErrors) {
          const fieldErrors = Object.entries(data.issues.fieldErrors)
            .map(([field, errors]: [string, any]) => {
              const errorMsg = Array.isArray(errors) ? errors[0] : errors;
              return `${field}: ${errorMsg}`;
            })
            .join(", ");
          throw new Error(fieldErrors || data.error || "Failed to submit reservation");
        }
        if (data.details && Array.isArray(data.details)) {
          throw new Error(data.details.join(", "));
        }
        throw new Error(data.error || "Failed to submit reservation");
      }
      setSubmitState("success");
      setSubmitError(null);

      // Auto-close modal after 3 seconds if it's a modal
      if (isModal && onClose) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong");
      setSubmitState("error");
    }
  };

  const isFormDisabled = submitState === "submitting" || submitState === "success" || loadingOptions;

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
          // Use reverse geocoding to get address from coordinates
          // For now, using a placeholder or a free API if available
          // Since we don't have a specific API key for reverse geocoding in env,
          // we'll use the coordinates as a fallback or a simple message.
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
          const data = await res.json();
          if (data.results && data.results[0]) {
            setFormData(prev => ({ ...prev, pickupAddress: data.results[0].formatted_address }));
          } else {
            // Fallback for simple display if no key
            setFormData(prev => ({ ...prev, pickupAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
        } catch (error) {
          console.error("Error geocoding:", error);
          setFormData(prev => ({ ...prev, pickupAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
      }
    );
  };

  // Auto-locate on mount
  useEffect(() => {
    if (!formData.pickupAddress) {
      handleLocateMe();
    }
  }, []);

  const formContent = (
    <div className={`${styles.formWrapper} ${isModal ? styles.modalContent : ""}`} style={{ position: "relative" }}>
      {isModal && submitState !== "submitting" && (
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      )}
      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
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
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
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
            <select name="bags" onChange={handleChange} value={formData.bags} disabled={isFormDisabled}>
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
                fontSize: "14px"
              }}
              placeholder="HH:mm"
              title="24-hour format: Enter time as HH:mm (00:00 to 23:59). Examples: 09:00 (9 AM), 14:30 (2:30 PM), 23:59 (11:59 PM)"
            />
            <small style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
              ⏰ <strong>24-Hour Format Required:</strong> HH:mm (00:00 to 23:59)<br />
              Examples: <code>09:00</code> = 9 AM, <code>14:30</code> = 2:30 PM, <code>23:59</code> = 11:59 PM
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
                📍 Locate Me
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
            <div style={{ color: "#D4AF37", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Submitting Reservation...
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>
              Please wait while we process your request
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
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Error submitting reservation</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{submitError}</div>
            </div>
            <button
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
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
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
            <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Reservation Request Submitted!</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                Thank you! We have received your reservation request. Our team will contact you shortly to confirm your booking.
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitState === "submitting" || submitState === "success" || loadingOptions}
          className={`btn-primary ${styles.submitBtn}`}
          style={{
            opacity: submitState === "submitting" || submitState === "success" || loadingOptions ? 0.6 : 1,
            cursor: submitState === "submitting" || submitState === "success" || loadingOptions ? "not-allowed" : "pointer",
            position: "relative",
          }}
        >
          {submitState === "submitting" ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
              Submitting...
            </span>
          ) : submitState === "success" ? (
            "✓ Submitted Successfully"
          ) : (
            "Confirm Reservation Request"
          )}
        </button>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        ` }} />
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
          <h2 className={styles.sectionTitle}>Book Your Premium Experience</h2>
        </div>
        {formContent}
      </div>
    </section>
  );
}

