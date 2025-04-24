import React, { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/ErrorState';

interface ResponsiveMapContainerProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  height?: { 
    mobile: string | number;
    desktop: string | number; 
  };
}

export default function ResponsiveMapContainer({
  children,
  isLoading = false,
  error = null,
  onRetry,
  height = { mobile: '250px', desktop: '500px' },
}: ResponsiveMapContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check screen size initially
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  return (
    <div 
      className="relative w-full rounded-lg border border-gray-200 overflow-hidden"
      style={{ 
        height: isMobile ? height.mobile : height.desktop,
        transition: 'height 0.3s ease-in-out',
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-4 z-10">
          <Map className="h-8 w-8 text-gray-400 mb-4 animate-pulse" />
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      )}
      
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <ErrorState 
            title="Map loading failed"
            message={error} 
            onRetry={onRetry} 
          />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: !isLoading && !error ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
      
      {isMobile && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent text-center py-2 px-4 text-sm text-gray-600">
          <p>Rotate device for larger map view</p>
        </div>
      )}
    </div>
  );
} 