"use client";
import React from 'react';
import Link from 'next/link';
import styles from './Services.module.css';
import { servicesData } from '@/lib/servicesData';

export default function Services() {
    return (
        <section id="services" className={styles.services}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionSubtitle}>Premium Offerings</span>
                    <h2 className={styles.sectionTitle}>Tailored Luxury For Every Need</h2>
                </div>

                <div className={styles.grid}>
                    {servicesData.map((service) => (
                        <Link key={service.slug} href={`/services/${service.slug}`} className={styles.card} style={{ textDecoration: 'none' }}>
                            <img src={service.image} alt={service.title} className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <div className={styles.cardIcon}>{service.icon}</div>
                                <h3 className={styles.cardTitle}>{service.title}</h3>
                                <p className={styles.cardDescription}>{service.subtitle}</p>
                                <div className={styles.cardRate}>{service.startingFrom}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
