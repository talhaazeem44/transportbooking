"use client";
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="foot-grid">
                    <div>
                        <div className="foot-logo">
                            <span className="foot-logo-text">TORONTO</span>
                            <span className="foot-logo-accent">AIRPORT LIMO</span>
                        </div>
                        <p className="foot-brand-desc">
                            Toronto's premier limousine and chauffeur service. Committed to providing
                            extraordinary travel experiences with our elite fleet and professional staff.
                        </p>
                    </div>

                    <div>
                        <h4 className="foot-col-title">Quick Links</h4>
                        <div className="foot-links">
                            <Link href="#">Home</Link>
                            <Link href="#services">Services</Link>
                            <Link href="#fleet">Our Fleet</Link>
                            <Link href="#book">Reserve Online</Link>
                            <Link href="#about">About Us</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="foot-col-title">Services</h4>
                        <div className="foot-links">
                            <Link href="#">Airport Transfers</Link>
                            <Link href="#">Weddings</Link>
                            <Link href="#">Corporate</Link>
                            <Link href="#">Casino Trips</Link>
                            <Link href="#">Nights Out</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="foot-col-title">Contact Us</h4>
                        <div className="foot-contact-list">
                            <div className="foot-contact-item">
                                <span className="foot-contact-icon">📞</span>
                                <a href="tel:4166190050" className="foot-contact-link">(416) 619-0050</a>
                            </div>
                            <div className="foot-contact-item">
                                <span className="foot-contact-icon">✉️</span>
                                <a href="mailto:reservations@torontoairportlimo.com" className="foot-contact-link">reservations@torontoairportlimo.com</a>
                            </div>
                            <div className="foot-contact-item">
                                <span className="foot-contact-icon">🕒</span>
                                <span>Available 24/7, 365 Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="foot-social-row">
                    <div className="foot-social-links">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="foot-social-link" title="Facebook">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="foot-social-link" title="Twitter/X">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="foot-social-link" title="LinkedIn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="https://www.tripadvisor.com" target="_blank" rel="noopener noreferrer" className="foot-social-link" title="TripAdvisor">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                        </a>
                        <a href="https://www.yelp.com" target="_blank" rel="noopener noreferrer" className="foot-social-link" title="Yelp">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </a>
                    </div>
                    <div className="foot-payment-icons">
                        <span className="foot-payment-icon">VISA</span>
                        <span className="foot-payment-icon">MC</span>
                        <span className="foot-payment-icon">AMEX</span>
                        <span className="foot-payment-icon">PayPal</span>
                    </div>
                </div>

                <div className="foot-bottom">
                    <p>&copy; {new Date().getFullYear()} Toronto Airport Limo. All rights reserved.</p>
                    <div className="foot-bottom-links">
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                        <Link href="#">Site Map</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
