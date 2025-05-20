import React, { useEffect, useState } from 'react';
import { getPropertyHistory } from '@/lib/attom';
import { Loader2, Home, DollarSign, Banknote } from 'lucide-react';

interface PropertyHistoryTimelineProps {
  address: string;
}

interface TimelineEvent {
  date: string;
  type: 'sale' | 'mortgage';
  amount?: number;
  buyer?: string;
  seller?: string;
  lender?: string;
  details?: string;
}

export default function PropertyHistoryTimeline({ address }: PropertyHistoryTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    getPropertyHistory(address)
      .then(({ sales, mortgage }) => {
        const salesEvents: TimelineEvent[] = (sales?.saleshistory || []).map((sale: any) => ({
          date: sale.saleDate || sale.date || '',
          type: 'sale',
          amount: sale.saleAmount || sale.amount || null,
          buyer: sale.buyerName || sale.buyer || '',
          seller: sale.sellerName || sale.seller || '',
          details: sale.deedType || sale.documentType || '',
        }));
        const mortgageEvents: TimelineEvent[] = (mortgage?.mortgagehistory || []).map((mort: any) => ({
          date: mort.loanDate || mort.date || '',
          type: 'mortgage',
          amount: mort.loanAmount || mort.amount || null,
          lender: mort.lenderName || mort.lender || '',
          details: mort.loanType || mort.documentType || '',
        }));
        const allEvents = [...salesEvents, ...mortgageEvents].filter(e => e.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(allEvents);
      })
      .catch((err) => {
        setError('Failed to fetch property history.');
      })
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) return null;
  if (loading) return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <span>Loading property history...</span></div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (events.length === 0) return <div className="text-gray-500">No property history found.</div>;

  return (
    <div className="my-4">
      <h3 className="font-bold mb-2">Property History Timeline</h3>
      <ol className="border-l-2 border-gray-300 pl-4">
        {events.map((event, idx) => (
          <li key={idx} className="mb-4 relative">
            <span className="absolute -left-5 top-1">
              {event.type === 'sale' ? <Home className="text-blue-500" size={18} /> : <Banknote className="text-green-500" size={18} />}
            </span>
            <div className="text-xs text-gray-500 mb-1">{new Date(event.date).toLocaleDateString()}</div>
            <div className="font-medium">
              {event.type === 'sale' ? 'Sale' : 'Mortgage'}
              {event.amount && (
                <span className="ml-2 text-sm text-gray-700">(<DollarSign className="inline h-4 w-4 -mt-1" />{event.amount.toLocaleString()})</span>
              )}
            </div>
            {event.type === 'sale' && (
              <div className="text-xs text-gray-700">
                {event.buyer && <span><b>Buyer:</b> {event.buyer} </span>}
                {event.seller && <span><b>Seller:</b> {event.seller} </span>}
                {event.details && <span><b>Deed:</b> {event.details}</span>}
              </div>
            )}
            {event.type === 'mortgage' && (
              <div className="text-xs text-gray-700">
                {event.lender && <span><b>Lender:</b> {event.lender} </span>}
                {event.details && <span><b>Type:</b> {event.details}</span>}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
} 