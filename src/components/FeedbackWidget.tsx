'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, X, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackWidgetProps {
  propertyId: string;
  onFeedback?: (feedback: 'up' | 'down') => void;
  variant?: 'modal' | 'inline' | 'floating';
}

export default function FeedbackWidget({ 
  propertyId, 
  onFeedback,
  variant = 'inline' 
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [context, setContext] = useState('');

  const handleFeedback = async (type: 'up' | 'down') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedback(type);
    
    try {
      // Send feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          feedback: type,
          context: context || undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feedback');
      }
      
      setSubmitted(true);
      if (onFeedback) onFeedback(type);
      
      toast.success(type === 'up' 
        ? 'Thanks! This lead has been marked as good.'
        : 'Thanks! This lead has been marked as not useful.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Floating button variant
  if (variant === 'floating' && !isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    );
  }

  // Modal variant
  if (variant === 'floating') {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Feedback</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Was this a good lead?</span>
            <button
              className={`px-2 py-1 rounded-full border ${feedback === 'up' ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'} text-green-600 hover:bg-green-200 flex items-center`}
              onClick={() => handleFeedback('up')}
              disabled={submitted || isSubmitting}
              aria-label="Thumbs up"
            >
              {isSubmitting && feedback === 'up' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
            </button>
            <button
              className={`px-2 py-1 rounded-full border ${feedback === 'down' ? 'bg-red-100 border-red-400' : 'bg-white border-gray-300'} text-red-600 hover:bg-red-200 flex items-center`}
              onClick={() => handleFeedback('down')}
              disabled={submitted || isSubmitting}
              aria-label="Thumbs down"
            >
              {isSubmitting && feedback === 'down' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsDown className="h-4 w-4" />
              )}
            </button>
            {submitted && <span className="text-xs ml-2 text-blue-600 font-semibold">Thank you!</span>}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant (default)
  return (
    <div className="mt-3 pt-2 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Was this a good lead?</span>
        <button
          className={`px-2 py-1 rounded-full border ${feedback === 'up' ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'} text-green-600 hover:bg-green-200 flex items-center`}
          onClick={() => handleFeedback('up')}
          disabled={submitted || isSubmitting}
          aria-label="Thumbs up"
        >
          {isSubmitting && feedback === 'up' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            '👍'
          )}
        </button>
        <button
          className={`px-2 py-1 rounded-full border ${feedback === 'down' ? 'bg-red-100 border-red-400' : 'bg-white border-gray-300'} text-red-600 hover:bg-red-200 flex items-center`}
          onClick={() => handleFeedback('down')}
          disabled={submitted || isSubmitting}
          aria-label="Thumbs down"
        >
          {isSubmitting && feedback === 'down' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            '👎'
          )}
        </button>
        {submitted && <span className="text-xs ml-2 text-blue-600 font-semibold">Thank you!</span>}
      </div>
    </div>
  );
} 