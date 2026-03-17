import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reservation from "@/components/Reservation";
import RateCalculator from "@/components/RateCalculator";

export const metadata = {
    title: "Service Rates | Toronto Airport Limousine",
    description: "View our flat-rate estimates for luxury limousine and airport transfer services across the GTA and Southern Ontario.",
};

export default function RatesPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <RateCalculator />
            </div>
            <div id="reservation-section">
                <Reservation />
            </div>
            <Footer />
        </main>
    );
}
