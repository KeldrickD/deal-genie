import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, AlertTriangle, CheckCircle, DollarSign, Home, TrendingUp, XCircle, Clock } from 'lucide-react';

interface RentalData {
  rent: number;
  dom?: number;
  trends?: {
    '6m'?: string;
    '12m'?: string;
  };
  error?: string;
  errorType?: string;
}

interface AnalysisResponse {
  rentalData: RentalData;
  comps: string;
  analysis: string;
  cached?: boolean;
  errors?: {
    rental?: string;
    comps?: string;
    analysis?: string;
  };
}

interface PropertyAnalysisResultsProps {
  data: AnalysisResponse;
  address: string;
  isLoading: boolean;
}

export default function PropertyAnalysisResults({ 
  data, 
  address,
  isLoading 
}: PropertyAnalysisResultsProps) {
  if (isLoading) {
    return (
      <Card className="my-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 animate-spin text-primary" />
            <p>Analyzing property at {address}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's no data, show nothing
  if (!data.analysis && !data.comps && !data.rentalData) {
    return null;
  }

  // Extract Go/No-Go decision from analysis
  const isGo = data.analysis?.toLowerCase().includes('go') && 
               !data.analysis?.toLowerCase().includes('no-go') &&
               !data.analysis?.toLowerCase().includes('no go');

  return (
    <div className="space-y-6 my-6">
      {/* Show error alerts if any */}
      {data.errors && (Object.keys(data.errors).length > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Limitations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              {data.errors.rental && (
                <li>{data.errors.rental}</li>
              )}
              {data.errors.comps && (
                <li>{data.errors.comps}</li>
              )}
              {data.errors.analysis && (
                <li>{data.errors.analysis}</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Show cached data notice */}
      {data.cached && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Cached Result</AlertTitle>
          <AlertDescription>
            This analysis is from a previous request. 
            <button className="ml-2 text-primary hover:underline">Refresh</button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main analysis card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Analysis Results
            {isGo !== undefined && (
              <Badge className={`ml-3 ${isGo ? 'bg-green-500' : 'bg-red-500'}`}>
                {isGo ? 'GO' : 'NO-GO'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="comps">Comparable Sales</TabsTrigger>
              <TabsTrigger value="rental">Rental Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 pt-4">
              {data.analysis ? (
                <div className="whitespace-pre-wrap">{data.analysis}</div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Unavailable</AlertTitle>
                  <AlertDescription>
                    We couldn't generate an analysis for this property. Please try again or try a different address.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="comps" className="space-y-4 pt-4">
              {data.comps && !data.comps.includes("No comparable") ? (
                <div className="whitespace-pre-wrap">{data.comps}</div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Comparable Sales Found</AlertTitle>
                  <AlertDescription>
                    We couldn't find recent comparable sales for this address. 
                    The analysis is based on other data sources which may affect accuracy.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="rental" className="space-y-4 pt-4">
              {data.rentalData && data.rentalData.rent > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="text-sm text-muted-foreground">Estimated Monthly Rent</p>
                          <p className="text-2xl font-bold">${data.rentalData.rent}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {data.rentalData.dom !== undefined && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Days on Market</p>
                            <p className="text-2xl font-bold">{data.rentalData.dom} days</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {data.rentalData.trends && (data.rentalData.trends['12m'] || data.rentalData.trends['6m']) && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Rent Trends</p>
                            <div className="space-y-1 mt-2">
                              {data.rentalData.trends['12m'] && (
                                <p><span className="font-medium">12m:</span> {data.rentalData.trends['12m']}</p>
                              )}
                              {data.rentalData.trends['6m'] && (
                                <p><span className="font-medium">6m:</span> {data.rentalData.trends['6m']}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Rental Data Unavailable</AlertTitle>
                  <AlertDescription>
                    We couldn't find rental data for this address. 
                    The analysis is based on other data sources which may affect accuracy.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 