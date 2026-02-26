"use client";
import React, { useState, useEffect } from 'react';
import styles from './Fleet.module.css';
import Reservation from './Reservation';

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

export default function Fleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        setVehicles(data.items || []);
      } catch (e) {
        console.error('Failed to load vehicles:', e);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleBookNow = (vehicleName: string) => {
    setSelectedVehicle(vehicleName);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section id="fleet" className={styles.fleet}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Our Collection</span>
            <h2 className={styles.sectionTitle}>The Fleet Of Excellence</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#A0A0A0' }}>
            Loading vehicles...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fleet" className={styles.fleet}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Our Collection</span>
          <h2 className={styles.sectionTitle}>The Fleet Of Excellence</h2>
        </div>

        {vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#A0A0A0' }}>
            No vehicles available at the moment.
          </div>
        ) : (
          <div className={styles.grid}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.vehicleCard}>
                <div className={styles.imageWrapper}>
                  {vehicle.image ? (
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      className={styles.vehicleImage}
                      onError={(e) => {
                        // Fallback if image fails to load
                        console.error("[Fleet] Image load error:", vehicle.image);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: '#1A1A1A', 
                      display: vehicle.image ? 'none' : 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#A0A0A0' 
                    }}
                  >
                    {vehicle.image ? 'Image not available' : 'No Image'}
                  </div>
                </div>
                <div className={styles.content}>
                  {vehicle.category && (
                    <span className={styles.category}>{vehicle.category}</span>
                  )}
                  <h3 className={styles.name}>{vehicle.name}</h3>
                  <div className={styles.specs}>
                    <div className={styles.specItem}>
                      <span>👥</span> {vehicle.passengers || 0}
                    </div>
                    <div className={styles.specItem}>
                      <span>🧳</span> {vehicle.luggage || 0}
                    </div>
                  </div>
                  {vehicle.rate > 0 && (
                    <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "20px", fontWeight: 700, color: "#D4AF37" }}>
                        ${vehicle.rate.toFixed(2)}
                      </span>
                      <span style={{ fontSize: "14px", color: "#9ca3af", marginLeft: "4px" }}>CAD</span>
                    </div>
                  )}
                  {vehicle.description && (
                    <p className={styles.description}>{vehicle.description}</p>
                  )}
                  <button
                    className={`btn-primary ${styles.bookBtn}`}
                    onClick={() => handleBookNow(vehicle.name)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <Reservation
          isModal={true}
          selectedVehicle={selectedVehicle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
