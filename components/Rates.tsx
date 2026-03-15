"use client";
import React, { useState } from 'react';
import styles from './Rates.module.css';
import { ratesData } from '@/lib/ratesData';


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
                                    <th>Taxi Rate</th>
                                    <th>Limo Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRates.length > 0 ? (
                                    filteredRates.map((rate, index) => (
                                        <tr key={index}>
                                            <td className={styles.cityName}>{rate.city}</td>
                                            <td className={styles.rateValue}>{rate.taxi ? `$${rate.taxi}` : 'N/A'}</td>
                                            <td className={styles.rateValue}>{rate.limo ? `$${rate.limo}` : 'N/A'}</td>
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
                        <h4 className={styles.notesTitle}>Important Pricing Information (Effective Feb 2024):</h4>
                        <ul className={styles.notesList}>
                            <li>Rates are for <strong>one-way</strong> travel <strong>per vehicle</strong> to/from Pearson International Airport.</li>
                            <li><strong>407 Tolls:</strong> If requested, applicable toll fees will be added to the fare.</li>
                            <li><strong>Wait Time:</strong> $10.00 for each 10 minutes or part thereof.</li>
                            <li><strong>Multiple Drop-offs:</strong> Additional $15.00 for each passenger dropped off on route.</li>
                            <li><strong>Extra Passenger/Excess Baggage:</strong> A $15.00 surcharge applies to transport more than 4 passengers and/or excess baggage.</li>
                            <li><strong>Outside Zone Rate:</strong> Taxi: $1.90/km, Limo: $2.01/km.</li>
                            <li>All rates are subject to 13% HST (Government Tax).</li>
                        </ul>
                        <p className={styles.lastUpdated}>* Rates are out-of-town tariffs established by the Greater Toronto Airports Authority.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
