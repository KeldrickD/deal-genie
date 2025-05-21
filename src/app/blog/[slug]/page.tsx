import Link from "next/link";
import { notFound } from "next/navigation";

// Define the type for a blog post
type BlogPost = {
  title: string;
  publishedAt: string;
  content: string;
};

// Define the type for all blog posts
type BlogPosts = {
  [key: string]: BlogPost;
};

// Sample blog posts data - in a real app, this would come from a CMS or database
const posts: BlogPosts = {
  "how-to-instantly-calculate-arv-mao-roi": {
    title: "How to Instantly Calculate ARV, MAO, and ROI — Without Spreadsheets",
    publishedAt: "May 12, 2023",
    content: `
      <h2>Ever felt like you're guessing when analyzing a deal?</h2>
      <p>You're not alone.</p>
      <p>Every investor, at some point, has sat with a calculator in one hand, a Zillow tab in the other, and that creeping feeling that they're either overpaying — or missing a good deal.</p>
      <p>You've probably heard of:</p>
      <ul>
        <li>ARV (After Repair Value)</li>
        <li>MAO (Maximum Allowable Offer)</li>
        <li>ROI (Return on Investment)</li>
      </ul>
      <p>But unless you've built a complex spreadsheet or know every formula by heart, calculating these quickly and accurately can be a challenge.</p>
      <p>This post breaks it all down — and shows you how to automate it with Deal Genie.</p>
      
      <h2>What Is ARV?</h2>
      <p>ARV (After Repair Value) is the estimated value of a property after it has been renovated.</p>
      <p><strong>Formula:</strong></p>
      <pre>ARV = Average of 3-5 comparable recently sold homes (same area, size, style)</pre>
      <p>Getting ARV wrong means overpaying up front — or missing profit on the back end.</p>
      <p>Deal Genie pulls AVM (Automated Valuation Model) data from ATTOM, combines it with local comp logic, and gives you a realistic ARV instantly.</p>
      
      <h2>What Is MAO?</h2>
      <p>MAO (Maximum Allowable Offer) is the most you should pay for a property while still hitting your target profit.</p>
      <p><strong>Standard Formula:</strong></p>
      <pre>MAO = (ARV x 0.70) – Estimated Repairs</pre>
      <p>That 70% rule is flexible. Deal Genie lets you set your own risk tolerance, so your MAO adjusts based on:</p>
      <ul>
        <li>Whether you're flipping, BRRRR-ing, or renting</li>
        <li>How much profit you want</li>
        <li>How aggressive or conservative your approach is</li>
      </ul>
      
      <h2>What Is ROI?</h2>
      <p>ROI (Return on Investment) helps you understand how much you're making relative to your total cash outlay.</p>
      <p><strong>Formula (for flips):</strong></p>
      <pre>ROI = Net Profit / Total Investment</pre>
      <p><strong>Formula (for rentals):</strong></p>
      <pre>Cash-on-Cash ROI = Annual Net Cash Flow / Cash Invested</pre>
      <p>These calculations can get complex fast — especially when you're factoring in holding costs, closing fees, or variable rent rates.</p>
      <p>That's why Deal Genie calculates multiple ROI paths — and even shows you alternative exit strategies side-by-side.</p>
      
      <h2>Do it all instantly with Deal Genie</h2>
      <p>When you enter a property address into Deal Genie:</p>
      <ul>
        <li>✅ It pulls real-time property data via ATTOM</li>
        <li>✅ Calculates ARV using AVM + comp logic</li>
        <li>✅ Estimates repairs using preset or custom tiers</li>
        <li>✅ Auto-calculates MAO using your risk profile</li>
        <li>✅ Shows Cash-on-Cash ROI + Exit Strategy options</li>
        <li>✅ Gives you a Go/No-Go decision based on your criteria</li>
        <li>✅ And… you can instantly generate a deal sheet PDF and offer email</li>
      </ul>
      <p>All in under 30 seconds.</p>
      <p>No spreadsheets. No formulas. No guesswork.</p>
      
      <h2>Here's a Real Example:</h2>
      <p>123 Oak Ave, Atlanta GA</p>
      <ul>
        <li>AVM: $212,000</li>
        <li>Repairs: $27,000</li>
        <li>Your Strategy: Flip</li>
        <li>Your Target ROI: 20%</li>
      </ul>
      <p><strong>Deal Genie Analysis:</strong></p>
      <ul>
        <li>ARV: $212,000</li>
        <li>MAO: $121,400</li>
        <li>Suggested Offer: $120,000</li>
        <li>ROI: 23.6%</li>
        <li>Deal Score: 88/100</li>
        <li>✅ Go</li>
      </ul>
      <p>Click one button → Send offer PDF + email → Done.</p>
      
      <h2>Ready to stop guessing?</h2>
      <p>With Deal Genie, you get expert-level deal analysis in seconds — no spreadsheet mastery required.</p>
      <p>Analyze leads, generate offers, and prioritize deals based on what you care about.</p>
    `
  },
  "deal-killing-red-flags": {
    title: "The 7 Deal-Killing Red Flags You Shouldn't Ignore",
    publishedAt: "April 28, 2023",
    content: `<p>Not all leads are created equal — and chasing the wrong deal can cost you time, money, and reputation.</p>
    <p>This post is coming soon...</p>`
  },
  "build-personal-deal-funnel": {
    title: "How to Build a Personal Deal Funnel That Closes Itself",
    publishedAt: "April 15, 2023",
    content: `<p>Finding deals is one thing — managing them is another.</p>
    <p>This post is coming soon...</p>`
  },
  "find-off-market-properties": {
    title: "5 Ways to Find Off-Market Properties in Any Market",
    publishedAt: "March 30, 2023",
    content: `<p>Discover proven strategies for finding hidden gems that never hit the MLS.</p>
    <p>This post is coming soon...</p>`
  },
  "understanding-comps": {
    title: "Understanding Comps: The Right Way vs. The Zillow Way",
    publishedAt: "March 15, 2023",
    content: `<p>Why relying on public estimates can cost you thousands, and how to run proper comps.</p>
    <p>This post is coming soon...</p>`
  },
  "brrrr-method-beginners-guide": {
    title: "BRRRR Method: A Step-by-Step Guide for Beginners",
    publishedAt: "March 7, 2023",
    content: `<p>Learn the Buy, Rehab, Rent, Refinance, Repeat strategy that's building wealth for investors nationwide.</p>
    <p>This post is coming soon...</p>`
  }
};

// Define metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  
  if (!post) {
    return {
      title: 'Post Not Found | Deal Genie Blog',
    };
  }
  
  return {
    title: `${post.title} | Deal Genie Blog`,
    description: post.title,
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  
  // If the post doesn't exist, return 404
  if (!post) {
    notFound();
  }
  
  return (
    <div className="min-h-screen pb-20">
      {/* Back to Blog Link */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <Link href="/blog" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>
      
      {/* Article Header */}
      <article className="max-w-3xl mx-auto pt-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{post.title}</h1>
        <div className="text-gray-500 mb-8">Published on {post.publishedAt}</div>
        
        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none" 
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      
      {/* CTA Section */}
      <div className="max-w-3xl mx-auto mt-12 px-4">
        <div className="bg-indigo-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Start Free — Get Your First Deal Analyzed Instantly</h2>
          <p className="mb-6">Join thousands of investors using Deal Genie to analyze properties faster and close more deals.</p>
          <Link href="/signup" className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition inline-block">
            Try Deal Genie Free →
          </Link>
        </div>
      </div>
      
      {/* More Posts */}
      <div className="max-w-3xl mx-auto mt-16 px-4">
        <h3 className="text-xl font-bold mb-6">More Articles</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          {Object.entries(posts)
            .filter(([slug]) => slug !== params.slug)
            .slice(0, 2)
            .map(([slug, post]) => (
              <div key={slug} className="bg-white p-5 rounded-lg shadow">
                <h4 className="font-medium mb-1">{post.title}</h4>
                <Link href={`/blog/${slug}`} className="text-indigo-600 hover:underline text-sm">
                  Read article →
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
} 