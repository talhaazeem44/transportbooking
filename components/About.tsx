"use client";

export default function About() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about-grid">
                    <div className="about-img-wrap">
                        <img
                            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
                            alt="Professional Chauffeur"
                            className="about-img"
                        />
                    </div>
                    <div>
                        <span className="about-subtitle">Our Legacy</span>
                        <h2 className="about-title">Defining Luxury Travel In Toronto</h2>
                        <p className="about-desc">
                            For over a decade, Toronto Airport Limo has been the premier choice for discerning travelers
                            seeking more than just a ride. We provide a sanctuary of comfort and a standard of
                            professionalism that remains unmatched.
                        </p>
                        <div className="about-features">
                            <div className="about-feature">
                                <div className="about-feature-title">Vetted Chauffeurs</div>
                                <p className="about-feature-desc">Highly trained professionals committed to your safety and discretion.</p>
                            </div>
                            <div className="about-feature">
                                <div className="about-feature-title">Pristine Fleet</div>
                                <p className="about-feature-desc">Latest luxury models, meticulously maintained for every journey.</p>
                            </div>
                            <div className="about-feature">
                                <div className="about-feature-title">Tailored Service</div>
                                <p className="about-feature-desc">From route preferences to on-board amenities, we cater to your requests.</p>
                            </div>
                            <div className="about-feature">
                                <div className="about-feature-title">Global Standards</div>
                                <p className="about-feature-desc">Local expertise with the quality of international luxury standards.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
