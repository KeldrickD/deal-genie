import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function GenieNetLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex items-center mb-6 md:mb-8">
        <Skeleton className="h-8 w-8 rounded-full mr-3" />
        <Skeleton className="h-8 w-40" />
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 md:p-8 mb-8">
        <Skeleton className="h-6 w-64 mb-6" />
        <Skeleton className="h-4 w-full max-w-2xl mb-3" />
        <Skeleton className="h-4 w-full max-w-xl mb-6" />
        
        <div className="flex mb-8">
          <Skeleton className="h-10 w-32 rounded-md mr-3" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <Skeleton className="h-5 w-full max-w-xl mb-3" />
            <Skeleton className="h-5 w-full max-w-lg mb-3" />
            <Skeleton className="h-5 w-full max-w-md mb-3" />
            <Skeleton className="h-5 w-full max-w-sm" />
          </div>
          <div className="bg-white rounded-lg p-4 md:p-6 border">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
} 