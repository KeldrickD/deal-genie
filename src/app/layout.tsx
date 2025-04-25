import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import Navigation from '@/components/Navigation';
import Script from 'next/script';

// Font configuration
const inter = Inter({ subsets: ['latin'] });

// Metadata for the application
export const metadata: Metadata = {
  title: 'Deal Genie - AI-Powered Real Estate Investment Platform',
  description: 'Deal Genie helps real estate investors analyze deals, generate offers, and scout the best markets with AI.',
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Google tag (gtag.js) */}
      <Script 
        strategy="afterInteractive" 
        src="https://www.googletagmanager.com/gtag/js?id=G-3EN5LZDVHV"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3EN5LZDVHV');
          `,
        }}
      />
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
