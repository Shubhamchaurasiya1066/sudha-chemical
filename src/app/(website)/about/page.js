
import AboutHero from "@/components/about/AboutHero";
import CompanyStory from "@/components/about/CompanyStory";
import CompanyDetails from "@/components/about/CompanyDetails";
import TeamSection from "@/components/about/TeamSection";
import CompanyGallery from "@/components/about/CompanyGallery";
import ContactCTA from "@/components/home/ContactCTA";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Sudha Chemical Company, established in 1978 in Gwalior, its history, industrial chemical business, government-sector services and team.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <CompanyStory />
      <CompanyDetails />
      <TeamSection />
      <CompanyGallery />
      <ContactCTA />
    </>
  );
}
