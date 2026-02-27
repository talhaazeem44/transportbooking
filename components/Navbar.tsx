"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ''}`}>
      <div className={`container ${styles.navContent}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>TORONTO</span>
          <span className={styles.logoAccent}>AIRPORT LIMO</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="#services">Services</Link>
          <Link href="#fleet">Fleet</Link>
          <Link href="/rates">Rates</Link>
          <Link href="#about">About</Link>
          <Link href="#book" className={`btn-primary ${styles.navCta}`}>Book Now</Link>
        </div>
      </div>
    </nav>
  );
}
