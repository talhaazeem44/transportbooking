"use client";
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="hero-text">
          <div className="hero-eyebrow">Toronto's #1 Luxury Transport</div>
          <h1 className="hero-title">
            Flat Rate Limo Ride <span className="hero-accent">To/From Airport</span>
          </h1>
          <p className="hero-subtitle">
            Prompt airport taxi service to/from Toronto, Buffalo and Hamilton Airports.
            Reliable. Affordable. Convenient — available 24/7, 365 days a year.
          </p>
          <div className="hero-badges">
            <span className="hero-badge">✓ No Hidden Fees</span>
            <span className="hero-badge">✓ Free Wi-Fi On Board</span>
            <span className="hero-badge">✓ Flight Tracking</span>
          </div>
          <div className="hero-actions">
            <Link href="#book" className="btn-primary hero-btn">Book Online Now</Link>
            <Link href="#fleet" className="btn-outline hero-btn">View Our Fleet</Link>
          </div>
          <div className="hero-contact">
            <span>Call us 24/7:</span>
            <a href="tel:4166190050" className="hero-phone">(416) 619-0050</a>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">24/7</span>
            <span className="hero-stat-label">Availability</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">100%</span>
            <span className="hero-stat-label">Punctuality</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">50+</span>
            <span className="hero-stat-label">Luxury Vehicles</span>
          </div>
        </div>
      </div>
    </section>
  );
}
