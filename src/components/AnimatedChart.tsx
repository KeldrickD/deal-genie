import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/ErrorState';

interface AnimatedChartProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  height?: string | number;
  width?: string | number;
}

export default function AnimatedChart({
  children,
  isLoading = false,
  error = null,
  onRetry,
  height = '300px',
  width = '100%',
}: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay showing the chart to allow for smooth transitions
    if (!isLoading && !error) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isLoading, error]);

  return (
    <div 
      className="relative w-full rounded-lg border border-gray-200" 
      style={{ 
        height, 
        width,
      }}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full p-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-[250px] w-full" />
            </div>
          </motion.div>
        )}
        
        {error && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <ErrorState 
              message={error} 
              onRetry={onRetry} 
            />
          </motion.div>
        )}
        
        {!isLoading && !error && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 