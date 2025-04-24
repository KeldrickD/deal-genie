'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AnalysisResultProps {
  analysis: {
    arv: number;
    repairCostLow: number;
    repairCostHigh: number;
    cashOnCashROI: number;
    flipPotential: number;
    rentalPotential: number;
    mao: number;
    recommendation: 'GO' | 'NO_GO';
    reasoning: string;
    confidenceLevel: number;
    _timestamp: string;
  };
  propertyAddress: string;
}

export default function AnalysisResult({ analysis, propertyAddress }: AnalysisResultProps) {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState(analysis.mao.toString());
  const [sellerEmail, setSellerEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [offerSent, setOfferSent] = useState(false);

  const handleGenerateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // This would send the actual request in production
      // await fetch('/api/offer', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     propertyAnalysis: { ...analysis, propertyAddress },
      //     offerAmount: parseInt(offerAmount, 10),
      //     sellerContact: { email: sellerEmail },
      //   }),
      // });

      // Simulating a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOfferSent(true);
    } catch (error) {
      console.error('Error sending offer:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <div className={`h-4 w-4 rounded-full mr-2 ${analysis.recommendation === 'GO' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            Genie says {analysis.recommendation === 'GO' ? 'BUY' : 'PASS'}
          </span>
          <span className="ml-auto text-sm text-gray-500">
            Confidence: {analysis.confidenceLevel}%
          </span>
        </div>
        <h3 className="font-bold text-gray-800 text-xl mb-1">{propertyAddress}</h3>
        <p className="text-sm text-gray-500">
          Analysis completed on {new Date(analysis._timestamp).toLocaleDateString()}
        </p>
      </div>
      
      {/* Analysis Results */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-500">ARV</p>
            <p className="font-bold text-lg">{formatCurrency(analysis.arv)}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-500">Rehab Cost</p>
            <p className="font-bold text-lg">{formatCurrency(analysis.repairCostLow)} - {formatCurrency(analysis.repairCostHigh)}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-500">MAO</p>
            <p className="font-bold text-lg">{formatCurrency(analysis.mao)}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-500">Cash-on-Cash ROI</p>
            <p className="font-bold text-lg text-green-600">{analysis.cashOnCashROI}%</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Deal Potential</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Flip Potential</span>
                <span className="text-sm font-medium">{analysis.flipPotential}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${analysis.flipPotential}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Rental Potential</span>
                <span className="text-sm font-medium">{analysis.rentalPotential}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${analysis.rentalPotential}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Analysis</h4>
          <p className="text-gray-700">{analysis.reasoning}</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {!showOfferForm && !offerSent && (
            <button 
              onClick={() => setShowOfferForm(true)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700"
            >
              Generate Offer
            </button>
          )}
          <Link 
            href="/dashboard"
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Offer Form */}
      {showOfferForm && !offerSent && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h4 className="font-semibold mb-4">Generate Offer</h4>
          <form onSubmit={handleGenerateOffer}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Amount
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="offerAmount"
                    id="offerAmount"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Seller Email
                </label>
                <input
                  type="email"
                  name="sellerEmail"
                  id="sellerEmail"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="seller@example.com"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowOfferForm(false)}
                className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={isSending}
              >
                {isSending ? 'Generating...' : 'Send Offer'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Offer Sent Confirmation */}
      {offerSent && (
        <div className="p-6 bg-green-50 border-t border-green-200">
          <div className="flex items-center mb-4">
            <svg 
              className="h-6 w-6 text-green-500 mr-2"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="font-semibold text-green-800">Offer Generated Successfully!</h4>
          </div>
          <p className="text-green-700 mb-4">
            Your offer of {formatCurrency(parseInt(offerAmount, 10))} for {propertyAddress} has been generated.
          </p>
          <div className="flex gap-4">
            <button 
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50"
            >
              Download PDF
            </button>
            <button 
              className="bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700"
            >
              View Offer Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 