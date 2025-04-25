import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Workflow,
  BookOpen,
  Lock,
  Server,
  Cpu,
  Braces,
  Code2,
  Radar,
  FileText,
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Eye,
  Target,
  Gauge,
  Cloud,
  Network
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GenieOS Features – AI Real Estate OS',
  description: 'Discover GenieOS&apos;s AI-powered deal analysis, offer generation, and market insights.',
  openGraph: {
    title: 'GenieOS Features',
    description: 'AI-driven property analyzer, offer engine, Smart Scout & more.',
    url: 'https://your-domain.com/features', // Replace with your actual URL
    // images: [
    //   {
    //     url: '/api/og?page=features',
    //     width: 1200,
    //     height: 630,
    //   },
    // ], // Temporarily commented out
  },
};

export default function FeaturesPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-2">Core Features</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Unlock Your Investment Potential</h1>
        <p className="mt-4 text-lg text-muted-foreground">GenieOS combines AI-powered analysis with intuitive tools to help you make smarter, faster decisions.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* AI Deal Analyzer */}
        <FeatureCard
          icon={BrainCircuit}
          title="AI Deal Analyzer"
          description="Instantly calculate ARV, repair estimates, MAO, and cash-on-cash ROI. GenieOS returns a clear Go/No-Go decision with your personal risk profile baked in."
        />

        {/* Offer Generator */}
        <FeatureCard
          icon={FileText}
          title="Genie Offer Engine"
          description="Auto-generate polished offer emails and downloadable deal-sheet PDFs in one click. Edit on the fly or send directly from your inbox."
        />

        {/* Genie Profile */}
        <FeatureCard
          icon={Target}
          title="Genie Profile"
          description="Genie learns your strategy—flip, BRRRR, or rental—plus your risk tolerance and ROI targets. Every analysis gets smarter and more tailored over time."
        />

        {/* Smart Scout */}
        <FeatureCard
          icon={Radar}
          title="Smart Scout"
          description="Real-time zip-code heatmaps and ROI alerts. Know which markets are heating up before anyone else."
        />

        {/* Dashboard */}
        <FeatureCard
          icon={Gauge}
          title="Investor Dashboard"
          description="Track your deal history, view streaks & XP, and revisit past analyses with a single click."
        />

        {/* GenieNet Coming Soon */}
        <FeatureCard
          icon={Network}
          title="GenieNet (Coming Soon)"
          description="Community-sourced deal flow, live market trends, regional analytics, and secure deal collaboration—powered by the Genie community."
          isComingSoon
        />
      </div>
    </div>
  )
}

// Helper component for feature cards
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isComingSoon?: boolean;
}

function FeatureCard({ icon: Icon, title, description, isComingSoon = false }: FeatureCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 text-primary" />
        {isComingSoon && <Badge variant="secondary">Coming Soon</Badge>}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
} 