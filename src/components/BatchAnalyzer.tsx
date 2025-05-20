'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Upload, ListFilter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeBatchProperties, calculateGenieDealScore } from '@/app/ai/actions';
import { StructuredAnalysis } from '@/app/ai/actions';
import { formatCurrency } from '@/lib/utils';
import PropertyHistoryTimeline from './PropertyHistoryTimeline';

// Helper function to parse CSV content
function parseCSV(content: string): string[] {
  // Split by new line and filter out empty lines
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Extract addresses from the CSV (assumes the first column contains addresses)
  const addresses: string[] = [];
  
  // Check if there's a header row
  let startIndex = 0;
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes('address') || firstLine.includes('property') || firstLine.includes('location')) {
      startIndex = 1; // Skip header row
    }
  }
  
  // Process each line
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(',');
    if (columns.length > 0) {
      const address = columns[0].trim();
      if (address) {
        addresses.push(address);
      }
    }
  }
  
  return addresses;
}

interface BatchAnalysisResult {
  address: string;
  analysis: StructuredAnalysis | null;
  attomData?: any;
}

export default function BatchAnalyzer() {
  const [activeTab, setActiveTab] = useState('upload');
  const [csvContent, setCsvContent] = useState('');
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<BatchAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      return;
    }
    
    // Check file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a CSV or TXT file');
      return;
    }
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      try {
        const parsedAddresses = parseCSV(content);
        setAddresses(parsedAddresses);
        if (parsedAddresses.length === 0) {
          setError('No valid addresses found in the file');
        } else {
          toast.success(`Successfully parsed ${parsedAddresses.length} addresses`);
          setActiveTab('review');
        }
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Failed to parse the uploaded file');
      }
    };
    reader.onerror = () => {
      setError('Failed to read the uploaded file');
    };
    reader.readAsText(file);
  };
  
  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    try {
      const parsedAddresses = parseCSV(csvContent);
      setAddresses(parsedAddresses);
      if (parsedAddresses.length === 0) {
        setError('No valid addresses found in the input');
      } else {
        toast.success(`Successfully parsed ${parsedAddresses.length} addresses`);
        setActiveTab('review');
      }
    } catch (err) {
      console.error('Error parsing manual input:', err);
      setError('Failed to parse the input text');
    }
  };
  
  const handleAnalyzeProperties = async () => {
    if (addresses.length === 0) {
      setError('No addresses to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeBatchProperties({ addresses });
      
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.results) {
        setAnalysisResults(result.results);
        toast.success(`Analysis completed for ${result.results.length} properties`);
        setActiveTab('results');
      }
    } catch (err: any) {
      console.error('Error analyzing properties:', err);
      setError(err.message || 'Failed to analyze properties');
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleDownloadResults = () => {
    if (analysisResults.length === 0) {
      toast.error('No results to download');
      return;
    }
    
    // Create CSV content
    let csvData = 'Address,ARV,Repair Cost Low,Repair Cost High,Cash-on-Cash ROI,Flip Potential,Rental Potential,MAO,Recommendation,Confidence Level\n';
    
    analysisResults.forEach(result => {
      if (result.analysis) {
        csvData += `"${result.address}",${result.analysis.arv},${result.analysis.repairCostLow},${result.analysis.repairCostHigh},${result.analysis.cashOnCashROI},${result.analysis.flipPotential},${result.analysis.rentalPotential},${result.analysis.mao},"${result.analysis.recommendation}",${result.analysis.confidenceLevel}\n`;
      } else {
        csvData += `"${result.address}",N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A,N/A\n`;
      }
    });
    
    // Create download link
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('Results downloaded successfully');
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Genie Analyzer</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="review" disabled={addresses.length === 0}>Review</TabsTrigger>
          <TabsTrigger value="results" disabled={analysisResults.length === 0}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Properties</CardTitle>
              <CardDescription>
                Upload a CSV file with property addresses or paste them directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                    onClick={triggerFileInput}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept=".csv,.txt" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      CSV or TXT files with addresses in the first column
                    </p>
                  </div>
                </div>
                
                <div className="divider text-center text-gray-500 text-sm my-2">OR</div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Paste Addresses</h3>
                  <form onSubmit={handleManualInput}>
                    <Textarea
                      placeholder="Enter addresses, one per line or comma-separated"
                      className="min-h-[200px] mb-4"
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                    />
                    <Button type="submit" disabled={!csvContent.trim()}>
                      Parse Addresses
                    </Button>
                  </form>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
                  <p>{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review Properties</CardTitle>
              <CardDescription>
                Verify the addresses before analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Found {addresses.length} properties to analyze:
                </p>
                <div className="bg-gray-50 p-4 rounded-md max-h-[300px] overflow-y-auto">
                  <ul className="list-disc pl-5 space-y-1">
                    {addresses.map((address, index) => (
                      <li key={index} className="text-sm">{address}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
                  <p>{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleAnalyzeProperties} 
                disabled={isAnalyzing || addresses.length === 0}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Properties'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    {analysisResults.length} properties analyzed
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadResults}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 border">Address</th>
                      <th className="p-2 border">ARV</th>
                      <th className="p-2 border">Repair Cost</th>
                      <th className="p-2 border">MAO</th>
                      <th className="p-2 border">ROI</th>
                      <th className="p-2 border">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 border font-medium">{result.address}</td>
                        <td className="p-2 border">
                          {result.analysis ? formatCurrency(result.analysis.arv) : 'N/A'}
                        </td>
                        <td className="p-2 border">
                          {result.analysis ? 
                            `${formatCurrency(result.analysis.repairCostLow)} - ${formatCurrency(result.analysis.repairCostHigh)}` : 
                            'N/A'}
                        </td>
                        <td className="p-2 border">
                          {result.analysis ? formatCurrency(result.analysis.mao) : 'N/A'}
                        </td>
                        <td className="p-2 border">
                          {result.analysis ? `${result.analysis.cashOnCashROI}%` : 'N/A'}
                        </td>
                        <td className="p-2 border">
                          {result.analysis ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.analysis.recommendation === 'GO' ? 
                                'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                            }`}>
                              {result.analysis.recommendation}
                              {' '}
                              ({result.analysis.confidenceLevel}%)
                            </span>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {analysisResults.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Property Details</h3>
                  <div className="grid gap-4">
                    {analysisResults.map((result, index) => (
                      result.analysis && (
                        <div key={index} className="border rounded-md p-4">
                          <h4 className="font-medium mb-2">{result.address}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-700">Financial Details</h5>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div className="text-sm">ARV:</div>
                                  <div className="text-sm font-medium">{formatCurrency(result.analysis.arv)}</div>
                                  <div className="text-sm">Repair Costs:</div>
                                  <div className="text-sm font-medium">
                                    {formatCurrency(result.analysis.repairCostLow)} - {formatCurrency(result.analysis.repairCostHigh)}
                                  </div>
                                  <div className="text-sm">MAO:</div>
                                  <div className="text-sm font-medium">{formatCurrency(result.analysis.mao)}</div>
                                  <div className="text-sm">Cash-on-Cash ROI:</div>
                                  <div className="text-sm font-medium">{result.analysis.cashOnCashROI}%</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-700">Investment Potential</h5>
                                <div className="mt-2">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs">Flip</span>
                                    <span className="text-xs">{result.analysis.flipPotential}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${result.analysis.flipPotential}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs">Rental</span>
                                    <span className="text-xs">{result.analysis.rentalPotential}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full" 
                                      style={{ width: `${result.analysis.rentalPotential}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Analysis</h5>
                                <p className="text-xs text-gray-600 mt-1">
                                  {result.analysis.reasoning}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
                  <p>{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab('review')}>
                Back to Review
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 