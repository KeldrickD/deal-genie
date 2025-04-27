import React from 'react';
import { Metadata } from 'next';
import LeadSearch from '../components/LeadSearch';

export const metadata: Metadata = {
  title: 'Lead Genie Search - Find FSBO Leads',
  description: 'Search for For Sale By Owner leads across multiple sources',
};

export default function LeadGenieSearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Lead Search</h1>
      <p className="text-gray-600 mb-8">Find For Sale By Owner leads across multiple sources</p>
      
      <LeadSearch />
    </div>
  );
}