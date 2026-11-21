import ClientsHero from "@/components/clients/ClientsHero";
import ClientsLogoGrid from "@/components/clients/ClientsLogoGrid";
import ContactCTA from "@/components/home/ContactCTA";

export const metadata = {
  title: "Our Clients | Sudha Chemical Company",
  description:
    "Explore organizations listed in Sudha Chemical Company's service history.",
};

export default function ClientsPage() {
  return (
    <>
      <ClientsHero />
      <ClientsLogoGrid />
      <ContactCTA />
    </>
  );
}
