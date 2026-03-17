"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { servicesData } from '@/lib/servicesData';

interface Vehicle {
  id: string;
  name: string;
  category?: string;
  image?: string;
  passengers?: number;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load vehicles from API
  useEffect(() => {
    fetch('/api/vehicles')
      .then((r) => r.json())
      .then((data) => setVehicles(data.items || []))
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
      {/* Top contact bar */}
      <div className={styles.topBar}>
        <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', padding: '0.4rem 1.5rem' }}>
          <a href="tel:4166190050" className={styles.topPhone}>
            <span>📞</span> (416) 619-0050
          </a>
          <a href="mailto:reservations@torontoairportlimo.com" className={styles.topEmail}>
            <span>✉</span> reservations@torontoairportlimo.com
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className={`container ${styles.navContent}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>TORONTO</span>
          <span className={styles.logoAccent}>AIRPORT LIMO</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="#services">Services</Link>

          {/* Vehicles dropdown */}
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              className={styles.dropdownTrigger}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
            >
              Vehicles
              <svg
                className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                {vehicles.length === 0 ? (
                  <div className={styles.dropdownEmpty}>Loading...</div>
                ) : (
                  vehicles.map((v) => (
                    <Link
                      key={v.id}
                      href={`/vehicles/${v.id}`}
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {v.image && (
                        <img
                          src={v.image}
                          alt={v.name}
                          style={{ width: 40, height: 28, objectFit: "contain", flexShrink: 0, background: "rgba(0,0,0,0.3)", borderRadius: 3, padding: 2 }}
                        />
                      )}
                      <span>{v.name}</span>
                      {v.passengers ? <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280" }}>{v.passengers} pax</span> : null}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link href="/rates">Rates</Link>
          <Link href="#about">About</Link>
          <Link href="#book" className={`btn-primary ${styles.navCta}`}>Book Now</Link>
        </div>
      </div>
    </nav>
  );
}
