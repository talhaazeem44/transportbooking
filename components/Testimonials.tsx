"use client";

const testimonials = [
  {
    name: "Sarah M.",
    source: "Google",
    rating: 5,
    text: "Absolutely the best limo service in Toronto! The driver was on time, the car was spotless, and the ride to Pearson was so smooth. Will definitely book again for every trip!",
    avatar: "S",
  },
  {
    name: "James K.",
    source: "Yelp",
    rating: 5,
    text: "The best service EVER!!!!! I've used Toronto Airport Limo multiple times for corporate travel. Always professional, always on time. They track my flight and adjust if there are delays. Highly recommend.",
    avatar: "J",
  },
  {
    name: "Angela T.",
    source: "Facebook",
    rating: 5,
    text: "Booked for our wedding and it was perfect. The stretch limo arrived early, the driver was incredibly courteous, and the car was beautifully presented. Made our special day even more memorable.",
    avatar: "A",
  },
  {
    name: "David R.",
    source: "Google",
    rating: 5,
    text: "Used them for a trip to Hamilton Airport. Flat rate, no surprises. The driver waited for us when our flight was delayed without any extra charge. Complimentary water and Wi-Fi too — amazing value.",
    avatar: "D",
  },
];

const sourceIcons: Record<string, string> = {
  Google: "🔍",
  Yelp: "⭐",
  Facebook: "👍",
};

export default function Testimonials() {
  return (
    <section className="test-section">
      <div className="container">
        <div className="test-header">
          <span className="sec-subtitle">What Our Clients Say</span>
          <h2 className="sec-title">Trusted By Thousands of Travellers</h2>
        </div>
        <div className="test-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="test-card">
              <div className="test-top">
                <div className="test-avatar">{t.avatar}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-source">
                    <span>{sourceIcons[t.source]}</span> {t.source}
                  </div>
                </div>
                <div className="test-stars">{"★".repeat(t.rating)}</div>
              </div>
              <p className="test-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
