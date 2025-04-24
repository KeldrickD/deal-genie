import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Think like a top 1% investor. Operate like a full team.
              </h1>
              <p className="text-xl mb-8">
                GenieOS is the AI-powered operating system for real estate investors that helps you analyze deals, generate offers, and scout the best markets.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="bg-white text-indigo-600 py-3 px-6 rounded-md font-bold hover:bg-gray-100">
                  Get Started Free
                </Link>
                <Link href="/demo" className="bg-transparent border-2 border-white text-white py-3 px-6 rounded-md font-bold hover:bg-white/10">
                  Watch Demo
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white rounded-lg shadow-xl p-4 max-w-md">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex items-center mb-2">
                    <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">Genie says BUY</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-2">123 Main Street, Houston TX</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">ARV</p>
                      <p className="font-bold">$265,000</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rehab Cost</p>
                      <p className="font-bold">$35,000-$42,000</p>
                    </div>
                    <div>
                      <p className="text-gray-500">MAO</p>
                      <p className="font-bold">$157,500</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cash-on-Cash ROI</p>
                      <p className="font-bold text-green-600">18.3%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <span className="text-2xl font-bold">🔮 GenieOS</span>
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
            <p>&copy; {new Date().getFullYear()} GenieOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
