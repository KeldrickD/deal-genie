'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, FileDown, Edit, Send, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { StructuredAnalysis } from '@/app/ai/actions';
import { generateOfferTermsAction } from '@/app/ai/actions';
import { useAuthContext } from '@/components/AuthProvider';
import { getPropertyDetails } from '@/lib/attom';

interface OfferGeneratorProps {
  dealData?: any; // The deal data if coming from a specific deal
  analysisData?: StructuredAnalysis | null; // Analysis data if available
  address?: string; // Optional address
}

export default function OfferGenerator({ dealData, analysisData, address }: OfferGeneratorProps) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [offerData, setOfferData] = useState({
    propertyAddress: dealData?.address || '',
    purchasePrice: dealData?.purchase_price || analysisData?.mao || '',
    closingDate: getDefaultClosingDate(),
    earnestMoney: '1000',
    inspectionDays: '10',
    financingDays: '21',
    additionalTerms: '',
    sellerName: '',
    sellerEmail: '',
    agentName: '',
    agentEmail: '',
    includeAnalysis: true
  });
  
  const [generatedOffer, setGeneratedOffer] = useState<any>(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // References for PDF generation
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  const [attomData, setAttomData] = useState<any>(null);
  
  useEffect(() => {
    if (address) {
      getPropertyDetails(address).then(data => setAttomData(data?.property || data)).catch(() => setAttomData(null));
    }
  }, [address]);
  
  function getDefaultClosingDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setOfferData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setOfferData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleGenerateOffer = async () => {
    if (!offerData.propertyAddress) {
      setError('Property address is required');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // First, generate the offer terms if needed
      let offerTerms = null;
      if (!generatedOffer) {
        // If we have analysis data, use that to generate better offer terms
        const inputData = {
          address: offerData.propertyAddress,
          purchase_price: parseFloat(offerData.purchasePrice) || null,
          arv: analysisData?.arv || null,
          rehab_cost: analysisData?.repairCostLow || null,
        };
        
        const result = await generateOfferTermsAction(inputData);
        if (result.error) {
          throw new Error(result.error);
        }
        
        offerTerms = result.offerTerms;
      }
      
      // Generate the formatted offer document
      const offer = {
        property: {
          address: offerData.propertyAddress,
          price: parseFloat(offerData.purchasePrice) || 0,
        },
        terms: {
          closingDate: offerData.closingDate,
          earnestMoney: parseFloat(offerData.earnestMoney) || 1000,
          inspectionDays: parseInt(offerData.inspectionDays) || 10,
          financingDays: parseInt(offerData.financingDays) || 21,
          additionalTerms: offerData.additionalTerms,
          generatedTerms: offerTerms
        },
        contacts: {
          buyer: {
            name: user?.user_metadata?.name || user?.email || 'Buyer',
            email: user?.email || '',
          },
          seller: {
            name: offerData.sellerName,
            email: offerData.sellerEmail,
          },
          agent: {
            name: offerData.agentName,
            email: offerData.agentEmail,
          }
        },
        analysis: offerData.includeAnalysis ? analysisData : null,
        createdAt: new Date().toISOString(),
      };
      
      setGeneratedOffer(offer);
      
      // Generate email content
      const subject = `Real Estate Offer: ${offerData.propertyAddress}`;
      const content = generateEmailContent(offer);
      
      setEmailSubject(subject);
      setEmailContent(content);
      
      // Move to the review tab
      setActiveTab('review');
      
      toast.success("Offer generated successfully!");
    } catch (err: any) {
      console.error('Error generating offer:', err);
      setError(err.message || 'Failed to generate offer');
      toast.error('Error generating offer');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateEmailContent = (offer: any) => {
    return `Dear ${offer.contacts.seller.name || 'Property Owner'},

I am pleased to submit the following offer for your property located at ${offer.property.address}:

Purchase Price: ${formatCurrency(offer.property.price)}
Earnest Money Deposit: ${formatCurrency(offer.terms.earnestMoney)}
Closing Date: ${new Date(offer.terms.closingDate).toLocaleDateString()}
Inspection Period: ${offer.terms.inspectionDays} days
Financing Contingency: ${offer.terms.financingDays} days

${offer.terms.additionalTerms ? `Additional Terms: ${offer.terms.additionalTerms}\n` : ''}
${offer.terms.generatedTerms ? `\n${offer.terms.generatedTerms}\n` : ''}

Please find the complete offer details in the attached PDF. I look forward to your response.

Best regards,
${offer.contacts.buyer.name}
${offer.contacts.buyer.email}`;
  };
  
  const handleSendEmail = async () => {
    setIsPending(true);
    try {
      // Here you would typically call a server action to send the email
      // For now we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Offer email sent successfully!");
      setActiveTab('confirmation');
    } catch (err: any) {
      console.error('Error sending email:', err);
      setError(err.message || 'Failed to send email');
      toast.error('Error sending email');
    } finally {
      setIsPending(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    setIsPending(true);
    try {
      // For this example, we'll simulate downloading a PDF
      // In a real implementation, you would use a library like jsPDF or html2pdf
      // or call a server action that generates a PDF
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful download
      const blob = new Blob(['PDF content would go here'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Offer_${offerData.propertyAddress.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("PDF downloaded successfully!");
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Failed to generate PDF');
      toast.error('Error generating PDF');
    } finally {
      setIsPending(false);
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Genie Offer Engine</h1>
      
      {/* Attom Property Details Section */}
      {attomData && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-2">Property Details (Attom)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><b>Address:</b> {attomData.address || address}</div>
            <div><b>Beds:</b> {attomData.bedrooms}</div>
            <div><b>Baths:</b> {attomData.bathrooms}</div>
            <div><b>Sqft:</b> {attomData.sqft}</div>
            <div><b>Year Built:</b> {attomData.yearBuilt}</div>
            <div><b>Last Sale Price:</b> {attomData.lastSaleAmount}</div>
            <div><b>Lot Size:</b> {attomData.lotSize}</div>
            <div><b>Type:</b> {attomData.type}</div>
          </div>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="generate">Generate Offer</TabsTrigger>
          <TabsTrigger value="review" disabled={!generatedOffer}>Review</TabsTrigger>
          <TabsTrigger value="confirmation" disabled={true}>Confirmation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Create New Offer</CardTitle>
              <CardDescription>
                Fill in the details to generate a professional offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Property Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input
                      id="propertyAddress"
                      name="propertyAddress"
                      value={offerData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main St, Anytown USA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Offer Price</Label>
                    <Input
                      id="purchasePrice"
                      name="purchasePrice"
                      value={offerData.purchasePrice}
                      onChange={handleInputChange}
                      placeholder="150000"
                      type="number"
                    />
                  </div>
                </div>
                
                <h3 className="text-lg font-medium">Offer Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="closingDate">Closing Date</Label>
                    <Input
                      id="closingDate"
                      name="closingDate"
                      value={offerData.closingDate}
                      onChange={handleInputChange}
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earnestMoney">Earnest Money ($)</Label>
                    <Input
                      id="earnestMoney"
                      name="earnestMoney"
                      value={offerData.earnestMoney}
                      onChange={handleInputChange}
                      placeholder="1000"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionDays">Inspection Period (days)</Label>
                    <Input
                      id="inspectionDays"
                      name="inspectionDays"
                      value={offerData.inspectionDays}
                      onChange={handleInputChange}
                      placeholder="10"
                      type="number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="financingDays">Financing Contingency (days)</Label>
                  <Input
                    id="financingDays"
                    name="financingDays"
                    value={offerData.financingDays}
                    onChange={handleInputChange}
                    placeholder="21"
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalTerms">Additional Terms</Label>
                  <Textarea
                    id="additionalTerms"
                    name="additionalTerms"
                    value={offerData.additionalTerms}
                    onChange={handleInputChange}
                    placeholder="Any additional terms or conditions..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Seller Name</Label>
                    <Input
                      id="sellerName"
                      name="sellerName"
                      value={offerData.sellerName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerEmail">Seller Email</Label>
                    <Input
                      id="sellerEmail"
                      name="sellerEmail"
                      value={offerData.sellerEmail}
                      onChange={handleInputChange}
                      placeholder="seller@example.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      name="agentName"
                      value={offerData.agentName}
                      onChange={handleInputChange}
                      placeholder="Agent Name (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentEmail">Agent Email</Label>
                    <Input
                      id="agentEmail"
                      name="agentEmail"
                      value={offerData.agentEmail}
                      onChange={handleInputChange}
                      placeholder="agent@example.com"
                      type="email"
                    />
                  </div>
                </div>
                
                {analysisData && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeAnalysis"
                      checked={offerData.includeAnalysis}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleCheckboxChange('includeAnalysis', e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <Label
                      htmlFor="includeAnalysis"
                      className="text-sm font-normal"
                    >
                      Include property analysis data in offer
                    </Label>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 p-4 rounded-md text-red-800">
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateOffer} 
                disabled={isGenerating}
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Offer'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="review">
          {generatedOffer && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Offer Document Preview</CardTitle>
                  <CardDescription>
                    Review your generated offer document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={pdfContainerRef}
                    className="p-6 border rounded-md bg-white"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold">Real Estate Purchase Offer</h2>
                      <p className="text-gray-500">Generated via Deal Genie</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-3">Property</h3>
                      <p className="mb-2">
                        <span className="font-medium">Address:</span> {generatedOffer.property.address}
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">Offer Price:</span> {formatCurrency(generatedOffer.property.price)}
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-3">Terms</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <p className="mb-2">
                          <span className="font-medium">Closing Date:</span> {new Date(generatedOffer.terms.closingDate).toLocaleDateString()}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Earnest Money:</span> {formatCurrency(generatedOffer.terms.earnestMoney)}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Inspection Period:</span> {generatedOffer.terms.inspectionDays} days
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Financing Contingency:</span> {generatedOffer.terms.financingDays} days
                        </p>
                      </div>
                      
                      {generatedOffer.terms.additionalTerms && (
                        <div className="mt-3">
                          <h4 className="font-medium">Additional Terms:</h4>
                          <p className="text-gray-700">{generatedOffer.terms.additionalTerms}</p>
                        </div>
                      )}
                      
                      {generatedOffer.terms.generatedTerms && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h4 className="font-medium">AI-Suggested Terms:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{generatedOffer.terms.generatedTerms}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-3">Contacts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Buyer:</h4>
                          <p>{generatedOffer.contacts.buyer.name}</p>
                          <p>{generatedOffer.contacts.buyer.email}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Seller:</h4>
                          <p>{generatedOffer.contacts.seller.name || 'Not specified'}</p>
                          <p>{generatedOffer.contacts.seller.email || 'Not specified'}</p>
                        </div>
                        
                        {(generatedOffer.contacts.agent.name || generatedOffer.contacts.agent.email) && (
                          <div>
                            <h4 className="font-medium">Agent:</h4>
                            <p>{generatedOffer.contacts.agent.name || 'Not specified'}</p>
                            <p>{generatedOffer.contacts.agent.email || 'Not specified'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {generatedOffer.analysis && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Property Analysis</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <p className="mb-2">
                            <span className="font-medium">ARV:</span> {formatCurrency(generatedOffer.analysis.arv)}
                          </p>
                          <p className="mb-2">
                            <span className="font-medium">Repair Cost Range:</span> {formatCurrency(generatedOffer.analysis.repairCostLow)} - {formatCurrency(generatedOffer.analysis.repairCostHigh)}
                          </p>
                          <p className="mb-2">
                            <span className="font-medium">MAO:</span> {formatCurrency(generatedOffer.analysis.mao)}
                          </p>
                          <p className="mb-2">
                            <span className="font-medium">Cash-on-Cash ROI:</span> {generatedOffer.analysis.cashOnCashROI}%
                          </p>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-medium">Analysis:</h4>
                          <p className="text-gray-700">{generatedOffer.analysis.reasoning}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 pt-8 border-t">
                      <p className="text-center text-sm text-gray-500">
                        This offer was generated on {new Date(generatedOffer.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleDownloadPDF} variant="outline" disabled={isPending}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button onClick={() => setActiveTab('email')} variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Email
                  </Button>
                  <Button onClick={handleSendEmail} disabled={isPending}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Offer Email
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Email Preview</CardTitle>
                  <CardDescription>
                    The following email will be sent along with the offer PDF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <p className="font-medium mb-2">Subject: {emailSubject}</p>
                      <div className="whitespace-pre-wrap border-t pt-3 text-gray-700">
                        {emailContent}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyToClipboard(emailContent)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Email Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="email">
          {generatedOffer && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Email</CardTitle>
                <CardDescription>
                  Customize the email that will be sent with your offer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Subject</Label>
                    <Input
                      id="emailSubject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailContent">Email Content</Label>
                    <Textarea
                      id="emailContent"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="min-h-[300px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('review')}>
                  Back to Review
                </Button>
                <Button onClick={handleSendEmail} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="confirmation">
          <Card>
            <CardHeader>
              <CardTitle>Offer Sent Successfully!</CardTitle>
              <CardDescription>
                Your offer has been sent to the recipient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-center mb-2">
                  Offer Successfully Sent
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Your offer for {generatedOffer?.property.address} has been sent to {generatedOffer?.contacts.seller.email || 'the seller'}.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDF Copy
                  </Button>
                  <Button onClick={() => setActiveTab('generate')}>
                    Create Another Offer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 