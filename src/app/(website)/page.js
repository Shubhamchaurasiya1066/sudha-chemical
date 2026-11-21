
import Hero from "@/components/home/Hero";
import AboutPreview from "@/components/home/AboutPreview";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BusinessHighlights from "@/components/home/BusinessHighlights";
import ContactCTA from "@/components/home/ContactCTA";

export const metadata = {
  title: "Sudha Chemical Company | Industrial Chemicals",
  description:
    "Discover industrial chemicals, acids, alkalis and chemical products at Sudha Chemical Company, Gwalior. Contact us for enquiries.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <FeaturedProducts />
      <BusinessHighlights />
      <ContactCTA />
    </>
  );
}
