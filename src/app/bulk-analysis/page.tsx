import BatchAnalyzer from "@/components/BatchAnalyzer";

// Server Component wrapper with metadata 
export const metadata = {
  title: 'Genie Analyzer | Deal Genie',
  description: 'Analyze multiple properties at once with AI-powered insights',
};

// Simple server component that renders the client BatchAnalyzer
export default function BulkAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BatchAnalyzer />
    </div>
  );
} 