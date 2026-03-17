"use client";
import React from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay}></div>
      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroTextWrapper}>
          <h1 className={styles.heroTitle}>
            Flat Rate Limo Ride <span className={styles.accentText}>To/From Airport</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Prompt airport taxi service to/from Toronto, Buffalo and Hamilton Airports.
            Reliable. Affordable. Convenient — available 24/7, 365 days a year.
          </p>
          <div className={styles.heroBadges}>
            <span className={styles.badge}>✓ No Hidden Fees</span>
            <span className={styles.badge}>✓ Free Wi-Fi On Board</span>
            <span className={styles.badge}>✓ Flight Tracking</span>
          </div>
          <div className={styles.heroActions}>
            <Link href="#book" className={`btn-primary ${styles.heroBtn}`}>Book Online Now</Link>
            <Link href="#fleet" className={`btn-outline ${styles.heroBtn}`}>View Our Fleet</Link>
          </div>
          <div className={styles.heroContact}>
            <span>Call us 24/7:</span>
            <a href="tel:4166190050" className={styles.heroPhone}>(416) 619-0050</a>
          </div>
        </div>

        <div className={styles.heroFeatures}>
          <div className={styles.featureItem}>
            <span className={styles.featureNumber}>24/7</span>
            <span className={styles.featureLabel}>Availability</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureNumber}>100%</span>
            <span className={styles.featureLabel}>Punctuality</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureNumber}>50+</span>
            <span className={styles.featureLabel}>Luxury Vehicles</span>
          </div>
        </div>
      </div>
    </section>
  );
}
