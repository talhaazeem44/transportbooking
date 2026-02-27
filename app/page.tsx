import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Fleet from "@/components/Fleet";
import Reservation from "@/components/Reservation";
import Footer from "@/components/Footer";
import About from "@/components/About";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <Fleet />
      <Reservation />
      <Footer />
    </main>
  );
}
