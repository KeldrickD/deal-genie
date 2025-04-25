import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config"; // Import SITE config

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            The AI Operating System <br /> for <span className="text-indigo-600">Real Estate Deals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            {SITE.subtitle} - Analyze properties, generate offers, find buyers, and manage your pipeline, all powered by AI.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">AI-Powered Real Estate Tools</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Deal Analyzer</h3>
              <p className="text-gray-600">Instant ARV, rehab estimates, ROI calculations, and buy/pass recommendations based on your investment strategy.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">Offer Generator</h3>
              <p className="text-gray-600">Auto-create professional offer emails and downloadable deal sheets with a single click.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-2">Smart Scout</h3>
              <p className="text-gray-600">Get alerted to hot markets and emerging opportunities based on ROI potential and market velocity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to analyze your first deal?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Get started for free and analyze up to 5 properties per month. No credit card required.</p>
          <Link href="/signup" className="bg-indigo-600 text-white py-3 px-8 rounded-md font-bold hover:bg-indigo-700 inline-block">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold">🔮 {SITE.name}</span>
              <p className="mt-2 text-gray-400 max-w-xs">
                The AI-powered operating system for real estate investors.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                  <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                  <li><Link href="/roadmap" className="text-gray-400 hover:text-white">Roadmap</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                  <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-8 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
