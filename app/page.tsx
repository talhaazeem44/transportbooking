import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Amenities from "@/components/Amenities";
import Fleet from "@/components/Fleet";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Reservation from "@/components/Reservation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Amenities />
      <Fleet />
      <About />
      <Testimonials />
      <Reservation />
      <Footer />
    </main>
  );
}
