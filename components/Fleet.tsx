"use client";
import React, { useState } from 'react';
import styles from './Fleet.module.css';
import Reservation from './Reservation';

const vehicles = [
    {
        name: "Executive Sedans",
        category: "Business Class",
        specs: { passengers: 3, luggage: 3 },
        description: "BMW 7 Series, Lincoln Continental. Reliable. Affordable. Convenient.",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Luxury SUVs",
        category: "Elite Comfort",
        specs: { passengers: 6, luggage: 6 },
        description: "Cadillac Escalade, GMC Yukon XL. Space for up to 6 passengers or extra luggage.",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Tesla Model S",
        category: "Eco-Luxury",
        specs: { passengers: 3, luggage: 3 },
        description: "Zero-emission option at the same airport limo Toronto flat rate. Ride in total comfort with complimentary Wi-Fi.",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop"
    },
    {
        name: "Stretch Limousine",
        category: "Classic Luxury",
        specs: { passengers: 8, luggage: 4 },
        description: "Lincoln Stretch Limo, SUV Stretch Limo. The ultimate statement for any special occasion.",
        image: "https://images.unsplash.com/photo-1511210352396-54a060633c32?q=80&w=2114&auto=format&fit=crop"
    },
    {
        name: "Mercedes Sprinter Van",
        category: "Group Travel",
        specs: { passengers: 14, luggage: 14 },
        description: "Premium group transportation with ample space for 14 passengers and luggage.",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "SUV Stretch Limo XL",
        category: "Party Elite",
        specs: { passengers: 16, luggage: 8 },
        description: "Massive presence and ultra-luxury interior for the biggest occasions and parties.",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5947?q=80&w=2070&auto=format&fit=crop"
    }
];

export default function Fleet() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState('');

    const handleBookNow = (vehicleName: string) => {
        setSelectedVehicle(vehicleName);
        setIsModalOpen(true);
    };

    return (
        <section id="fleet" className={styles.fleet}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Reliable & Clean Vehicles</h2>
                    <p className={styles.sectionLead}>We operate 24/7 all year round, serving our clients in Toronto and rest of Southern Ontario.</p>
                </div>

                <div className={styles.grid}>
                    {vehicles.map((vehicle, index) => (
                        <div key={index} className={styles.vehicleCard}>
                            <div className={styles.imageWrapper}>
                                <img src={vehicle.image} alt={vehicle.name} className={styles.vehicleImage} />
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.name}>{vehicle.name}</h3>
                                <div className={styles.specs}>
                                    <div className={styles.specItem}>
                                        <span>👥</span> {vehicle.specs.passengers} Passengers
                                    </div>
                                    <div className={styles.specItem}>
                                        <span>🧳</span> {vehicle.specs.luggage} Bags
                                    </div>
                                </div>
                                <p className={styles.description}>{vehicle.description}</p>
                                <button
                                    className={`btn-primary ${styles.bookBtn}`}
                                    onClick={() => handleBookNow(vehicle.name)}
                                >
                                    BOOK NOW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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
