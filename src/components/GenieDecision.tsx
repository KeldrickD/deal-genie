'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface GenieDecisionProps {
  decision: 'buy' | 'pass' | 'neutral' | null;
  confidence?: number; // 0-100
  mao?: number | null;
  purchasePrice?: number | null;
  dealScore?: number;
  showDetails?: boolean;
}

export default function GenieDecision({ 
  decision, 
  confidence = 80, 
  mao = null, 
  purchasePrice = null,
  dealScore,
  showDetails = true
}: GenieDecisionProps) {
  
  // Ensure we have a valid decision
  const finalDecision = decision || 'neutral';
  
  // Style based on decision
  const getDecisionStyle = () => {
    switch (finalDecision) {
      case 'buy':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'pass':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };
  
  // Icon based on decision
  const getDecisionIcon = () => {
    switch (finalDecision) {
      case 'buy':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'pass':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    }
  };
  
  // Text based on decision
  const getDecisionText = () => {
    switch (finalDecision) {
      case 'buy':
        return 'Genie says BUY';
      case 'pass':
        return 'Genie says PASS';
      default:
        return 'Genie is NEUTRAL';
    }
  };
  
  // Gauge for confidence level (if available)
  const renderConfidenceGauge = () => {
    if (confidence === undefined) return null;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              confidence >= 80 ? 'bg-green-500' : 
              confidence >= 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Details about the decision (if available)
  const renderDetails = () => {
    if (!showDetails) return null;
    
    // Deal Score Gradient Bar
    const renderDealScoreBar = () => {
      if (dealScore === undefined) return null;
      let color = 'bg-red-500';
      let label = 'Poor';
      if (dealScore >= 81) { color = 'bg-green-500'; label = 'Great'; }
      else if (dealScore >= 61) { color = 'bg-yellow-500'; label = 'Average'; }
      return (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Deal Score</span>
            <span>{dealScore}/100 <span className={`ml-2 font-semibold ${color}`}>{label}</span></span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 relative">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${color}`}
              style={{ width: `${dealScore}%` }}
            ></div>
            {/* Gradient overlay for visual effect */}
            <div className="absolute top-0 left-0 h-2 w-full rounded-full pointer-events-none" style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f59e42 60%, #22c55e 100%)', opacity: 0.3 }}></div>
          </div>
        </div>
      );
    };

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        {mao !== null && (
          <div className="flex justify-between text-sm">
            <span>Maximum Offer:</span>
            <span className="font-medium">${mao.toLocaleString()}</span>
          </div>
        )}
        
        {purchasePrice !== null && mao !== null && (
          <div className="flex justify-between text-sm">
            <span>Price vs. MAO:</span>
            <span className={`font-medium ${purchasePrice <= mao ? 'text-green-600' : 'text-red-600'}`}>
              {purchasePrice <= mao 
                ? `$${(mao - purchasePrice).toLocaleString()} under MAO` 
                : `$${(purchasePrice - mao).toLocaleString()} over MAO`}
            </span>
          </div>
        )}
        {renderDealScoreBar()}
      </div>
    );
  };
  
  return (
    <Card className={`overflow-hidden border ${getDecisionStyle()}`}>
      <CardContent className="p-4">
        <div className="flex items-center">
          {getDecisionIcon()}
          <h3 className="ml-2 text-lg font-bold">{getDecisionText()}</h3>
        </div>
        
        {renderConfidenceGauge()}
        {renderDetails()}
      </CardContent>
    </Card>
  );
} 