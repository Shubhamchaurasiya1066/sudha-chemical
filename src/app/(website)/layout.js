import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function WebsiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      <Navbar />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer />
    </div>
  );
}
