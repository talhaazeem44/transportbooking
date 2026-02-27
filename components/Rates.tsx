"use client";
import React, { useState } from 'react';
import styles from './Rates.module.css';

const ratesData = [
    { city: "Toronto (Downtown)", sedan: 60, suv: 95 },
    { city: "Mississauga", sedan: 55, suv: 90 },
    { city: "Brampton", sedan: 60, suv: 95 },
    { city: "Oakville", sedan: 75, suv: 110 },
    { city: "Burlington", sedan: 95, suv: 130 },
    { city: "Hamilton", sedan: 125, suv: 165 },
    { city: "Markham", sedan: 70, suv: 105 },
    { city: "Richmond Hill", sedan: 75, suv: 110 },
    { city: "Vaughan", sedan: 65, suv: 100 },
    { city: "Whitby", sedan: 110, suv: 150 },
    { city: "Oshawa", sedan: 120, suv: 160 },
    { city: "Ajax", sedan: 100, suv: 140 },
    { city: "Pickering", sedan: 90, suv: 130 },
    { city: "Milton", sedan: 85, suv: 120 },
    { city: "Newmarket", sedan: 105, suv: 145 },
    { city: "Aurora", sedan: 95, suv: 135 },
    { city: "Niagara Falls", sedan: 195, suv: 250 },
    { city: "Buffalo Airport", sedan: 225, suv: 295 }
];

export default function Rates() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRates = ratesData.filter(rate =>
        rate.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section id="rates" className={styles.rates}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionSubtitle}>Pricing Transparency</span>
                    <h2 className={styles.sectionTitle}>Flat Rate Estimates</h2>
                    <p className={styles.sectionDesc}>
                        Transparent, competitive rates for airport transfers.
                        Search your city below for an instant estimate to/from Pearson International (YYZ).
                    </p>
                </div>

                <div className={styles.calculatorWrapper}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Enter your city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <span className={styles.searchIcon}>🔍</span>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.ratesTable}>
                            <thead>
                                <tr>
                                    <th>City / Area</th>
                                    <th>Luxury Sedan</th>
                                    <th>Executive SUV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRates.length > 0 ? (
                                    filteredRates.map((rate, index) => (
                                        <tr key={index}>
                                            <td className={styles.cityName}>{rate.city}</td>
                                            <td className={styles.rateValue}>${rate.sedan}</td>
                                            <td className={styles.rateValue}>${rate.suv}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className={styles.noResults}>
                                            No rates found for "{searchTerm}". Please call us for a custom quote.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pricingNotes}>
                        <h4 className={styles.notesTitle}>Important Pricing Information:</h4>
                        <ul className={styles.notesList}>
                            <li>Rates are for <strong>one-way</strong> travel <strong>per vehicle</strong>.</li>
                            <li>Toll Highway 407 ETR: Additional $15.00</li>
                            <li>Child Safety Seats: Additional $15.00 each</li>
                            <li>Extra Stops: $15.00 (within same city)</li>
                            <li>All rates are subject to 5% Fuel Surcharge</li>
                            <li>All rates are subject to 13% HST (Government Tax)</li>
                            <li>Reservations are subject to 15% Driver Gratuity</li>
                        </ul>
                        <p className={styles.lastUpdated}>* Rates are subject to change without notice.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
