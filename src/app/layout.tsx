import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/Navigation';
import Script from 'next/script';
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

// Font configuration
const inter = Inter({ subsets: ['latin'] });

// Metadata for the application
export const metadata: Metadata = {
  title: {
    template: '%s | Deal Genie',
    default: 'Deal Genie',
  },
  description: 'The ultimate real estate investing tool',
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Google tag (gtag.js) */}
      <Script 
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-SBWVL4QB4M"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-SBWVL4QB4M', {
            page_path: window.location.pathname,
          });
          `,
        }}
      />
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            {children}
            <Toaster position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
