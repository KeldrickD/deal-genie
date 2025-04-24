'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { History } from 'lucide-react';

type DealHistory = Database['public']['Tables']['deal_history']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

interface DealHistoryViewerProps {
  deal: Deal;
  supabase: SupabaseClient<Database> | null;
}

export default function DealHistoryViewer({ deal, supabase }: DealHistoryViewerProps) {
  const [history, setHistory] = useState<DealHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supabase && deal.id) {
      loadHistory();
    }
  }, [supabase, deal.id]);

  async function loadHistory() {
    if (!supabase) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('deal_history')
        .select('*')
        .eq('deal_id', deal.id)
        .order('changed_at', { ascending: false });
      
      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error loading deal history:', err);
      setError('Failed to load deal history. Please try again.');
      toast.error('Failed to load deal history');
    } finally {
      setIsLoading(false);
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function getStatusClassName(status: string | null) {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'prospect': return 'bg-purple-100 text-purple-800';
      case 'researching': return 'bg-orange-100 text-orange-800';
      case 'offer made': return 'bg-yellow-100 text-yellow-800';
      case 'under contract': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-emerald-100 text-emerald-800';
      case 'dead': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <History className="h-5 w-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold">Status History</h3>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading history...</p>
        </div>
      )}
      
      {/* No History */}
      {!isLoading && history.length === 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No status changes recorded yet.</p>
        </div>
      )}
      
      {/* History Timeline */}
      {!isLoading && history.length > 0 && (
        <div className="relative pl-8 space-y-6 before:absolute before:left-4 before:h-full before:border-l-2 before:border-gray-200">
          {history.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-[-26px] h-4 w-4 rounded-full bg-white border-2 border-blue-500"></div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500 mb-2">{formatDateTime(item.changed_at)}</p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex">
                    <span className="text-sm font-medium mr-1">From:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClassName(item.old_status)}`}>
                      {item.old_status || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-sm font-medium mr-1">To:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClassName(item.new_status)}`}>
                      {item.new_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 