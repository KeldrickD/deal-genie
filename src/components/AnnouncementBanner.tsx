'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnnouncementBannerProps {
  title: string;
  features?: string[];
  onDismiss?: () => void;
  persistent?: boolean;
  variant?: 'default' | 'success' | 'info' | 'warning';
}

export default function AnnouncementBanner({
  title,
  features = [],
  onDismiss,
  persistent = false,
  variant = 'info'
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Check if the banner has been dismissed before
  useEffect(() => {
    if (persistent) return;
    
    const isDismissed = localStorage.getItem('genie2_announcement_dismissed') === 'true';
    if (isDismissed) {
      setIsVisible(false);
    }
  }, [persistent]);
  
  // Handle dismissing the banner
  const handleDismiss = () => {
    setIsVisible(false);
    
    if (!persistent) {
      localStorage.setItem('genie2_announcement_dismissed', 'true');
    }
    
    if (onDismiss) {
      onDismiss();
    }
  };
  
  if (!isVisible) return null;
  
  // Generate the appropriate variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };
  
  const getIconByVariant = () => {
    switch (variant) {
      case 'success':
        return <Sparkles className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <Alert className={`flex items-start justify-between space-x-4 mb-4 ${getVariantClasses()}`}>
      <div className="flex space-x-2">
        {getIconByVariant()}
        <AlertDescription className="flex-1">
          <div className="font-medium mb-1">{title}</div>
          {features.length > 0 && (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 rounded-full"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
} 