import Link from 'next/link';
import { SITE } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{SITE.name}</h3>
            <p className="text-sm text-gray-500">
              {SITE.subtitle}
            </p>
            {/* Optional: Add logo here if desired */}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm text-gray-500 hover:text-gray-900">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link></li>
              {/* Add other product links */}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">About Us</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">Blog</Link></li>
              {/* Add other company links */}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 