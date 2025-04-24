'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UploadCloud, FileText, FilePlus, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/AuthProvider';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

type Lead = {
  address: string;
  city: string;
  state: string;
  zip: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  property_type?: string;
  notes?: string;
};

export default function LeadImporter() {
  const { supabase, user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<string>('csv');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedLeads, setParsedLeads] = useState<Lead[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual input states
  const [manualLeads, setManualLeads] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    setParsedLeads([]);
    
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    
    // Check if file is CSV
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setUploadError('Please upload a CSV or TXT file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      try {
        const leads = parseCSV(content);
        setParsedLeads(leads);
        if (leads.length === 0) {
          setUploadError('No valid leads found in file');
        }
      } catch (err: any) {
        setUploadError(`Error parsing file: ${err.message}`);
      }
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (content: string): Lead[] => {
    const lines = content.split(/\\r?\\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    // Try to detect headers
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    const hasHeaders = headers.includes('address') || headers.includes('street') || 
                      headers.includes('property address') || headers.includes('location');

    const requiredFields = ['address', 'city', 'state', 'zip'];
    const leads: Lead[] = [];
    
    // Start from index 1 if we detected headers
    const startIndex = hasHeaders ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim());
      if (values.length < 4) continue; // Need at least 4 fields for address, city, state, zip
      
      let lead: any = {};
      
      if (hasHeaders) {
        // Map by headers
        headers.forEach((header, index) => {
          if (index < values.length) {
            const value = values[index];
            
            // Map common header variations
            if (['address', 'street', 'property address', 'location'].includes(header)) {
              lead.address = value;
            } else if (['city', 'town'].includes(header)) {
              lead.city = value;
            } else if (['state', 'province'].includes(header)) {
              lead.state = value;
            } else if (['zip', 'zip code', 'postal code', 'postal'].includes(header)) {
              lead.zip = value;
            } else if (['price', 'list price', 'asking price'].includes(header)) {
              lead.price = parseFloat(value) || undefined;
            } else if (['beds', 'bedrooms', 'br'].includes(header)) {
              lead.bedrooms = parseInt(value) || undefined;
            } else if (['baths', 'bathrooms', 'ba'].includes(header)) {
              lead.bathrooms = parseFloat(value) || undefined;
            } else if (['sqft', 'square feet', 'square footage', 'sf'].includes(header)) {
              lead.sqft = parseInt(value) || undefined;
            } else if (['year', 'year built', 'built'].includes(header)) {
              lead.year_built = parseInt(value) || undefined;
            } else if (['type', 'property type'].includes(header)) {
              lead.property_type = value;
            } else if (['notes', 'comments', 'description'].includes(header)) {
              lead.notes = value;
            }
          }
        });
      } else {
        // Assume order: address, city, state, zip, [price], [beds], [baths], [sqft]
        lead = {
          address: values[0],
          city: values[1],
          state: values[2],
          zip: values[3],
        };
        
        if (values.length > 4) lead.price = parseFloat(values[4]) || undefined;
        if (values.length > 5) lead.bedrooms = parseInt(values[5]) || undefined;
        if (values.length > 6) lead.bathrooms = parseFloat(values[6]) || undefined;
        if (values.length > 7) lead.sqft = parseInt(values[7]) || undefined;
      }
      
      // Ensure required fields exist
      const missingFields = requiredFields.filter(field => !lead[field]);
      if (missingFields.length === 0) {
        leads.push(lead as Lead);
      }
    }
    
    return leads;
  };

  const handleManualInput = () => {
    setUploadError(null);
    setUploadSuccess(false);
    setParsedLeads([]);
    
    if (!manualLeads.trim()) {
      setUploadError('Please enter at least one lead');
      return;
    }
    
    try {
      const leads = parseCSV(manualLeads);
      setParsedLeads(leads);
      if (leads.length === 0) {
        setUploadError('No valid leads found');
      }
    } catch (err: any) {
      setUploadError(`Error parsing leads: ${err.message}`);
    }
  };

  const handleImport = async () => {
    if (!supabase || !user || parsedLeads.length === 0) {
      setUploadError('Cannot import leads. Please check your data and try again.');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      const typedSupabase = supabase as SupabaseClient<Database>;
      const importedLeadCount = await importLeads(typedSupabase, parsedLeads);
      
      setUploadSuccess(true);
      toast.success(`Successfully imported ${importedLeadCount} leads`);
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFileContent(null);
      setFileName(null);
      setParsedLeads([]);
      setManualLeads('');
    } catch (err: any) {
      console.error('Error importing leads:', err);
      setUploadError(err.message || 'Failed to import leads');
      toast.error('Error importing leads');
    } finally {
      setIsUploading(false);
    }
  };

  const importLeads = async (supabase: SupabaseClient<Database>, leads: Lead[]) => {
    // Create an array of deal objects to insert
    const deals = leads.map(lead => ({
      user_id: user!.id,
      deal_name: `Lead: ${lead.address}`,
      status: 'Lead',
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
      purchase_price: lead.price || null,
      bedrooms: lead.bedrooms || null,
      bathrooms: lead.bathrooms || null,
      square_feet: lead.sqft || null,
      year_built: lead.year_built || null,
      property_type: lead.property_type || 'Single Family',
      notes: lead.notes || '',
      imported: true,
      source: activeTab === 'csv' ? 'CSV Import' : 'Manual Import',
    }));
    
    // Insert deals in batches to avoid request size limits
    const batchSize = 25;
    let importedCount = 0;
    
    for (let i = 0; i < deals.length; i += batchSize) {
      const batch = deals.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('deals')
        .insert(batch)
        .select();
      
      if (error) {
        throw new Error(`Error importing batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      }
      
      importedCount += (data?.length || 0);
    }
    
    return importedCount;
  };

  const clearForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileContent(null);
    setFileName(null);
    setParsedLeads([]);
    setManualLeads('');
    setUploadError(null);
    setUploadSuccess(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Leads</CardTitle>
        <CardDescription>
          Quickly add multiple properties as leads to your pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <UploadCloud className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm mb-2">
                  Upload a CSV file with property leads
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  File should include: address, city, state, zip (required) and can include price, beds, baths, sqft (optional)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="max-w-xs mx-auto"
                  onChange={handleFileChange}
                />
              </div>
              
              {fileName && (
                <div className="flex items-center p-2 bg-gray-50 rounded-md">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{fileName}</span>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual">
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">
                  Enter property leads manually (one per line, CSV format)
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Format: address, city, state, zip, price, beds, baths, sqft
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Example: 123 Main St, Anytown, CA, 12345, 250000, 3, 2, 1500
                </p>
                <textarea
                  className="w-full h-32 p-2 border rounded-md"
                  placeholder="Enter property data in CSV format..."
                  value={manualLeads}
                  onChange={(e) => setManualLeads(e.target.value)}
                ></textarea>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleManualInput}
                >
                  Parse Input
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Parsed Leads Preview */}
        {parsedLeads.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Preview ({parsedLeads.length} leads found)</h4>
            <div className="border rounded-md overflow-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zip</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedLeads.slice(0, 5).map((lead, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-xs">{lead.address}</td>
                      <td className="px-3 py-2 text-xs">{lead.city}</td>
                      <td className="px-3 py-2 text-xs">{lead.state}</td>
                      <td className="px-3 py-2 text-xs">{lead.zip}</td>
                      <td className="px-3 py-2 text-xs">{lead.price ? `$${lead.price.toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                  {parsedLeads.length > 5 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-xs text-center text-gray-500">
                        ... and {parsedLeads.length - 5} more leads
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {uploadError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {/* Success Message */}
        {uploadSuccess && (
          <Alert className="mt-4 bg-green-50 text-green-800 border-green-100">
            <Check className="h-4 w-4 mr-2" />
            <AlertDescription>Leads imported successfully!</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={clearForm}>
          Clear
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={isUploading || parsedLeads.length === 0}
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Importing...
            </>
          ) : (
            <>
              <FilePlus className="mr-2 h-4 w-4" />
              Import {parsedLeads.length} Leads
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 