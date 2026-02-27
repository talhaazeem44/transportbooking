import Navbar from "@/components/Navbar";
import Rates from "@/components/Rates";
import Footer from "@/components/Footer";
import Reservation from "@/components/Reservation";

export const metadata = {
    title: "Service Rates | Toronto Airport Limousine",
    description: "View our flat-rate estimates for luxury limousine and airport transfer services across the GTA and Southern Ontario.",
};

export default function RatesPage() {
    return (
        <main>
            <Navbar />
            <div style={{ paddingTop: '80px' }}> {/* Adjust for fixed navbar height */}
                <Rates />
            </div>
            <Reservation />
            <Footer />
        </main>
    );
}
