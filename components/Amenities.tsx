"use client";
import React from 'react';
import styles from './Amenities.module.css';

const amenities = [
  { icon: "📶", title: "Complimentary Wi-Fi", desc: "Stay connected on every ride with high-speed Wi-Fi in all our vehicles." },
  { icon: "💧", title: "Bottled Water", desc: "Refreshing bottled water provided complimentary on all trips." },
  { icon: "🔌", title: "Phone Chargers", desc: "USB and wireless charging available in every vehicle — arrive ready." },
  { icon: "✈️", title: "Flight Tracking", desc: "We monitor your flight in real-time and adjust pickup times automatically." },
  { icon: "💳", title: "Flat Rate Pricing", desc: "No surge pricing. No hidden fees. One transparent flat rate every time." },
  { icon: "🕐", title: "24/7 Service", desc: "Available around the clock, 365 days a year — including holidays." },
];

export default function Amenities() {
  return (
    <section className={styles.amenities}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Why Choose Us</span>
          <h2 className={styles.sectionTitle}>Reliable. Affordable. Convenient.</h2>
          <p className={styles.sectionDesc}>
            Every ride includes premium amenities at no extra charge — because your comfort is our priority.
          </p>
        </div>
        <div className={styles.grid}>
          {amenities.map((a, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{a.icon}</div>
              <h3 className={styles.title}>{a.title}</h3>
              <p className={styles.desc}>{a.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.meetGreet}>
          <div className={styles.meetGreetContent}>
            <div className={styles.meetGreetIcon}>🤝</div>
            <div>
              <h3 className={styles.meetGreetTitle}>Meet &amp; Greet Service Available</h3>
              <p className={styles.meetGreetDesc}>
                Our driver will meet you inside the airport terminal at the arrivals gate, holding a sign with your name.
                Personalized airport pickup for a seamless arrival experience.
              </p>
            </div>
            <div className={styles.meetGreetPrice}>+$49</div>
          </div>
        </div>
      </div>
    </section>
  );
}
