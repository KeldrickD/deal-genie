'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, DollarSign, Home, BarChart3 } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';

interface ExitStrategySimulatorProps {
  initialData?: {
    purchasePrice?: number;
    rehabCost?: number;
    arv?: number;
    estimatedRent?: number;
    propertyType?: string;
  };
  onSaveResults?: (results: ExitStrategyResults) => void;
}

interface ExitStrategyResults {
  strategy: string;
  roi: number;
  profitAmount: number;
  timeframe: number;
  cashRequired: number;
  exitPrice: number;
  details: Record<string, any>;
}

export default function ExitStrategySimulator({ initialData, onSaveResults }: ExitStrategySimulatorProps) {
  const { supabase, user } = useAuthContext();
  
  // Common inputs for all strategies
  const [purchasePrice, setPurchasePrice] = useState<number>(initialData?.purchasePrice || 150000);
  const [rehabCost, setRehabCost] = useState<number>(initialData?.rehabCost || 25000);
  const [arv, setArv] = useState<number>(initialData?.arv || 220000);
  const [monthlyRent, setMonthlyRent] = useState<number>(initialData?.estimatedRent || 1500);
  const [propertyType, setPropertyType] = useState<string>(initialData?.propertyType || 'Single Family');
  
  // Flip-specific inputs
  const [holdingCosts, setHoldingCosts] = useState<number>(5000);
  const [sellingCosts, setSellingCosts] = useState<number>(13000);
  const [flipTimeMonths, setFlipTimeMonths] = useState<number>(6);
  
  // BRRRR-specific inputs
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [propertyManagementPercent, setPropertyManagementPercent] = useState<number>(8);
  const [maintenancePercent, setMaintenancePercent] = useState<number>(5);
  const [vacancyPercent, setVacancyPercent] = useState<number>(5);
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(2500);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1200);
  const [appreciationRate, setAppreciationRate] = useState<number>(3);
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(5);
  const [refinanceLtv, setRefinanceLtv] = useState<number>(75);

  // Results state
  const [activeStrategy, setActiveStrategy] = useState<string>('flip');
  const [results, setResults] = useState<ExitStrategyResults | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    activeStrategy, purchasePrice, rehabCost, arv, monthlyRent,
    holdingCosts, sellingCosts, flipTimeMonths, downPaymentPercent,
    interestRate, loanTermYears, propertyManagementPercent, maintenancePercent,
    vacancyPercent, annualPropertyTax, annualInsurance, appreciationRate,
    holdingPeriodYears, refinanceLtv
  ]);
  
  const calculateResults = () => {
    setIsCalculating(true);
    
    let results: ExitStrategyResults;
    
    switch(activeStrategy) {
      case 'flip':
        results = calculateFlipStrategy();
        break;
      case 'brrrr':
        results = calculateBrrrrStrategy();
        break;
      case 'rental':
        results = calculateRentalStrategy();
        break;
      case 'wholesale':
        results = calculateWholesaleStrategy();
        break;
      default:
        results = calculateFlipStrategy();
    }
    
    setResults(results);
    setIsCalculating(false);
  };
  
  const calculateFlipStrategy = (): ExitStrategyResults => {
    const totalInvestment = purchasePrice + rehabCost + holdingCosts;
    const salePrice = arv;
    const netSaleProceeds = salePrice - sellingCosts;
    const profit = netSaleProceeds - totalInvestment;
    const roi = (profit / totalInvestment) * 100;
    
    return {
      strategy: 'Fix and Flip',
      roi: parseFloat(roi.toFixed(2)),
      profitAmount: profit,
      timeframe: flipTimeMonths,
      cashRequired: totalInvestment,
      exitPrice: salePrice,
      details: {
        purchasePrice,
        rehabCost,
        holdingCosts,
        sellingCosts,
        salePrice,
        netSaleProceeds,
        profit,
        roi,
        timeframeMonths: flipTimeMonths,
      }
    };
  };
  
  const calculateBrrrrStrategy = (): ExitStrategyResults => {
    // Initial investment
    const downPayment = (purchasePrice * downPaymentPercent) / 100;
    const initialCash = downPayment + rehabCost;
    
    // Refinance after rehab
    const refinanceAmount = (arv * refinanceLtv) / 100;
    const cashOutAmount = refinanceAmount - purchasePrice;
    const actualCashInvested = initialCash - Math.max(0, cashOutAmount);
    
    // Monthly financials
    const monthlyPI = calculateMonthlyMortgage(refinanceAmount, interestRate, loanTermYears);
    const monthlyPropertyTax = annualPropertyTax / 12;
    const monthlyInsurance = annualInsurance / 12;
    const monthlyVacancy = (monthlyRent * vacancyPercent) / 100;
    const monthlyMaintenance = (monthlyRent * maintenancePercent) / 100;
    const monthlyPropertyManagement = (monthlyRent * propertyManagementPercent) / 100;
    
    const monthlyExpenses = monthlyPI + monthlyPropertyTax + monthlyInsurance + 
                           monthlyVacancy + monthlyMaintenance + monthlyPropertyManagement;
    const monthlyCashFlow = monthlyRent - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // ROI calculation
    const cashOnCashReturn = (annualCashFlow / actualCashInvested) * 100;
    
    // Appreciation
    const exitYear = holdingPeriodYears;
    const exitPrice = arv * Math.pow(1 + (appreciationRate / 100), exitYear);
    const loanBalanceAtExit = calculateLoanBalanceAfterYears(refinanceAmount, interestRate, loanTermYears, exitYear);
    const equityAtExit = exitPrice - loanBalanceAtExit;
    const sellingCostsAtExit = exitPrice * 0.06; // Estimated 6% for selling costs
    const netProceedsAtExit = equityAtExit - sellingCostsAtExit;
    
    // Total ROI including cash flow and appreciation
    const totalCashFlow = annualCashFlow * exitYear;
    const totalProfit = netProceedsAtExit - actualCashInvested + totalCashFlow;
    const totalROI = (totalProfit / actualCashInvested) * 100;
    const annualizedROI = (Math.pow(1 + (totalROI / 100), 1 / exitYear) - 1) * 100;
    
    return {
      strategy: 'BRRRR',
      roi: parseFloat(annualizedROI.toFixed(2)),
      profitAmount: totalProfit,
      timeframe: exitYear * 12, // Convert to months
      cashRequired: actualCashInvested,
      exitPrice: exitPrice,
      details: {
        purchasePrice,
        rehabCost,
        arv,
        downPayment,
        initialCash,
        refinanceAmount,
        cashOutAmount,
        actualCashInvested,
        monthlyRent,
        monthlyExpenses,
        monthlyCashFlow,
        annualCashFlow,
        cashOnCashReturn,
        exitYear,
        exitPrice,
        equityAtExit,
        netProceedsAtExit,
        totalCashFlow,
        totalProfit,
        totalROI,
        annualizedROI
      }
    };
  };
  
  const calculateRentalStrategy = (): ExitStrategyResults => {
    // Initial investment
    const downPayment = (purchasePrice * downPaymentPercent) / 100;
    const closingCosts = purchasePrice * 0.03; // Estimated 3% for closing costs
    const initialInvestment = downPayment + rehabCost + closingCosts;
    
    // Monthly financials
    const loanAmount = purchasePrice - downPayment;
    const monthlyPI = calculateMonthlyMortgage(loanAmount, interestRate, loanTermYears);
    const monthlyPropertyTax = annualPropertyTax / 12;
    const monthlyInsurance = annualInsurance / 12;
    const monthlyVacancy = (monthlyRent * vacancyPercent) / 100;
    const monthlyMaintenance = (monthlyRent * maintenancePercent) / 100;
    const monthlyPropertyManagement = (monthlyRent * propertyManagementPercent) / 100;
    
    const monthlyExpenses = monthlyPI + monthlyPropertyTax + monthlyInsurance + 
                           monthlyVacancy + monthlyMaintenance + monthlyPropertyManagement;
    const monthlyCashFlow = monthlyRent - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // ROI calculation
    const cashOnCashReturn = (annualCashFlow / initialInvestment) * 100;
    
    // Appreciation
    const exitYear = holdingPeriodYears;
    const exitPrice = purchasePrice * Math.pow(1 + (appreciationRate / 100), exitYear);
    const loanBalanceAtExit = calculateLoanBalanceAfterYears(loanAmount, interestRate, loanTermYears, exitYear);
    const equityAtExit = exitPrice - loanBalanceAtExit;
    const sellingCostsAtExit = exitPrice * 0.06; // Estimated 6% for selling costs
    const netProceedsAtExit = equityAtExit - sellingCostsAtExit;
    
    // Total ROI including cash flow and appreciation
    const totalCashFlow = annualCashFlow * exitYear;
    const totalProfit = netProceedsAtExit - initialInvestment + totalCashFlow;
    const totalROI = (totalProfit / initialInvestment) * 100;
    const annualizedROI = (Math.pow(1 + (totalROI / 100), 1 / exitYear) - 1) * 100;
    
    return {
      strategy: 'Buy and Hold Rental',
      roi: parseFloat(annualizedROI.toFixed(2)),
      profitAmount: totalProfit,
      timeframe: exitYear * 12, // Convert to months
      cashRequired: initialInvestment,
      exitPrice: exitPrice,
      details: {
        purchasePrice,
        rehabCost,
        downPayment,
        closingCosts,
        initialInvestment,
        loanAmount,
        monthlyRent,
        monthlyExpenses,
        monthlyCashFlow,
        annualCashFlow,
        cashOnCashReturn,
        exitYear,
        exitPrice,
        equityAtExit,
        netProceedsAtExit,
        totalCashFlow,
        totalProfit,
        totalROI,
        annualizedROI
      }
    };
  };
  
  const calculateWholesaleStrategy = (): ExitStrategyResults => {
    const wholesaleDiscount = 0.7; // 70% rule
    const wholesaleValue = arv * wholesaleDiscount - rehabCost;
    const assignmentFee = Math.min(10000, (wholesaleValue - purchasePrice) * 0.5);
    const profit = assignmentFee;
    const roi = (profit / (purchasePrice * 0.01)) * 100; // 1% earnest money deposit
    
    return {
      strategy: 'Wholesale',
      roi: parseFloat(roi.toFixed(2)),
      profitAmount: profit,
      timeframe: 1, // Typically 1 month or less
      cashRequired: purchasePrice * 0.01, // Earnest money deposit (usually 1%)
      exitPrice: wholesaleValue,
      details: {
        purchasePrice,
        wholesaleValue,
        arv,
        rehabCost,
        assignmentFee,
        earnestMoney: purchasePrice * 0.01,
        profit,
        roi,
        timeframeMonths: 1
      }
    };
  };
  
  // Helper functions
  const calculateMonthlyMortgage = (principal: number, annualRate: number, termYears: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = termYears * 12;
    
    // Calculate monthly payment using the mortgage formula
    const monthlyPayment = 
      principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return monthlyPayment;
  };
  
  const calculateLoanBalanceAfterYears = (
    principal: number, 
    annualRate: number, 
    termYears: number, 
    yearsElapsed: number
  ): number => {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = termYears * 12;
    const monthsElapsed = Math.min(yearsElapsed * 12, totalPayments);
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyMortgage(principal, annualRate, termYears);
    
    // Calculate remaining balance after specified number of years
    let balance = principal;
    
    for (let i = 0; i < monthsElapsed; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
    }
    
    return Math.max(0, balance);
  };
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };
  
  const handleSaveResults = () => {
    if (results && onSaveResults) {
      onSaveResults(results);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Exit Strategy Simulator
        </CardTitle>
        <CardDescription>
          Compare different investment strategies and exit scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeStrategy} onValueChange={setActiveStrategy}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="flip" className="flex-1">Fix & Flip</TabsTrigger>
            <TabsTrigger value="brrrr" className="flex-1">BRRRR</TabsTrigger>
            <TabsTrigger value="rental" className="flex-1">Buy & Hold</TabsTrigger>
            <TabsTrigger value="wholesale" className="flex-1">Wholesale</TabsTrigger>
          </TabsList>
          
          {/* Common inputs for all strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Property Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  placeholder="150000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rehabCost">Rehab Cost</Label>
                <Input
                  id="rehabCost"
                  type="number"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(parseFloat(e.target.value) || 0)}
                  placeholder="25000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arv">After Repair Value (ARV)</Label>
                <Input
                  id="arv"
                  type="number"
                  value={arv}
                  onChange={(e) => setArv(parseFloat(e.target.value) || 0)}
                  placeholder="220000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                  placeholder="1500"
                />
              </div>
            </div>
          
            {/* Strategy-specific inputs */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Strategy Details</h3>
              
              {/* Flip-specific inputs */}
              {activeStrategy === 'flip' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="holdingCosts">Holding Costs</Label>
                    <Input
                      id="holdingCosts"
                      type="number"
                      value={holdingCosts}
                      onChange={(e) => setHoldingCosts(parseFloat(e.target.value) || 0)}
                      placeholder="5000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sellingCosts">Selling Costs</Label>
                    <Input
                      id="sellingCosts"
                      type="number"
                      value={sellingCosts}
                      onChange={(e) => setSellingCosts(parseFloat(e.target.value) || 0)}
                      placeholder="13000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="flipTimeMonths">Time to Flip (Months)</Label>
                    <Input
                      id="flipTimeMonths"
                      type="number"
                      value={flipTimeMonths}
                      onChange={(e) => setFlipTimeMonths(parseFloat(e.target.value) || 0)}
                      placeholder="6"
                    />
                  </div>
                </>
              )}
              
              {/* BRRRR and Rental common inputs */}
              {(activeStrategy === 'brrrr' || activeStrategy === 'rental') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="downPaymentPercent">Down Payment (%)</Label>
                    <Input
                      id="downPaymentPercent"
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                      placeholder="20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.125"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                      placeholder="5.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="holdingPeriodYears">Holding Period (Years)</Label>
                    <Input
                      id="holdingPeriodYears"
                      type="number"
                      value={holdingPeriodYears}
                      onChange={(e) => setHoldingPeriodYears(parseFloat(e.target.value) || 0)}
                      placeholder="5"
                    />
                  </div>
                </>
              )}
              
              {/* BRRRR-specific inputs */}
              {activeStrategy === 'brrrr' && (
                <div className="space-y-2">
                  <Label htmlFor="refinanceLtv">Refinance LTV (%)</Label>
                  <Input
                    id="refinanceLtv"
                    type="number"
                    value={refinanceLtv}
                    onChange={(e) => setRefinanceLtv(parseFloat(e.target.value) || 0)}
                    placeholder="75"
                  />
                </div>
              )}
              
              {/* Wholesale doesn't need extra inputs */}
            </div>
          </div>
          
          {/* Results display */}
          {results && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-4">
                {results.strategy} Results
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Total ROI</p>
                  <p className="text-lg font-bold text-blue-600">{formatPercent(results.roi)}</p>
                </div>
                
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Profit</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(results.profitAmount)}</p>
                </div>
                
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Cash Required</p>
                  <p className="text-lg font-bold">{formatCurrency(results.cashRequired)}</p>
                </div>
                
                <div className="bg-white p-3 rounded-md border shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Timeframe</p>
                  <p className="text-lg font-bold">
                    {results.timeframe < 12 
                      ? `${results.timeframe} months` 
                      : `${(results.timeframe / 12).toFixed(1)} years`}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Strategy-specific details */}
                {activeStrategy === 'flip' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Investment:</span>
                      <span>{formatCurrency(results.details.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sale Price (ARV):</span>
                      <span>{formatCurrency(results.details.salePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Selling Costs:</span>
                      <span>{formatCurrency(results.details.sellingCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Net Sale Proceeds:</span>
                      <span>{formatCurrency(results.details.netSaleProceeds)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Net Profit:</span>
                      <span className="text-green-600">{formatCurrency(results.details.profit)}</span>
                    </div>
                  </div>
                )}
                
                {activeStrategy === 'brrrr' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Initial Cash Invested:</span>
                      <span>{formatCurrency(results.details.initialCash)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Refinance Amount:</span>
                      <span>{formatCurrency(results.details.refinanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cash Out Amount:</span>
                      <span>{formatCurrency(results.details.cashOutAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Actual Cash Invested:</span>
                      <span>{formatCurrency(results.details.actualCashInvested)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Cash Flow:</span>
                      <span className={results.details.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(results.details.monthlyCashFlow)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Exit Price (Year {results.details.exitYear}):</span>
                      <span>{formatCurrency(results.details.exitPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Cash on Cash Return:</span>
                      <span>{formatPercent(results.details.cashOnCashReturn)}</span>
                    </div>
                  </div>
                )}
                
                {activeStrategy === 'rental' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Initial Investment:</span>
                      <span>{formatCurrency(results.details.initialInvestment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Income:</span>
                      <span>{formatCurrency(results.details.monthlyRent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Expenses:</span>
                      <span>{formatCurrency(results.details.monthlyExpenses)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Cash Flow:</span>
                      <span className={results.details.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(results.details.monthlyCashFlow)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Exit Price (Year {results.details.exitYear}):</span>
                      <span>{formatCurrency(results.details.exitPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Cash on Cash Return:</span>
                      <span>{formatPercent(results.details.cashOnCashReturn)}</span>
                    </div>
                  </div>
                )}
                
                {activeStrategy === 'wholesale' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Purchase Contract Price:</span>
                      <span>{formatCurrency(purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>70% of ARV minus Repairs:</span>
                      <span>{formatCurrency(results.details.wholesaleValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Earnest Money Deposit:</span>
                      <span>{formatCurrency(results.details.earnestMoney)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Assignment Fee:</span>
                      <span className="text-green-600">{formatCurrency(results.details.assignmentFee)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={calculateResults}
          disabled={isCalculating}
        >
          Recalculate
        </Button>
        
        {results && onSaveResults && (
          <Button onClick={handleSaveResults}>
            Save Results
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 