"use client";
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <span className={styles.logoText}>TORONTO</span>
                            <span className={styles.logoAccent}>AIRPORT LIMO</span>
                        </div>
                        <p className={styles.brandDesc}>
                            Toronto's premier limousine and chauffeur service. Committed to providing
                            extraordinary travel experiences with our elite fleet and professional staff.
                        </p>
                    </div>

                    <div>
                        <h4 className={styles.colTitle}>Quick Links</h4>
                        <div className={styles.links}>
                            <Link href="#">Home</Link>
                            <Link href="#services">Services</Link>
                            <Link href="#fleet">Our Fleet</Link>
                            <Link href="#book">Reserve Online</Link>
                            <Link href="#about">About Us</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.colTitle}>Services</h4>
                        <div className={styles.links}>
                            <Link href="#">Airport Transfers</Link>
                            <Link href="#">Weddings</Link>
                            <Link href="#">Corporate</Link>
                            <Link href="#">Casino Trips</Link>
                            <Link href="#">Nights Out</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.colTitle}>Contact Us</h4>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <span className={styles.icon}>📞</span>
                                <a href="tel:4166190050" className={styles.contactLink}>(416) 619-0050</a>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.icon}>✉️</span>
                                <a href="mailto:reservations@torontoairportlimo.com" className={styles.contactLink}>reservations@torontoairportlimo.com</a>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.icon}>🕒</span>
                                <span>Available 24/7, 365 Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.socialRow}>
                    <div className={styles.socialLinks}>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Twitter/X">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="https://www.tripadvisor.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="TripAdvisor">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path fill="none" stroke="#000" strokeWidth="2" d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0"/></svg>
                        </a>
                        <a href="https://www.yelp.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Yelp">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </a>
                        <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Pinterest">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                        </a>
                    </div>
                    <div className={styles.paymentIcons}>
                        <span className={styles.paymentIcon}>VISA</span>
                        <span className={styles.paymentIcon}>MC</span>
                        <span className={styles.paymentIcon}>AMEX</span>
                        <span className={styles.paymentIcon}>PayPal</span>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Toronto Airport Limo. All rights reserved.</p>
                    <div className={styles.links} style={{ flexDirection: 'row', gap: '2rem' }}>
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                        <Link href="#">Site Map</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
