"use client";
import Link from 'next/link';
import { servicesData } from '@/lib/servicesData';

export default function Services() {
    return (
        <section id="services" className="svc-section">
            <div className="container">
                <div className="svc-header">
                    <span className="sec-subtitle">Premium Offerings</span>
                    <h2 className="sec-title">Tailored Luxury For Every Need</h2>
                </div>

                <div className="svc-grid">
                    {servicesData.map((service) => (
                        <Link key={service.slug} href={`/services/${service.slug}`} className="svc-card">
                            <img src={service.image} alt={service.title} className="svc-card-img" />
                            <div className="svc-card-overlay">
                                <div className="svc-card-icon">{service.icon}</div>
                                <h3 className="svc-card-title">{service.title}</h3>
                                <p className="svc-card-desc">{service.subtitle}</p>
                                <div className="svc-card-rate">{service.startingFrom}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
