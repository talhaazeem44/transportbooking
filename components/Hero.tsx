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
            Elevate Your <span className={styles.accentText}>Journey</span>
            <br /> Toronto's Elite Chauffeur Service
          </h1>
          <p className={styles.heroSubtitle}>
            Experience unparalleled luxury, punctuality, and comfort with our premium fleet.
            From airport transfers to special events, we redefine sophisticated travel.
          </p>
          <div className={styles.heroActions}>
            <Link href="#book" className={`btn-primary ${styles.heroBtn}`}>Instant Reservation</Link>
            <button className={`btn-outline ${styles.heroBtn}`}>View Our Fleet</button>
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
