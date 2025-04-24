// User profile types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  investmentStrategy: InvestmentStrategy;
  riskTolerance: RiskTolerance;
  returnExpectations: ReturnExpectations;
  createdAt: string;
  updatedAt: string;
}

export type InvestmentStrategy = 'FLIP' | 'BRRRR' | 'RENTAL';
export type RiskTolerance = 'LOW' | 'MEDIUM' | 'HIGH';
export type ReturnExpectations = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

// Property analysis types
export interface PropertyAnalysis {
  id: string;
  propertyAddress: string;
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
  createdAt: string;
  userId: string;
}

// Offer types
export interface Offer {
  id: string;
  propertyAnalysisId: string;
  offerAmount: number;
  offerEmail: string;
  pdfUrl?: string;
  sentAt?: string;
  createdAt: string;
  userId: string;
}

// Smart Scout types
export interface ZipCodeAnalysis {
  zipCode: string;
  averageROI: number;
  averageDaysOnMarket: number;
  priceDropPercentage: number;
  dealVolume: number;
  recommendation: 'HOT' | 'WARM' | 'COLD';
  updatedAt: string;
} 