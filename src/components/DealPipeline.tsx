'use client';

import { useState, useCallback } from 'react';
import { DEAL_STATUSES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Database } from '@/types/supabase';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { useAuthContext } from '@/components/AuthProvider';

type Deal = Database['public']['Tables']['deals']['Row'];

interface DealPipelineProps {
  deals: Deal[];
  supabase: SupabaseClient<Database> | null;
  onDealUpdated: () => void;
  onDeleteDeal: (dealId: string) => void;
}

export default function DealPipeline({ deals, supabase, onDealUpdated, onDeleteDeal }: DealPipelineProps) {
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuthContext();

  // Group deals by status
  const dealsByStatus = DEAL_STATUSES.reduce<Record<string, Deal[]>>((acc, status) => {
    acc[status] = deals.filter(deal => deal.status === status);
    return acc;
  }, {});

  // Add an "Uncategorized" group for deals with no status
  dealsByStatus["Uncategorized"] = deals.filter(deal => !deal.status || !DEAL_STATUSES.includes(deal.status as any));

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingDealId(dealId);
    e.dataTransfer.setData('dealId', dealId);
    // Add a custom drag image or style if needed
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, targetStatus: string | null) => {
    e.preventDefault();
    
    const dealId = e.dataTransfer.getData('dealId');
    const deal = deals.find(d => d.id === dealId);
    
    if (!deal || !supabase || deal.status === targetStatus || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Optimistic UI update (update local state before the server confirms)
      const updatedDeals = deals.map(d => 
        d.id === dealId ? { ...d, status: targetStatus } : d
      );
      
      // Start a transaction using a stored procedure or multiple operations in sequence
      
      // 1. Record the status change in history
      const { error: historyError } = await supabase
        .from('deal_history')
        .insert({
          deal_id: dealId,
          old_status: deal.status,
          new_status: targetStatus,
          changed_by: user?.id
        });
      
      if (historyError) throw historyError;
      
      // 2. Update deal status
      const { error } = await supabase
        .from('deals')
        .update({ status: targetStatus })
        .eq('id', dealId);
      
      if (error) throw error;
      
      toast.success(`Moved ${deal.deal_name || 'Deal'} to ${targetStatus || 'Uncategorized'}`);
      onDealUpdated(); // Refresh deals
    } catch (error: any) {
      console.error('Error updating deal status:', error);
      toast.error(`Failed to update deal status: ${error.message}`);
    } finally {
      setIsUpdating(false);
      setDraggingDealId(null);
    }
  }, [deals, supabase, onDealUpdated, isUpdating, user]);

  // Deal card component
  const DealCard = ({ deal }: { deal: Deal }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, deal.id)}
      className={`p-3 my-2 bg-white rounded-md shadow cursor-move border-l-4 ${
        draggingDealId === deal.id ? 'opacity-50' : 'opacity-100'
      } ${getStatusColor(deal.status)}`}
    >
      <div className="text-sm font-medium mb-1">
        <Link 
          href={`/deals/${deal.id}`} 
          className="text-blue-600 hover:underline hover:text-blue-800"
        >
          {deal.deal_name || 'Unnamed Deal'}
        </Link>
      </div>
      <div className="text-xs text-gray-600 mb-1 truncate">{deal.address || 'No address'}</div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs font-medium">
          {formatCurrency(deal.purchase_price || 0)}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDeleteDeal(deal.id)} 
          className="h-6 w-6 opacity-50 hover:opacity-100"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );

  // Helper function to get border color based on status
  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'Lead': return 'border-blue-400';
      case 'Prospect': return 'border-purple-400';
      case 'Researching': return 'border-orange-400';
      case 'Offer Made': return 'border-yellow-400';
      case 'Under Contract': return 'border-green-400';
      case 'Closed': return 'border-emerald-400';
      case 'Dead': return 'border-gray-400';
      case 'Lost': return 'border-red-400';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {/* Render each status column including Uncategorized */}
        {[...DEAL_STATUSES, "Uncategorized"].map(status => (
          <div 
            key={status} 
            className="w-72 bg-gray-100 rounded-md p-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status === "Uncategorized" ? null : status)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">{status}</h3>
              <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                {dealsByStatus[status]?.length || 0}
              </span>
            </div>
            <div className="deal-column min-h-[50vh]">
              {dealsByStatus[status]?.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 