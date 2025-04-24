import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ComingSoonFeatureProps {
  title: string;
  description?: string;
  children?: ReactNode;
  isEnabled?: boolean;
  onWaitlistClick?: () => void;
}

export default function ComingSoonFeature({
  title,
  description,
  children,
  isEnabled = false,
  onWaitlistClick,
}: ComingSoonFeatureProps) {
  if (isEnabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-lg border border-gray-200 bg-gray-50 p-6 text-center overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-100 to-orange-100 h-1"></div>
      
      <Badge variant="outline" className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
        <Clock className="mr-1 h-3 w-3" />
        Coming Soon
      </Badge>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
      )}
      
      {onWaitlistClick && (
        <Button 
          onClick={onWaitlistClick}
          variant="outline"
          className="mt-2"
        >
          Join Waitlist
        </Button>
      )}
    </motion.div>
  );
} 