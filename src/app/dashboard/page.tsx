'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SupabaseClient } from '@supabase/supabase-js';
import { useAuthContext } from '@/components/AuthProvider';
// Import necessary UI components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Trash2 } from 'lucide-react'; // For alert icon and Trash2 icon
// Remove direct imports for createClient and env vars
// import { createClient } from '@supabase/supabase-js';
// import { Database } from '@/types/supabase'; 
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
import { type User } from '@supabase/supabase-js'; // Keep User type if needed
import { type Database } from '@/types/supabase'; // Keep Database type
// Import the new form component
import AddDealForm from '@/components/AddDealForm'; 
// Import the edit form
import EditDealForm from '@/components/EditDealForm'; 
import Link from 'next/link'; // Import Link
import { toast } from 'sonner'; // Import toast
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DEAL_STATUSES } from '@/lib/constants';
// Add import for DealPipeline component
import DealPipeline from '@/components/DealPipeline';
// Add an import for PipelineFilters
import PipelineFilters, { PipelineFilters as PipelineFiltersType } from '@/components/PipelineFilters';
import LeadImporter from '@/components/LeadImporter';
import XpSystem from '@/components/XpSystem';
import UpgradePrompt from '@/components/UpgradePrompt';
import GenieDecision from '@/components/GenieDecision'; 
import TrialBanner from '@/components/TrialBanner';
import MobileOptimizedDashboard from '@/components/MobileOptimizedDashboard';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import SocialProofWidget from '@/components/SocialProofWidget';
import XPProgressCard from '@/components/XPProgressCard';
import ReferralWidget from '@/components/ReferralWidget';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";

// Define types for Profile and Deal based on your src/types/supabase.ts
type Profile = Database['public']['Tables']['profiles']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

// Add this interface at the top of the file, near other type definitions:
interface AnalysisData {
  recommendation?: string;
  mao?: number;
  deal_score?: number;
  confidence?: number;
  arv?: number;
  repair_cost_low?: number;
  repair_cost_high?: number;
  cash_on_cash_roi?: number;
  reasoning?: string;
}

// Helper functions for formatting
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Helper function to get status styles
const getStatusStyle = (status: string | null | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status) {
    case 'Lead': return 'bg-blue-100 text-blue-800';
    case 'Analyzing': return 'bg-yellow-100 text-yellow-800';
    case 'Negotiating': return 'bg-purple-100 text-purple-800';
    case 'Contracted': return 'bg-green-100 text-green-800';
    case 'Closed': return 'bg-gray-100 text-gray-800';
    case 'Dead': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Create a client component to handle the query params
function DashboardViewSwitcher({ onViewChange }: { onViewChange: (view: 'classic' | 'genie2') => void }) {
  // This needs to be in its own component since useSearchParams() must be
  // used in a component wrapped with Suspense
  const searchParams = useSearchParams();
  
  // Get the view from URL query parameter if present
  const viewParam = searchParams.get('view');
  
  useEffect(() => {
    // Set the view based on the URL parameter
    if (viewParam === 'genie2') {
      onViewChange('genie2');
    }
  }, [viewParam, onViewChange]);
  
  return null; // This component doesn't render anything
}

export default function Dashboard() {
  // Get supabase instance from context
  const { user, session, loading: authLoading, supabase, isAuthenticated, signOut } = useAuthContext(); 
  const router = useRouter(); // Get router instance
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pageStatus, setPageStatus] = useState<'loading_auth' | 'loading_data' | 'error' | 'loaded'>('loading_auth');
  const [error, setError] = useState<string | null>(null);
  
  // State for views
  const [dashboardView, setDashboardView] = useState<'classic' | 'genie2'>('classic');
  const [genie2AnnouncementDismissed, setGenie2AnnouncementDismissed] = useState(false);
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // State for tracking which deal is being edited
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  // Add state for delete operation
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Add state for status filter
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');

  // Add state for pipeline filters
  const [pipelineFilters, setPipelineFilters] = useState<PipelineFiltersType>({
    searchTerm: '',
    propertyType: '',
    priceMin: null,
    priceMax: null
  });

  // Add a new state for usage tracking
  const [usageData, setUsageData] = useState({
    analyses: { current: 0, limit: 5 },
    offers: { current: 0, limit: 3 },
    imports: { current: 0, limit: 10 }
  });

  // Add a new state for Lead Importer
  const [showLeadImporter, setShowLeadImporter] = useState(false);

  useEffect(() => {
    // console.log('Dashboard page - Auth context state:', { isAuthenticated, authLoading, user: user?.email });
    if (!authLoading && !isAuthenticated) {
      // Redirect handled by the effect below
    } else if (!authLoading && isAuthenticated) {
      // Data loading is handled by the dedicated effect below
    } else {
      setPageStatus('loading_auth');
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // console.log('[Dashboard] User is not authenticated (detected post-load/sign-out). Redirecting to /login...');
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Function to load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!supabase || !user) { 
      // console.log('[Dashboard] Skipping data load: Auth not ready or user not authenticated.', { supabase: !!supabase, user: !!user });
      if (!authLoading) {
           console.error('[Dashboard] Attempted to load data while unauthenticated after auth check.'); // Keep
           setPageStatus('error');
           setError('Authentication context not available for data loading.');
      }
      return;
    }

    // console.log('[Dashboard] Auth ready. Starting data load...');
    setPageStatus('loading_data');
    setError(null);

    try {
      // console.log(`Loading dashboard data for user: ${user.email}`);
      const typedSupabase = supabase as SupabaseClient<Database>; 

      // Fetch profile and deals in parallel for potential speed up
      const [profileResult, dealsResult] = await Promise.all([
        typedSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        typedSupabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      const { data: profileData, error: profileError } = profileResult;
      const { data: dealsData, error: dealsError } = dealsResult;

      if (profileError) {
        console.error('[Dashboard] Error fetching profile:', profileError);
        throw new Error(`Error fetching profile: ${profileError.message}`);
      }
      // console.log('[Dashboard] Profile fetched:', profileData);
      setProfile(profileData);

      if (dealsError) {
         console.error('[Dashboard] Error fetching deals:', dealsError); // Log deal-specific error
         throw new Error(`Error fetching deals: ${dealsError.message}`);
      }
      // console.log(`[Dashboard] Deals fetched: ${dealsData?.length || 0}`);
      setDeals(dealsData || []);

      // Get usage data
      const [analysesResult, offersResult] = await Promise.all([
        typedSupabase.from('property_analyses')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setDate(1)).toISOString()), // Start of month
        typedSupabase.from('deals')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .not('offer_price', 'is', null)
          .gte('updated_at', new Date(new Date().setDate(1)).toISOString()) // Start of month
      ]);

      // Update usage data
      setUsageData({
        analyses: { 
          current: analysesResult.count || 0, 
          limit: 5 
        },
        offers: { 
          current: offersResult.count || 0, 
          limit: 3 
        },
        imports: { 
          current: dealsData?.filter(d => 
            d.source === 'CSV Import' && 
            d.created_at && 
            new Date(d.created_at) >= new Date(new Date().setDate(1))
          ).length || 0, 
          limit: 10 
        }
      });

      setPageStatus('loaded');
    } catch (err: any) {
      console.error('[Dashboard] Error loading data:', err); // Keep
      setError(err.message || 'Failed to load dashboard data.');
      setPageStatus('error');
    } 
  }, [supabase, user, authLoading]);

  // Callback function to refresh deals when a new one is added
  const handleDealAdded = useCallback(() => {
    // console.log('[Dashboard] New deal added, refreshing deals list...');
    loadDashboardData();
  }, [loadDashboardData]);

  // Callback for when a deal is successfully updated
  const handleDealUpdated = useCallback(() => {
    setEditingDealId(null); // Close the edit form
    loadDashboardData(); // Refetch deals
  }, [loadDashboardData]);

  // Callback to cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingDealId(null);
  }, []);

  // Function to handle deal deletion
  const handleDeleteDeal = useCallback(async (dealId: string) => {
    if (!supabase) {
      setDeleteError('Supabase client not available.');
      return;
    }

    const dealToDelete = deals.find(d => d.id === dealId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the deal "${dealToDelete?.deal_name || 'Unnamed Deal'}"?`
    );

    if (!confirmDelete) {
      return; // User cancelled
    }

    setDeletingDealId(dealId);
    setDeleteError(null);
    // Give immediate feedback
    toast.info('Attempting to delete deal...');

    try {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (deleteError) {
        console.error('[Dashboard] Error deleting deal:', deleteError);
        throw deleteError;
      }

      // Deletion successful
      toast.success('Deal deleted successfully!');
      loadDashboardData(); 
      
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete deal.');
      // Show error toast
      toast.error(`Error deleting deal: ${err.message || 'Unknown error'}`); 
    } finally {
      setDeletingDealId(null); // Reset deleting state regardless of outcome
    }
  }, [supabase, loadDashboardData, deals]);

  // Effect to trigger data loading when auth is ready
  useEffect(() => {
    // Ensure we only load data if authenticated AND not already loading/loaded
    if (isAuthenticated && supabase && !authLoading && pageStatus !== 'loading_data' && pageStatus !== 'loaded') {
       loadDashboardData();
    }
  }, [isAuthenticated, supabase, authLoading, loadDashboardData, pageStatus]);

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    if (!supabase || !user || editingName === profile?.full_name) {
      setIsEditing(false);
      return;
    }
    
    setUpdateError(null);
    setIsUpdating(true);
    try {
      // console.log(`[Dashboard] Updating profile name to: ${editingName}`);
      const typedSupabase = supabase as SupabaseClient<Database>; 

      const { data: updateData, error: updateError } = await typedSupabase
        .from('profiles')
        .update({ full_name: editingName })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error("[Dashboard] Error updating profile table:", updateError); // Keep
        throw updateError;
      }
      
      if (profile) {
          setProfile({ ...profile, full_name: editingName });
      }
      
      // console.log("[Dashboard] Profile table updated successfully:", updateData);
      setIsEditing(false);
    } catch (err: any) {
      console.error('[Dashboard] Failed to update profile:', err); // Keep
      setUpdateError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Find the deal currently being edited --- 
  const dealToEdit = editingDealId ? deals.find(d => d.id === editingDealId) : null;

  // Filter deals based on selected status BEFORE the return statement
  const filteredDeals = statusFilter === 'All' 
    ? deals 
    : deals.filter(deal => deal.status === statusFilter);

  // Add a function to apply pipeline filters
  const applyPipelineFilters = (deal: Deal): boolean => {
    // If no filters are active, show all deals
    if (
      !pipelineFilters.searchTerm && 
      !pipelineFilters.propertyType && 
      !pipelineFilters.priceMin && 
      !pipelineFilters.priceMax
    ) {
      return true;
    }

    // Apply search term filter
    if (pipelineFilters.searchTerm) {
      const searchLower = pipelineFilters.searchTerm.toLowerCase();
      const nameMatch = deal.deal_name?.toLowerCase().includes(searchLower) || false;
      const addressMatch = deal.address?.toLowerCase().includes(searchLower) || false;
      
      if (!nameMatch && !addressMatch) {
        return false;
      }
    }

    // Apply property type filter
    if (pipelineFilters.propertyType && deal.property_type !== pipelineFilters.propertyType) {
      return false;
    }

    // Apply price range filters
    if (pipelineFilters.priceMin !== null && (!deal.purchase_price || deal.purchase_price < pipelineFilters.priceMin)) {
      return false;
    }

    if (pipelineFilters.priceMax !== null && (!deal.purchase_price || deal.purchase_price > pipelineFilters.priceMax)) {
      return false;
    }

    return true;
  };

  // Filter deals for the pipeline
  const filteredPipelineDeals = deals.filter(applyPipelineFilters);

  // --- Render logic based on pageStatus ---

  // Important: Check for authLoading *first* to avoid flicker
  if (authLoading || (!isAuthenticated && !authLoading)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold mb-4">Verifying authentication...</h1>
            <p>You'll be redirected to login if needed.</p>
          </div>
        </div>
      );
  }

  // Once auth is checked and user is not authenticated, we can let the 
  // redirect effect handle it. No need to render anything at this point.
  if (!isAuthenticated) {
      return null;
  }

  // Show loading state while fetching data
  if (pageStatus === 'loading_data') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold mb-4">Loading your data...</h1>
            <p>Please wait while we fetch your information.</p>
          </div>
        </div>
      );
  }

  // Show error state
  if (pageStatus === 'error') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || 'An unexpected error occurred while loading your dashboard.'}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button 
                onClick={() => loadDashboardData()} 
                className="mx-auto"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
  }

  // Edit State - Show the editor
  if (editingDealId && dealToEdit) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">Edit Deal</h1>
          <EditDealForm 
            deal={dealToEdit} 
            onDealUpdated={handleDealUpdated} 
            onCancel={handleCancelEdit}
            supabase={supabase}
          />
        </div>
      );
  }

  // Main dashboard view
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Show error if any */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Display loading state */}
      {(pageStatus === 'loading_auth' || pageStatus === 'loading_data') && (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      )}

      {/* Display loaded content */}
      {pageStatus === 'loaded' && (
        <>
          {/* Trial banner */}
          <TrialBanner />
          
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your real estate investments</p>
            </div>
          </header>

          {/* Profile greeting */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Welcome, {isEditing ? (
                <span className="inline-flex items-center">
                  <Input  
                    type="text" 
                    value={editingName} 
                    onChange={(e) => setEditingName(e.target.value)}
                    className="text-2xl px-2 py-1 h-auto mr-2 w-auto min-w-[200px]"
                    disabled={isUpdating}
                    autoFocus 
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating}
                    className="mr-2"
                  >
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { 
                      setIsEditing(false); 
                      setEditingName(profile?.full_name || '');
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </span>
              ) : (
                <>
                  <span className="cursor-pointer hover:underline" onClick={() => {
                    setIsEditing(true);
                    setEditingName(profile?.full_name || '');
                  }}>
                    {profile?.full_name || profile?.email || 'User'}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">(click to edit)</span>
                </>
              )}
            </h1>
            {updateError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error updating profile</AlertTitle>
                <AlertDescription>
                  {updateError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* After the welcome section and before the deals list: */}
          <div className="mb-6">
            <XpSystem />
          </div>

          {/* Check if any usage limits are reached and show upgrade prompt */}
          {(usageData.analyses.current >= usageData.analyses.limit ||
            usageData.offers.current >= usageData.offers.limit ||
            usageData.imports.current >= usageData.imports.limit) && (
              <div className="mb-6">
                <UpgradePrompt 
                  usageType={
                    usageData.analyses.current >= usageData.analyses.limit ? 'analyses' :
                    usageData.offers.current >= usageData.offers.limit ? 'offers' :
                    'imports'
                  }
                  currentUsage={
                    usageData.analyses.current >= usageData.analyses.limit ? usageData.analyses.current :
                    usageData.offers.current >= usageData.offers.limit ? usageData.offers.current :
                    usageData.imports.current
                  }
                  limit={
                    usageData.analyses.current >= usageData.analyses.limit ? usageData.analyses.limit :
                    usageData.offers.current >= usageData.offers.limit ? usageData.offers.limit :
                    usageData.imports.limit
                  }
                />
              </div>
            )}

          {/* Lead Importer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Import Leads</h2>
              <Button variant="outline" onClick={() => setShowLeadImporter(!showLeadImporter)}>
                {showLeadImporter ? 'Hide' : 'Show'} Importer
              </Button>
            </div>
            
            {showLeadImporter && (
              <LeadImporter />
            )}
          </div>

          {/* Deal management section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-semibold mb-2 sm:mb-0">Your Deals</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* View mode toggle */}
                <div className="flex border rounded-md overflow-hidden">
                  <button 
                    className={`px-3 py-1 text-sm ${viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setViewMode('list')}
                  >
                    List View
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm ${viewMode === 'pipeline' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setViewMode('pipeline')}
                  >
                    Pipeline View
                  </button>
                </div>
                
                {/* Only show filter in list view */}
                {viewMode === 'list' && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="status-filter" className="text-sm whitespace-nowrap">Filter:</Label>
                    <Select 
                      defaultValue={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger id="status-filter" className="w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        {DEAL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Add deal button */}
                <Button onClick={() => document.getElementById('add-deal-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  + Add New Deal
                </Button>
              </div>
            </div>

            {/* Show appropriate view based on viewMode */}
            {viewMode === 'list' ? (
              deals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="py-2 px-4 border-b text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDeals.map(deal => (
                        <tr key={deal.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4">
                            <Link href={`/deals/${deal.id}`} className="text-blue-600 hover:underline">
                              {deal.deal_name || 'Unnamed Deal'}
                            </Link>
                          </td>
                          <td className="py-2 px-4">{deal.address || '-'}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(deal.status)}`}>
                              {deal.status || 'No Status'}
                            </span>
                          </td>
                          <td className="py-2 px-4">{formatCurrency(deal.purchase_price)}</td>
                          <td className="py-2 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              onClick={() => setEditingDealId(deal.id)} 
                              className="text-blue-600 hover:text-blue-800 mr-2"
                              disabled={!!deletingDealId}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleDeleteDeal(deal.id)} 
                              className="text-red-600 hover:text-red-800"
                              disabled={deletingDealId === deal.id}
                            >
                              {deletingDealId === deal.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No deals found. Add your first deal below.
                </div>
              )
            ) : (
              /* Pipeline view */
              <div className="mt-6">
                <PipelineFilters onFilterChange={setPipelineFilters} />
                <DealPipeline 
                  deals={filteredDeals} 
                  supabase={supabase} 
                  onDealUpdated={handleDealUpdated}
                  onDeleteDeal={handleDeleteDeal}
                />
              </div>
            )}
          </div>

          {/* Add Deal Form */}
          <div id="add-deal-form" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Add New Deal</h2>
            <AddDealForm onDealAdded={handleDealAdded} supabase={supabase} userId={user?.id} />
          </div>

          {/* Add GenieDecision component to deals with analysis data */}
          {dealToEdit && dealToEdit.analysis_data && (
            <div className="mt-3">
              <GenieDecision 
                decision={
                  (dealToEdit.analysis_data as unknown as AnalysisData).recommendation === 'buy' ? 'buy' : 
                  (dealToEdit.analysis_data as unknown as AnalysisData).recommendation === 'pass' ? 'pass' : 
                  'neutral'
                }
                mao={(dealToEdit.analysis_data as unknown as AnalysisData).mao || null}
                purchasePrice={dealToEdit.purchase_price}
                dealScore={(dealToEdit.analysis_data as unknown as AnalysisData).deal_score}
                confidence={(dealToEdit.analysis_data as unknown as AnalysisData).confidence || 75}
                showDetails={false}
              />
            </div>
          )}

          {/* Replace the content of the dashboard after loading check with this tabbed interface */}
          {/* Inside the return statement, after the <TrialBanner> part: */}

          {/* Inside the return statement, find where the main dashboard content starts */}
          {/* Usually after banners, notifications and headings */}
          {/* Around line 220, add: */}

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={dashboardView === 'classic' ? 'default' : 'outline'}
                onClick={() => setDashboardView('classic')}
                className="relative"
                size="sm"
              >
                Classic View
              </Button>
              <Button
                variant={dashboardView === 'genie2' ? 'default' : 'outline'}
                onClick={() => setDashboardView('genie2')}
                className="relative"
                size="sm"
              >
                Genie 2.0
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">New</span>
              </Button>
            </div>
          </div>
          
          {dashboardView === 'genie2' && !genie2AnnouncementDismissed && (
            <AnnouncementBanner
              title="Welcome to Deal Genie 2.0! 🚀"
              features={[
                "Mobile-optimized dashboard for on-the-go investing",
                "XP & level progression to track your real estate journey",
                "Social proof with investor activity and testimonials",
                "Referral system to grow your network and earn rewards",
                "Weekly personalized property recommendations via email"
              ]}
              onDismiss={() => setGenie2AnnouncementDismissed(true)}
              variant="success"
            />
          )}

          {dashboardView === 'classic' ? (
            // Original Dashboard Content
            <>
              {/* Keep original dashboard controls and view switch */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                {/* Your existing dashboard controls */}
              </div>
              
              {/* Original view toggle */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setViewMode('list')}
                    className="rounded-r-none"
                  >
                    List View
                  </Button>
                  <Button 
                    variant={viewMode === 'pipeline' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setViewMode('pipeline')}
                    className="rounded-l-none"
                  >
                    Pipeline
                  </Button>
                </div>
              </div>
              
              {/* Original content - keep this as is */}
              {viewMode === 'pipeline' ? (
                <div className="mt-6">
                  <PipelineFilters 
                    filters={pipelineFilters} 
                    onFiltersChange={setPipelineFilters} 
                  />
                  <DealPipeline 
                    deals={filteredDeals} 
                    onDealClick={(dealId) => setEditingDealId(dealId)}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ) : (
                // The list view content remains unchanged
                <>
                  {/* Your existing list view */}
                </>
              )}
            </>
          ) : (
            // Genie 2.0 Dashboard Content
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
                    <TabsTrigger value="mobile" className="flex-1">Mobile View</TabsTrigger>
                    <TabsTrigger value="social" className="flex-1">Social Activity</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="mt-4">
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle>Properties Dashboard</CardTitle>
                        <CardDescription>
                          Your real estate investment opportunities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* This could include the actual deals */}
                        <div className="space-y-4">
                          {filteredDeals.length > 0 ? (
                            filteredDeals.map(deal => (
                              <div key={deal.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                   onClick={() => setEditingDealId(deal.id)}>
                                <div className="flex justify-between">
                                  <h3 className="font-medium">{deal.deal_name || 'Unnamed Deal'}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(deal.status)}`}>
                                    {deal.status || 'No Status'}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{deal.address || 'No address'}</p>
                                <div className="flex justify-between mt-2 text-sm">
                                  <span>
                                    {formatCurrency(deal.purchase_price || 0)}
                                  </span>
                                  {deal.analysis_data && (
                                    <span className="font-medium">
                                      Deal Score: {(deal.analysis_data as any)?.deal_score || 'N/A'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-12 text-muted-foreground">
                              No deals found. Add your first property to get started!
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="mobile" className="mt-4">
                    <Card className="border-0 shadow-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="max-w-md mx-auto border-x border-gray-200 h-[600px] overflow-y-auto">
                          <MobileOptimizedDashboard />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="social" className="mt-4">
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle>Property Social Activity</CardTitle>
                        <CardDescription>
                          See what other investors are saying
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Social proof widgets */}
                          <SocialProofWidget propertyId="property-123" />
                          <SocialProofWidget propertyId="property-456" compact={true} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* XP Progress */}
                <XPProgressCard />
                
                {/* Referral Widget */}
                <ReferralWidget />
                
                {/* Quick Links */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/dashboard/picks" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-primary mr-2" />
                            <span>Weekly Genie Picks</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/market-trends" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-primary mr-2" />
                            <span>Market Trends</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/settings" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-primary mr-2" />
                            <span>Notification Settings</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 