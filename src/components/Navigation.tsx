'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useFeatureFlags } from '@/lib/featureFlags';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { enableGenieNet } = useFeatureFlags();

  // Handle redirects based on auth state
  useEffect(() => {
    // Skip redirect if already redirecting
    if (isRedirecting) return;
    
    // Skip if we've already redirected in this session
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('auth-redirecting')) {
      console.log('Skipping redirect - already in progress');
      return;
    }
    
    // Extract the current path
    const currentPath = pathname || '';
    
    // If signed in and on login/signup page, redirect to dashboard
    if (isAuthenticated && 
        (currentPath === '/login' || currentPath === '/signup') && 
        !currentPath.includes('/dashboard')) {
      
      console.log('Signed in user on login page, redirecting to dashboard once');
      // Use state-based redirect to prevent loops
      if (typeof window !== 'undefined') {
        setIsRedirecting(true);
        window.sessionStorage.setItem('auth-redirecting', 'true');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    }
    
    // If signed out and on protected page, redirect to login
    if (!authLoading && 
        !isAuthenticated && 
        (currentPath.startsWith('/dashboard') || 
         currentPath.startsWith('/analyze') || 
         currentPath.startsWith('/profile'))) {
      
      console.log('Unauthenticated user on protected page, redirecting to login');
      if (typeof window !== 'undefined') {
        setIsRedirecting(true);
        window.sessionStorage.setItem('auth-redirecting', 'true');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
  }, [isAuthenticated, authLoading, pathname, isRedirecting]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">🔮 GenieOS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <a
                  href="/dashboard"
                  className={`text-gray-600 hover:text-indigo-600 ${isActive('/dashboard') ? 'text-indigo-600 font-medium' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to dashboard');
                    window.location.href = '/dashboard';
                  }}
                >
                  Dashboard
                </a>
                <a
                  href="/bulk-analysis"
                  className={`text-gray-600 hover:text-indigo-600 ${isActive('/bulk-analysis') ? 'text-indigo-600 font-medium' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to bulk analysis');
                    window.location.href = '/bulk-analysis';
                  }}
                >
                  Genie Analyzer
                </a>
                <a
                  href="/offers"
                  className={`text-gray-600 hover:text-indigo-600 ${isActive('/offers') ? 'text-indigo-600 font-medium' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to offers');
                    window.location.href = '/offers';
                  }}
                >
                  Genie Offer Engine
                </a>
                <a
                  href="/smart-scout"
                  className={`text-gray-600 hover:text-indigo-600 ${isActive('/smart-scout') ? 'text-indigo-600 font-medium' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to smart scout');
                    window.location.href = '/smart-scout';
                  }}
                >
                  Smart Scout
                </a>
                <a
                  href="/exit-strategy"
                  className={`text-gray-600 hover:text-indigo-600 ${isActive('/exit-strategy') ? 'text-indigo-600 font-medium' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to exit strategy simulator');
                    window.location.href = '/exit-strategy';
                  }}
                >
                  Exit Strategy
                </a>
                <a
                  href="/genie-net"
                  className={`text-gray-600 hover:text-indigo-600 ${isActive('/genie-net') ? 'text-indigo-600 font-medium' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to genie-net');
                    window.location.href = '/genie-net';
                  }}
                >
                  {enableGenieNet ? 'GenieNet' : (
                    <span className="flex items-center">
                      GenieNet
                      <span className="ml-1.5 text-xs py-0.5 px-1.5 bg-amber-100 text-amber-800 rounded-full">Soon</span>
                    </span>
                  )}
                </a>
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center text-gray-700 focus:outline-none"
                  >
                    <span className="mr-2">{user?.user_metadata?.name || user?.email}</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center">
                      <span className="text-indigo-700 font-semibold">
                        {(user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={(e) => {
                          e.preventDefault();
                          setProfileDropdownOpen(false);
                          console.log('Navigating to profile');
                          window.location.href = '/profile';
                        }}
                      >
                        Profile
                      </a>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/features" className="text-gray-600 hover:text-indigo-600">Features</Link>
                <Link href="/pricing" className="text-gray-600 hover:text-indigo-600">Pricing</Link>
                <Link href="/about" className="text-gray-600 hover:text-indigo-600">About</Link>
                {!authLoading && (
                  <>
                    <Link href="/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
                    <Link href="/signup" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <a
                    href="/dashboard"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/dashboard') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to dashboard');
                      window.location.href = '/dashboard';
                    }}
                  >
                    Dashboard
                  </a>
                  <a
                    href="/bulk-analysis"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/bulk-analysis') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to bulk analysis');
                      window.location.href = '/bulk-analysis';
                    }}
                  >
                    Genie Analyzer
                  </a>
                  <a
                    href="/offers"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/offers') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to offers');
                      window.location.href = '/offers';
                    }}
                  >
                    Genie Offer Engine
                  </a>
                  <a
                    href="/smart-scout"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/smart-scout') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to smart scout');
                      window.location.href = '/smart-scout';
                    }}
                  >
                    Smart Scout
                  </a>
                  <a
                    href="/exit-strategy"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/exit-strategy') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to exit strategy simulator');
                      window.location.href = '/exit-strategy';
                    }}
                  >
                    Exit Strategy
                  </a>
                  <a
                    href="/genie-net"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/genie-net') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to genie-net');
                      window.location.href = '/genie-net';
                    }}
                  >
                    {enableGenieNet ? 'GenieNet' : (
                      <span className="flex items-center">
                        GenieNet
                        <span className="ml-1.5 text-xs py-0.5 px-1.5 bg-amber-100 text-amber-800 rounded-full">Soon</span>
                      </span>
                    )}
                  </a>
                  <a
                    href="/profile"
                    className={`text-gray-600 hover:text-indigo-600 ${isActive('/profile') ? 'text-indigo-600 font-medium' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      console.log('Mobile: Navigating to profile');
                      window.location.href = '/profile';
                    }}
                  >
                    Profile
                  </a>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-left text-gray-600 hover:text-indigo-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/features"
                    className="text-gray-600 hover:text-indigo-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-indigo-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-indigo-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  {!authLoading && (
                    <>
                      <Link
                        href="/login"
                        className="text-gray-600 hover:text-indigo-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 