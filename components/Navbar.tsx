"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileVehiclesOpen, setMobileVehiclesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((r) => r.json())
      .then((data) => setVehicles(data.items || []))
      .catch(() => {});
  }, []);

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
    <nav className={`nav-wrap${isScrolled ? ' scrolled' : ''}`}>
      {/* Top contact bar */}
      <div className="nav-topbar">
        <div className="container">
          <a href="tel:4166190050" className="nav-top-link">
            <span>📞</span> (416) 619-0050
          </a>
          <a href="mailto:reservations@torontoairportlimo.com" className="nav-top-link">
            <span>✉</span> reservations@torontoairportlimo.com
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="nav-main">
        <div className="container nav-content">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-text">TORONTO</span>
            <span className="nav-logo-accent">AIRPORT LIMO</span>
          </Link>

          <div className="nav-links">
            <Link href="#services">Services</Link>

            {/* Vehicles dropdown */}
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className="nav-dropdown-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
              >
                Vehicles
                <svg
                  className={`nav-chevron${dropdownOpen ? ' open' : ''}`}
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown-menu">
                  {vehicles.length === 0 ? (
                    <div className="nav-dropdown-empty">Loading...</div>
                  ) : (
                    vehicles.map((v) => (
                      <Link
                        key={v.id}
                        href={`/vehicles/${v.id}`}
                        className="nav-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {v.image && (
                          <img
                            src={v.image}
                            alt={v.name}
                            style={{ width: 40, height: 28, objectFit: 'contain', flexShrink: 0, background: 'rgba(0,0,0,0.05)', borderRadius: 3, padding: 2 }}
                          />
                        )}
                        <span>{v.name}</span>
                        {v.passengers ? <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>{v.passengers} pax</span> : null}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link href="/rates">Rates</Link>
            <Link href="#about">About</Link>
            <Link href="#book" className="btn-primary nav-cta">Book Now</Link>
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu">
          <Link href="#services" onClick={() => setMobileOpen(false)}>Services</Link>
          <button onClick={() => setMobileVehiclesOpen((p) => !p)}>
            Vehicles {mobileVehiclesOpen ? '▲' : '▼'}
          </button>
          {mobileVehiclesOpen && (
            <div className="nav-mobile-sub">
              {vehicles.map((v) => (
                <Link key={v.id} href={`/vehicles/${v.id}`} onClick={() => setMobileOpen(false)}>
                  {v.name}
                </Link>
              ))}
            </div>
          )}
          <Link href="/rates" onClick={() => setMobileOpen(false)}>Rates</Link>
          <Link href="#about" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="#book" onClick={() => setMobileOpen(false)}>Book Now</Link>
        </div>
      )}
    </nav>
  );
}
