import OfferGenerator from "@/components/OfferGenerator";

// Server Component wrapper with metadata 
export const metadata = {
  title: 'Genie Offer Engine | GenieOS',
  description: 'Create professional real estate offers with automated documents and emails',
};

// Simple server component that renders the client OfferGenerator
export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfferGenerator />
    </div>
  );
} 