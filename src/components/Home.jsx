import Navbar from "../ui/Navbar";
import Hero from "../ui/Hero";
import Missions from "../ui/Missions";
import Footer from "../ui/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Missions />
      </main>
      <Footer />
    </div>
  );
}