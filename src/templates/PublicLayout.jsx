// templates/PublicLayout.jsx
import Navbar from "@organisms/Navbar";
import Footer from "@organisms/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}