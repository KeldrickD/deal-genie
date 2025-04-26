'use client'; // Mark as Client Component

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/AuthProvider';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Database } from '@/types/supabase';

// Import UI components individually
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Fix the import path for AI actions
import { generateDealAnalysisAction, generateOfferTermsAction, StructuredAnalysis } from '@/app/ai/actions';
import DealTimelineManager from '@/components/DealTimelineManager';
import DealHistoryViewer from '@/components/DealHistoryViewer';

// UI Components
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Utility imports
import { cn } from '@/lib/utils';

// Icons
import { CalendarIcon, Pencil, Trash, CheckCircle, Circle } from 'lucide-react';

import DealOfferGenerator from './offerGenerator';
import DealAnalysisWrapper from './DealAnalysisWrapper';
import UpgradePromptModal from '@/components/UpgradePromptModal';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { FEATURE_NAMES } from '@/lib/config';

// Type definitions
interface Deadline {
  id: string;
  deal_id: string;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

interface StatusChange {
  id: string;
  deal_id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string;
  note: string | null;
}

interface DealDetailClientProps {
  dealId: string;
  initialDeal: any; // Replace with more specific type if available
}

// Full component implementation
export default function DealDetailClient({ dealId, initialDeal }: DealDetailClientProps) {
  const router = useRouter();
  const [deal, setDeal] = useState(initialDeal);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: deal?.deal_name || '',
    description: deal?.description || '',
    amount: deal?.purchase_price || '',
    status: deal?.status || 'Lead',
  });
  
  // Timeline state
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusChange[]>([]);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    due_date: new Date(),
  });
  const [isAddingDeadline, setIsAddingDeadline] = useState(false);

  // Get supabase client from context
  const { supabase } = useAuthContext();

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [structuredAnalysis, setStructuredAnalysis] = useState<StructuredAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // AI Offer State
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [offerTerms, setOfferTerms] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // For Server Action loading state

  // Use the supabase client from AuthContext instead of creating a new one
  const supabaseClient = supabase;

  const { 
    showUpgradePrompt, 
    promptFeature, 
    closeUpgradePrompt, 
    enforceLimit 
  } = useUsageLimit();

  // Component mounted ref to prevent state updates after unmount
  const isMounted = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      console.log('CLIENT: Component unmounting');
    };
  }, []);

  // Add error handling
  useEffect(() => {
    // Add error listener
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (isMounted.current) {
        console.error('CLIENT ERROR CAUGHT:', { message, source, lineno, colno, error });
        toast.error(`Error: ${message}`);
      }
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };
    
    // Add unhandled rejection listener
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (isMounted.current) {
        console.error('CLIENT UNHANDLED REJECTION:', event.reason);
        toast.error(`Promise Error: ${event.reason}`);
      }
    };
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    console.log('CLIENT: Error handlers installed');
    
    // Cleanup
    return () => {
      window.onerror = originalOnError;
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      console.log('CLIENT: Fetching deal data for dealId:', dealId);
      console.log('CLIENT: Supabase client available:', !!supabaseClient);
      fetchDealData();
    }
  }, [dealId, supabaseClient]);

  const fetchDealData = async () => {
    try {
      if (!supabaseClient || !isMounted.current) {
        console.error('Supabase client is not available or component unmounted');
        if (isMounted.current) {
          toast.error('Authentication error: Unable to access data');
        }
        return;
      }

      console.log('CLIENT: Fetching deadlines and history for deal:', dealId);
      
      try {
        // Fetch deadlines
        const { data: deadlinesData, error: deadlinesError } = await supabaseClient
          .from('deal_deadlines')
          .select('*')
          .eq('deal_id', dealId)
          .order('due_date', { ascending: true });

        if (deadlinesError) {
          if (deadlinesError.code === '404' || deadlinesError.message?.includes('does not exist')) {
            console.log('CLIENT: deal_deadlines table does not exist yet');
            // Set empty deadlines array
            if (isMounted.current) {
              setDeadlines([]);
            }
          } else {
            console.error('Error loading deadlines:', deadlinesError);
            if (isMounted.current) {
              toast.error('Failed to load deadlines');
            }
          }
        } else if (isMounted.current) {
          setDeadlines(deadlinesData || []);
          console.log('CLIENT: Fetched deadlines:', deadlinesData?.length);
        }
      } catch (deadlineError) {
        console.error('Error loading deadlines:', deadlineError);
      }

      try {
        // Fetch status history
        const { data: historyData, error: historyError } = await supabaseClient
          .from('deal_history')
          .select('*')
          .eq('deal_id', dealId)
          .order('changed_at', { ascending: false });

        if (historyError) {
          if (historyError.code === '404' || historyError.message?.includes('does not exist')) {
            console.log('CLIENT: deal_history table does not exist yet');
            // Set empty history array
            if (isMounted.current) {
              setStatusHistory([]);
            }
          } else {
            console.error('Error loading deal history:', historyError);
            if (isMounted.current) {
              toast.error('Failed to load deal history');
            }
          }
        } else if (isMounted.current) {
          setStatusHistory(historyData || []);
          console.log('CLIENT: Fetched history items:', historyData?.length);
        }
      } catch (historyError) {
        console.error('Error loading deal history:', historyError);
      }
      
    } catch (error) {
      console.error('Error fetching deal data:', error);
      if (isMounted.current) {
        toast.error('Failed to load deal timeline data');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDeadline({ ...newDeadline, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (!supabaseClient) {
        console.error('Supabase client is not available');
        toast.error('Authentication error: Unable to save changes');
        return;
      }

      const previousStatus = deal.status;
      const { data, error } = await supabaseClient
        .from('deals')
        .update({
          deal_name: formData.name,
          description: formData.description,
          purchase_price: formData.amount,
          status: formData.status,
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;

      // Record status change if status was updated
      if (previousStatus !== formData.status) {
        await supabaseClient.from('deal_history').insert({
          deal_id: dealId,
          previous_status: previousStatus,
          new_status: formData.status,
          note: `Status changed from ${previousStatus} to ${formData.status}`
        });
      }

      setDeal(data);
      setIsEditing(false);
      toast.success('Deal updated successfully');
      
      // Refresh status history after update
      fetchDealData();
      
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
    }
  };

  const handleAddDeadline = async () => {
    try {
      if (!supabaseClient) {
        console.error('Supabase client is not available');
        toast.error('Authentication error: Unable to add deadline');
        return;
      }

      if (!newDeadline.title || !newDeadline.due_date) {
        toast.error('Title and due date are required');
        return;
      }

      const { data, error } = await supabaseClient
        .from('deal_deadlines')
        .insert({
          deal_id: dealId,
          title: newDeadline.title,
          description: newDeadline.description || null,
          due_date: newDeadline.due_date.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setDeadlines([...deadlines, data]);
      setNewDeadline({
        title: '',
        description: '',
        due_date: new Date(),
      });
      setIsAddingDeadline(false);
      toast.success('Deadline added successfully');
    } catch (error) {
      console.error('Error adding deadline:', error);
      toast.error('Failed to add deadline');
    }
  };

  const toggleDeadlineCompletion = async (deadlineId: string, currentStatus: boolean) => {
    try {
      if (!supabaseClient) {
        console.error('Supabase client is not available');
        toast.error('Authentication error: Unable to update deadline');
        return;
      }

      const { error } = await supabaseClient
        .from('deal_deadlines')
        .update({ completed: !currentStatus })
        .eq('id', deadlineId);

      if (error) throw error;

      // Update local state
      setDeadlines(
        deadlines.map(item => 
          item.id === deadlineId ? { ...item, completed: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update deadline');
    }
  };

  const deleteDeadline = async (deadlineId: string) => {
    try {
      if (!supabaseClient) {
        console.error('Supabase client is not available');
        toast.error('Authentication error: Unable to delete deadline');
        return;
      }

      const { error } = await supabaseClient
        .from('deal_deadlines')
        .delete()
        .eq('id', deadlineId);

      if (error) throw error;

      // Update local state
      setDeadlines(deadlines.filter(item => item.id !== deadlineId));
      
      toast.success('Deadline deleted successfully');
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast.error('Failed to delete deadline');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead': return 'bg-gray-500';
      case 'Prospect': return 'bg-blue-500';
      case 'Researching': return 'bg-orange-500';
      case 'Offer Made': return 'bg-yellow-500';
      case 'Under Contract': return 'bg-green-500';
      case 'Closed': return 'bg-emerald-500';
      case 'Dead': return 'bg-red-500';
      case 'Lost': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Function to trigger AI analysis
  const handleGenerateAnalysis = async () => {
    setAiAnalysis(null); // Clear previous analysis
    setStructuredAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(true);

    startTransition(async () => {
      try {
        // Prepare only the data needed by the action
        const inputData = {
          deal_name: deal.deal_name,
          address: deal.address,
          property_type: deal.property_type,
          purchase_price: deal.purchase_price,
          arv: deal.arv,
          rehab_cost: deal.rehab_cost,
          noi: deal.noi,
          loan_amount: deal.loan_amount,
        };

        const result = await generateDealAnalysisAction(inputData);

        if (result.error) {
          setAnalysisError(result.error);
          toast.error(result.error); // Show toast on error
        } else {
          setAiAnalysis(result.analysis ?? null);
          setStructuredAnalysis(result.structuredAnalysis ?? null);
          toast.success("AI analysis generated!"); // Show toast on success
        }
      } catch (err) {
        console.error("Error calling analysis action:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
        setAnalysisError(errorMsg);
        toast.error(`Failed to generate analysis: ${errorMsg}`);
      } finally {
        setIsAnalyzing(false);
      }
    });
  };

  // Function to trigger AI Offer generation
  const handleGenerateOffer = async () => {
    // Track and enforce usage limit for offer generation
    const limitResult = await enforceLimit(FEATURE_NAMES.OFFER, {
      context: 'deal_offer',
      dealId
    }, { showPrompt: true });
    
    // Only proceed if we haven't hit usage limits
    if (limitResult.success) {
      setIsGeneratingOffer(true);
      
      try {
        if (!structuredAnalysis) {
          toast.error('Please analyze the deal first');
          return;
        }
        
        const inputData = {
          address: deal?.address || '',
          purchase_price: deal?.purchase_price || 0,
          arv: structuredAnalysis.arv,
          rehab_cost: structuredAnalysis.repairCostLow
        };
        
        const result = await generateOfferTermsAction(inputData);
        
        if (result.error) {
          toast.error(result.error);
          setOfferError(result.error);
        } else {
          setOfferTerms(result.offerTerms);
        }
      } catch (error) {
        console.error('Error generating offer terms:', error);
        setOfferError('Failed to generate offer terms');
        toast.error('Failed to generate offer terms');
      } finally {
        setIsGeneratingOffer(false);
      }
    }
  };

  // Calculate values from deal data
  const estimatedGrossProfit = deal?.arv && deal?.purchase_price && deal?.rehab_cost 
    ? deal.arv - deal.purchase_price - deal.rehab_cost 
    : null;
    
  const calculatedCapRate = deal?.noi && deal?.purchase_price && deal.purchase_price !== 0
    ? (deal.noi / deal.purchase_price) * 100
    : null;
    
  const annualDebtService = (() => {
    const loanAmount = deal?.loan_amount;
    const interestRate = deal?.interest_rate;
    const loanTermYears = deal?.loan_term_years;
    
    if (loanAmount && interestRate && loanTermYears && 
        loanAmount > 0 && interestRate > 0 && loanTermYears > 0) {
      const monthlyRate = (interestRate / 100) / 12;
      const numberOfMonths = loanTermYears * 12;
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) 
          / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
          
      return !isNaN(monthlyPayment) ? monthlyPayment * 12 : null;
    }
    return null;
  })();
  
  const preTaxCashFlow = deal?.noi && annualDebtService 
    ? deal.noi - annualDebtService 
    : null;
    
  const totalCashInvested = deal?.purchase_price && deal?.loan_amount && deal?.rehab_cost
    ? (deal.purchase_price - deal.loan_amount) + deal.rehab_cost
    : null;
    
  const cashOnCashReturn = preTaxCashFlow && totalCashInvested && totalCashInvested > 0
    ? (preTaxCashFlow / totalCashInvested) * 100
    : null;
  
  return (
    <div className="container mx-auto p-4">
      {/* Upgrade Modal */}
      {showUpgradePrompt && promptFeature && (
        <UpgradePromptModal
          isOpen={showUpgradePrompt}
          onClose={closeUpgradePrompt}
          feature={promptFeature.feature}
          currentUsage={promptFeature.currentUsage}
          limit={promptFeature.limit}
          featureDisplayName={promptFeature.featureDisplayName}
        />
      )}
      
      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Deal Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="offers">Genie Offer Engine</TabsTrigger>
          <TabsTrigger value="exit-strategy">Exit Strategy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{deal?.deal_name || 'Deal Details'}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              <CardDescription>
                {isEditing ? 'Edit deal information' : `Deal ID: ${dealId}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Deal Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Purchase Price</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Researching">Researching</option>
                      <option value="Offer Made">Offer Made</option>
                      <option value="Under Contract">Under Contract</option>
                      <option value="Closed">Closed</option>
                      <option value="Dead">Dead</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Property Address</h3>
                      <p>{deal?.address || 'No address provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Property Type</h3>
                      <p>{deal?.property_type || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p>{deal?.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium">Purchase Price</h3>
                      <p>{formatCurrency(deal?.purchase_price)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">ARV</h3>
                      <p>{formatCurrency(deal?.arv)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Rehab Cost</h3>
                      <p>{formatCurrency(deal?.rehab_cost)}</p>
                    </div>
                  </div>
                  
                  {estimatedGrossProfit !== null && (
                    <div>
                      <h3 className="font-medium">Estimated Gross Profit</h3>
                      <p className={estimatedGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(estimatedGrossProfit)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <Badge className={`${getStatusColor(deal?.status)}`}>
                      {deal?.status || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Created At</h3>
                    <p>{deal?.created_at ? new Date(deal.created_at).toLocaleString() : 'Unknown'}</p>
                  </div>
                </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <DealTimelineManager deal={deal} supabase={supabaseClient} />
        </TabsContent>

        <TabsContent value="history">
          <DealHistoryViewer deal={deal} supabase={supabaseClient} />
        </TabsContent>
        
        <TabsContent value="analysis">
          <DealAnalysisWrapper
            onAnalyze={handleGenerateAnalysis}
            isAnalyzing={isAnalyzing}
            hasAnalysis={!!structuredAnalysis}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>AI Deal Analysis</CardTitle>
                </div>
                <CardDescription>
                  Get AI insights on this property deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                    <p>Analyzing deal data...</p>
                  </div>
                )}
                
                {structuredAnalysis && (
                  <div className="space-y-6">
                    {/* Analysis Header with Recommendation */}
                    <div className="flex items-center justify-between mb-2 pb-4 border-b">
                      <div className="flex items-center">
                        <div className={`h-4 w-4 rounded-full mr-2 ${
                          structuredAnalysis.recommendation === 'GO' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium">
                          AI recommends: {structuredAnalysis.recommendation}
                        </span>
                      </div>
                      <span className="text-sm">
                        Confidence: {structuredAnalysis.confidenceLevel}%
                      </span>
                    </div>
                    
                    {/* Financial Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Projected Returns</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">ARV</span>
                            <span className="font-medium">{formatCurrency(structuredAnalysis.arv)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Repair Cost</span>
                            <span className="font-medium">{formatCurrency(structuredAnalysis.repairCostLow)} - {formatCurrency(structuredAnalysis.repairCostHigh)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Max Offer</span>
                            <span className="font-medium">{formatCurrency(structuredAnalysis.mao)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Cash-on-Cash ROI</span>
                            <span className="font-medium">{structuredAnalysis.cashOnCashROI}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Deal Potential</h4>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Flip Potential</span>
                              <span className="text-sm font-medium">{structuredAnalysis.flipPotential}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${structuredAnalysis.flipPotential}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Rental Potential</span>
                              <span className="text-sm font-medium">{structuredAnalysis.rentalPotential}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${structuredAnalysis.rentalPotential}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Analysis Reasoning */}
                    <div>
                      <h4 className="font-semibold mb-2">Analysis</h4>
                      <p className="text-gray-700">{structuredAnalysis.reasoning}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button onClick={handleGenerateOffer} className="flex-1" disabled={isGeneratingOffer}>
                        {isGeneratingOffer ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Offer'
                        )}
                      </Button>
                      
                      <Link 
                        href={`/exit-strategy?purchasePrice=${deal?.purchase_price || ''}&rehabCost=${deal?.rehab_cost || ''}&arv=${deal?.arv || ''}&estimatedRent=${(deal?.noi || 0) / 12}&propertyType=${deal?.property_type || ''}`}
                        className="flex-1"
                      >
                        <Button className="w-full" variant="outline">
                          Exit Strategy
                        </Button>
                      </Link>
                    </div>
                    
                    {offerError && (
                      <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                        <p>{offerError}</p>
                      </div>
                    )}
                    
                    {offerTerms && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium mb-2">Generated Offer Terms:</h4>
                        <p className="whitespace-pre-line">{offerTerms}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </DealAnalysisWrapper>
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Genie Offer Engine</CardTitle>
              </div>
              <CardDescription>
                Generate professional offers and documents for this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DealOfferGenerator 
                dealId={dealId} 
                dealData={deal}
                analysisData={structuredAnalysis}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit-strategy">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Exit Strategy Simulator</CardTitle>
              </div>
              <CardDescription>
                Explore different exit strategies for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Simulate different exit strategies for this property based on your data.</p>
                <Link 
                  href={`/exit-strategy?purchasePrice=${deal?.purchase_price || ''}&rehabCost=${deal?.rehab_cost || ''}&arv=${deal?.arv || ''}&estimatedRent=${(deal?.noi || 0) / 12}&propertyType=${deal?.property_type || ''}`}
                  className="inline-block"
                >
                  <Button>
                    Open Exit Strategy Simulator
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}