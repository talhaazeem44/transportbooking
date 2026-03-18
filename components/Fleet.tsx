"use client";
import { useState, useEffect } from 'react';
import Reservation from './Reservation';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Vehicle {
  id: string;
  name: string;
  category: string;
  image: string;
  passengers: number;
  luggage: number;
  description: string;
  rate: number;
}

export default function Fleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        setVehicles(data.items || []);
      } catch (e) {
        console.error('Failed to load vehicles:', e);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleBookNow = (vehicleName: string) => {
    setSelectedVehicle(vehicleName);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section id="fleet" className="fleet-section">
        <div className="container">
          <div className="fleet-header">
            <span className="sec-subtitle">Our Collection</span>
            <h2 className="sec-title">The Fleet Of Excellence</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading vehicles...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fleet" className="fleet-section">
      <div className="container">
        <div className="fleet-header">
          <span className="sec-subtitle">Our Collection</span>
          <h2 className="sec-title">The Fleet Of Excellence</h2>
        </div>

        {vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No vehicles available at the moment.
          </div>
        ) : (
          <div className="fleet-carousel">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{
                768:  { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {vehicles.map((vehicle) => (
                <SwiperSlide key={vehicle.id}>
                  <div className="fleet-card">
                    <div className="fleet-img-wrap">
                      {vehicle.image ? (
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="fleet-body">
                      {vehicle.category && (
                        <span className="fleet-category">{vehicle.category}</span>
                      )}
                      <h3 className="fleet-name">{vehicle.name}</h3>
                      <div className="fleet-specs">
                        <div className="fleet-spec"><span>👥</span> {vehicle.passengers || 0} pax</div>
                        <div className="fleet-spec"><span>🧳</span> {vehicle.luggage || 0} bags</div>
                      </div>
                      {vehicle.rate > 0 && (
                        <div className="fleet-rate">
                          ${vehicle.rate.toFixed(2)}
                          <span>CAD</span>
                        </div>
                      )}
                      {vehicle.description && (
                        <p className="fleet-desc">{vehicle.description}</p>
                      )}
                      <button
                        className="btn-primary fleet-book-btn"
                        onClick={() => handleBookNow(vehicle.name)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Reservation
          isModal={true}
          selectedVehicle={selectedVehicle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
