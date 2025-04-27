import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lead Genie - Find FSBO Leads',
  description: 'Find For Sale By Owner leads across the web',
};

export default function LeadGeniePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Lead Genie</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find For Sale By Owner leads across multiple sources to power your real estate investing business.
        </p>
        
        <div className="bg-white shadow-xl rounded-xl p-8 mb-12">
          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-6">
              <svg className="h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Find Motivated Sellers</h2>
            <p className="text-gray-600 mb-8 text-center max-w-2xl">
              Lead Genie scans multiple sources including Zillow, Craigslist, Facebook Marketplace and more to find For Sale By Owner listings that match your investment criteria.
            </p>
            <Link 
              href="/lead-genie/search" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Start Searching <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Multiple Sources</h3>
            <p className="text-gray-600 text-center">
              Search across Redfin, Craigslist, Facebook Marketplace, and Realtor.com all in one place.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Smart Filters</h3>
            <p className="text-gray-600 text-center">
              Filter by location, price range, days on market, and keywords to find motivated sellers.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Daily Updates</h3>
            <p className="text-gray-600 text-center">
              Get notified of new leads that match your criteria with daily email updates.
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Ready to find your next deal?</h2>
          <p className="text-gray-600 mb-6">
            Start searching for motivated seller leads now and get ahead of the competition.
          </p>
          <Link 
            href="/lead-genie/search" 
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search For Leads <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
} 