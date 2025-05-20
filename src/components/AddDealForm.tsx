'use client';

import { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface AddDealFormProps {
  onDealAdded: () => void; // Callback to notify parent when a deal is added
  supabase: SupabaseClient<Database> | null; // Add supabase client prop
  userId: string | undefined; // Add userId prop
  compact?: boolean; // Add compact mode prop
}

// Define possible deal statuses
const dealStatuses = [
  "Prospect", 
  "Researching", 
  "Offer Made", 
  "Under Contract", 
  "Closed", 
  "Lost"
];

export default function AddDealForm({ onDealAdded, supabase, userId, compact = false }: AddDealFormProps) {
  const [dealName, setDealName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState(''); // Keep state variable, it will hold the selected value
  const [propertyType, setPropertyType] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string | number>(''); // Use string for input, convert later
  const [arv, setArv] = useState<string | number>('');
  const [rehabCost, setRehabCost] = useState<string | number>('');
  const [noi, setNoi] = useState<string | number>('');
  const [capRate, setCapRate] = useState<string | number>('');
  const [loanAmount, setLoanAmount] = useState<string | number>('');
  const [interestRate, setInterestRate] = useState<string | number>('');
  const [loanTermYears, setLoanTermYears] = useState<string | number>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to convert input string/number to number or null
  const parseNumericInput = (input: string | number): number | null => {
    if (input === '' || input === null || input === undefined) return null;
    const num = Number(input);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !userId) {
      setError('Authentication context not available.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Prepare data for insertion, converting numeric fields
    const dealData = {
        deal_name: dealName || null,
        address: address || null,
        status: status || null,
        user_id: userId,
        property_type: propertyType || null,
        purchase_price: parseNumericInput(purchasePrice),
        arv: parseNumericInput(arv),
        rehab_cost: parseNumericInput(rehabCost),
        noi: parseNumericInput(noi),
        cap_rate: parseNumericInput(capRate),
        loan_amount: parseNumericInput(loanAmount),
        interest_rate: parseNumericInput(interestRate),
        loan_term_years: parseNumericInput(loanTermYears),
        note: note || null,
    };

    try {
      const { error: insertError } = await supabase
        .from('deals')
        .insert(dealData); // Insert the prepared data object

      if (insertError) {
        console.error('[AddDealForm] Error inserting deal:', insertError);
        throw insertError;
      }

      setSuccess('Deal added successfully!');
      // Clear the form
      setDealName('');
      setAddress('');
      setStatus('');
      setPropertyType('');
      setPurchasePrice('');
      setArv('');
      setRehabCost('');
      setNoi('');
      setCapRate('');
      setLoanAmount('');
      setInterestRate('');
      setLoanTermYears('');
      setNote('');
      
      onDealAdded(); 

      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to add deal.');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId, dealName, address, status, propertyType, purchasePrice, arv, rehabCost, noi, capRate, loanAmount, interestRate, loanTermYears, note, onDealAdded]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${!compact && 'p-4 border rounded-lg bg-white shadow-sm'}`}>
      {!compact && <h3 className="text-lg font-semibold border-b pb-2">Add New Deal</h3>}
      
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* In compact mode, show a more condensed layout with just essential fields */}
      {compact ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealName">Deal Name</Label>
              <Input 
                id="dealName"
                type="text"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                placeholder="e.g., Main St Property"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main St, Anytown"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {dealStatuses.map((stat) => (
                    <SelectItem key={stat} value={stat}>
                      {stat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Input 
                id="propertyType"
                type="text"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                placeholder="e.g., SFH, Duplex"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input 
                id="purchasePrice"
                type="number"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="e.g., 250000"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading || !userId} className="w-full">
            {isLoading ? 'Adding Deal...' : 'Add Deal'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dealName">Deal Name</Label>
            <Input 
              id="dealName"
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="e.g., Main St Property"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, Anytown"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={setStatus} // Use onValueChange to update state
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {dealStatuses.map((stat) => (
                  <SelectItem key={stat} value={stat}>
                    {stat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Input 
              id="propertyType"
              type="text"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              placeholder="e.g., SFH, Duplex"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input 
              id="purchasePrice"
              type="number"
              step="any"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g., 250000"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="arv">ARV ($)</Label>
            <Input 
              id="arv"
              type="number"
              step="any"
              value={arv}
              onChange={(e) => setArv(e.target.value)}
              placeholder="e.g., 350000"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="rehabCost">Rehab Cost ($)</Label>
            <Input 
              id="rehabCost"
              type="number"
              step="any"
              value={rehabCost}
              onChange={(e) => setRehabCost(e.target.value)}
              placeholder="e.g., 50000"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="noi">Est. Annual NOI ($)</Label>
            <Input 
              id="noi"
              type="number"
              step="any"
              value={noi}
              onChange={(e) => setNoi(e.target.value)}
              placeholder="e.g., 24000"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="capRate">Cap Rate (%)</Label>
            <Input 
              id="capRate"
              type="number"
              step="any"
              value={capRate}
              onChange={(e) => setCapRate(e.target.value)}
              placeholder="e.g., 8.5"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="loanAmount">Loan Amount ($)</Label>
            <Input 
              id="loanAmount"
              type="number"
              step="any"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="e.g., 200000"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input 
              id="interestRate"
              type="number"
              step="any"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="e.g., 7.25"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
            <Input 
              id="loanTermYears"
              type="number"
              step="1"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
              placeholder="e.g., 30"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <div className="col-span-1 md:col-span-2">
        <Label htmlFor="note">Notes</Label>
        <Textarea 
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any relevant notes about the deal..."
          disabled={isLoading}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading || !userId}>
        {isLoading ? 'Adding Deal...' : 'Add Deal'}
      </Button>
    </form>
  );
} 