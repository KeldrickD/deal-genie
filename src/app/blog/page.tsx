import Link from "next/link";

// Sample blog posts data
const posts = [
  {
    title: "How to Instantly Calculate ARV, MAO, and ROI — Without Spreadsheets",
    slug: "how-to-instantly-calculate-arv-mao-roi",
    description: "Learn how Deal Genie replaces spreadsheets with instant, accurate analysis.",
  },
  {
    title: "The 7 Deal-Killing Red Flags You Shouldn't Ignore",
    slug: "deal-killing-red-flags",
    description: "Not all leads are created equal — and chasing the wrong deal can cost you time, money, and reputation.",
  },
  {
    title: "How to Build a Personal Deal Funnel That Closes Itself",
    slug: "build-personal-deal-funnel",
    description: "Finding deals is one thing — managing them is another. Create a repeatable system that brings in qualified leads.",
  },
  {
    title: "5 Ways to Find Off-Market Properties in Any Market",
    slug: "find-off-market-properties",
    description: "Discover proven strategies for finding hidden gems that never hit the MLS.",
  },
  {
    title: "Understanding Comps: The Right Way vs. The Zillow Way",
    slug: "understanding-comps",
    description: "Why relying on public estimates can cost you thousands, and how to run proper comps.",
  },
  {
    title: "BRRRR Method: A Step-by-Step Guide for Beginners",
    slug: "brrrr-method-beginners-guide",
    description: "Learn the Buy, Rehab, Rent, Refinance, Repeat strategy that's building wealth for investors nationwide.",
  }
];

export const metadata = {
  title: 'Real Estate Investing Blog | Deal Genie',
  description: 'Expert tips, strategies and insights for real estate investors looking to analyze deals faster and close more properties.',
  openGraph: {
    title: 'Real Estate Investing Blog | Deal Genie',
    description: 'Expert tips, strategies and insights for real estate investors looking to analyze deals faster and close more properties.',
    url: 'https://deal-genie.vercel.app/blog',
    siteName: 'Deal Genie',
    images: [
      {
        url: 'https://deal-genie.vercel.app/blog/arv-mao-roi-calculator.svg',
        width: 1200,
        height: 630,
        alt: 'Deal Genie Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate Investing Blog | Deal Genie',
    description: 'Expert tips, strategies and insights for real estate investors looking to analyze deals faster and close more properties.',
    images: ['https://deal-genie.vercel.app/blog/arv-mao-roi-calculator.svg'],
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center py-12 px-4">
        <h1 className="text-4xl font-bold mb-2">The Deal Genie Blog</h1>
        <p className="text-gray-600 text-lg">
          Real estate insights, deal strategies, and how to get the most out of Deal Genie.
        </p>
      </section>
      
      {/* Featured Post */}
      <article className="max-w-5xl mx-auto mb-12 px-4">
        <div className="bg-indigo-50 p-6 rounded-xl hover:shadow-lg transition">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:flex-1">
              <p className="text-sm text-indigo-600 font-semibold uppercase mb-2">Featured</p>
              <h2 className="text-2xl font-bold mb-1">How to Instantly Calculate ARV, MAO, and ROI</h2>
              <p className="text-gray-700 mb-3">
                Learn how Deal Genie replaces spreadsheets with instant, accurate analysis.
              </p>
              <Link href="/blog/how-to-instantly-calculate-arv-mao-roi" className="text-indigo-600 font-medium hover:underline">
                Read more →
              </Link>
            </div>
            <div className="md:w-1/3">
              <img 
                src="/blog/arv-mao-roi-calculator.svg" 
                alt="How to Calculate ARV, MAO, and ROI" 
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </article>
      
      {/* Blog Grid/List */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="text-indigo-600 font-medium hover:underline">
              Read more →
            </Link>
          </article>
        ))}
      </section>
      
      {/* CTA Banner */}
      <section className="bg-indigo-600 mt-16 py-12 text-white text-center px-4 rounded-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Ready to Close More Deals?</h2>
        <p className="mb-6">Analyze smarter, offer faster, and win more — with Deal Genie.</p>
        <Link href="/signup" className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition inline-block">
          Start Free Trial →
        </Link>
      </section>
    </div>
  );
} 