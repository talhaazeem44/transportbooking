"use client";

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
    <section className="amen-section">
      <div className="container">
        <div className="amen-header">
          <span className="sec-subtitle">Why Choose Us</span>
          <h2 className="sec-title">Reliable. Affordable. Convenient.</h2>
          <p className="sec-desc">
            Every ride includes premium amenities at no extra charge — because your comfort is our priority.
          </p>
        </div>
        <div className="amen-grid">
          {amenities.map((a, i) => (
            <div key={i} className="amen-card">
              <div className="amen-icon">{a.icon}</div>
              <h3 className="amen-title">{a.title}</h3>
              <p className="amen-desc">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="amen-meet">
          <div className="amen-meet-inner">
            <div className="amen-meet-icon">🤝</div>
            <div>
              <h3 className="amen-meet-title">Meet &amp; Greet Service Available</h3>
              <p className="amen-meet-desc">
                Our driver will meet you inside the airport terminal at the arrivals gate, holding a sign with your name.
                Personalized airport pickup for a seamless arrival experience.
              </p>
            </div>
            <div className="amen-meet-price">+$49</div>
          </div>
        </div>
      </div>
    </section>
  );
}
