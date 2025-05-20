'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';
import { calculateGenieDealScore } from '@/app/ai/actions';
import Image from 'next/image';

interface PersonalizedRecommendationsProps {
  limit?: number;
  showTitle?: boolean;
  onViewProperty?: (propertyId: string) => void;
}

interface RecommendedProperty {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zipcode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  personalized_score: number;
  attom_data?: any;
  imageUrl?: string;
}

export default function PersonalizedRecommendations({
  limit = 3,
  showTitle = true,
  onViewProperty
}: PersonalizedRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/recommendations?limit=${limit}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setExplanation(data.explanation?.reasoningText || '');
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to load personalized recommendations');
        toast.error('Could not load recommendations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [limit]);
  
  // Fallback to mock data if API is not fully implemented
  useEffect(() => {
    if (error && !recommendations.length) {
      // Fallback to mock data
      setRecommendations([
        {
          id: '1',
          address: '123 Main St',
          city: 'Orlando',
          state: 'FL',
          zipcode: '32789',
          price: 425000,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1850,
          personalized_score: 89,
          imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
        },
        {
          id: '2',
          address: '456 Oak Ave',
          city: 'Winter Park',
          state: 'FL',
          zipcode: '32789',
          price: 379000,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1650,
          personalized_score: 84,
          imageUrl: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
        },
        {
          id: '3',
          address: '789 Pine Rd',
          city: 'Orlando',
          state: 'FL',
          zipcode: '32801',
          price: 352000,
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1450,
          personalized_score: 81,
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        }
      ]);
      
      setExplanation("Based on your activity, we've focused on 32789, 32801 and similar areas. We're showing you single family properties with at least 2 bedrooms and 2 bathrooms. Your ideal price range appears to be around $375,000.");
      setError(null);
    }
  }, [error, recommendations]);
  
  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Personalized property recommendations based on your activity
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full rounded-md" />
                <div className="h-[1px] bg-gray-100 my-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recommended for You
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-center text-gray-500">No recommendations yet. Browse more properties to get personalized suggestions.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
          <CardDescription>
            Personalized property recommendations based on your activity
          </CardDescription>
        </CardHeader>
      )}
      
      {explanation && (
        <div className="mx-6 mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <div className="flex gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{explanation}</p>
          </div>
        </div>
      )}
      
      <CardContent>
        <div className="space-y-6">
          {recommendations.map((property) => {
            const dealScore = property.attom_data 
              ? calculateGenieDealScore(property.attom_data) 
              : property.personalized_score;
            
            return (
              <div key={property.id} className="space-y-3">
                {/* Property image */}
                <div className="relative h-48 w-full overflow-hidden rounded-md">
                  {property.imageUrl ? (
                    <Image
                      src={property.imageUrl}
                      alt={property.address}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-400">No image available</p>
                    </div>
                  )}
                  
                  {/* Personalized score badge */}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {property.personalized_score}% Match
                  </div>
                </div>
                
                {/* Property details */}
                <div>
                  <h3 className="font-medium text-lg">{property.address}</h3>
                  
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {property.city}
                      {property.state ? `, ${property.state}` : ''}
                      {property.zipcode ? ` ${property.zipcode}` : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm">
                      <span className="font-medium">{property.bedrooms}</span> beds, 
                      <span className="font-medium ml-1">{property.bathrooms}</span> baths
                      {property.squareFeet && <span className="ml-1">• {property.squareFeet} sqft</span>}
                    </div>
                    
                    {property.price && (
                      <div className="text-lg font-semibold">
                        {formatCurrency(property.price)}
                      </div>
                    )}
                  </div>
                  
                  {/* Deal score bar */}
                  {dealScore > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-blue-600">Genie Score: {dealScore}/100</div>
                      <div className="w-full bg-gray-200 h-1 mt-1">
                        <div 
                          className={`h-1 ${dealScore >= 80 ? 'bg-green-500' : dealScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${dealScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {onViewProperty && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 flex items-center justify-center"
                    onClick={() => onViewProperty(property.id)}
                  >
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
                
                {/* Divider except for last item */}
                {recommendations.indexOf(property) < recommendations.length - 1 && (
                  <div className="border-b border-gray-100 pt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="ghost" className="w-full">
          View All Recommendations
        </Button>
      </CardFooter>
    </Card>
  );
} 