'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserInvestmentPreferences } from './actions';
import { toast } from 'sonner';

const PROPERTY_TYPES = [
  { id: "single_family", label: "Single Family" },
  { id: "multi_family", label: "Multi Family" },
  { id: "commercial", label: "Commercial" },
  { id: "land", label: "Land" }
];

const MARKETS = [
  { id: "urban", label: "Urban" },
  { id: "suburban", label: "Suburban" },
  { id: "rural", label: "Rural" }
];

const GOALS = [
  { id: "cash_flow", label: "Cash Flow" },
  { id: "appreciation", label: "Appreciation" },
  { id: "tax_benefits", label: "Tax Benefits" },
  { id: "portfolio_growth", label: "Portfolio Growth" }
];

export default function PreferencesForm({ initialData }: { initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handler for form submission
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    
    try {
      const result = await updateUserInvestmentPreferences(formData);
      
      if (result.success) {
        toast.success('Preferences updated successfully');
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Investment Preferences</CardTitle>
        <CardDescription>
          Configure your investment criteria to get more relevant property suggestions
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Property Types */}
          <div className="space-y-3">
            <Label className="text-base">Property Types</Label>
            <p className="text-sm text-muted-foreground">
              Select the types of properties you're interested in
            </p>
            <div className="grid grid-cols-2 gap-4">
              {PROPERTY_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`property-${type.id}`} 
                    name="propertyTypes" 
                    value={type.id}
                    defaultChecked={initialData?.preferred_property_types?.includes(type.id)}
                  />
                  <Label htmlFor={`property-${type.id}`}>{type.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Markets */}
          <div className="space-y-3">
            <Label className="text-base">Target Markets</Label>
            <p className="text-sm text-muted-foreground">
              Select the markets you want to invest in
            </p>
            <div className="grid grid-cols-3 gap-4">
              {MARKETS.map((market) => (
                <div key={market.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`market-${market.id}`} 
                    name="markets" 
                    value={market.id}
                    defaultChecked={initialData?.target_markets?.includes(market.id)}
                  />
                  <Label htmlFor={`market-${market.id}`}>{market.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Investment Goals */}
          <div className="space-y-3">
            <Label className="text-base">Investment Goals</Label>
            <p className="text-sm text-muted-foreground">
              What are your primary investment objectives?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {GOALS.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`goal-${goal.id}`} 
                    name="goals" 
                    value={goal.id}
                    defaultChecked={initialData?.investment_goals?.includes(goal.id)}
                  />
                  <Label htmlFor={`goal-${goal.id}`}>{goal.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Financial Criteria */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minCashOnCash">Minimum Cash-on-Cash ROI (%)</Label>
              <Input 
                id="minCashOnCash" 
                name="minCashOnCash" 
                type="number" 
                min="0"
                step="0.5"
                defaultValue={initialData?.min_cash_on_cash || "8"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRehabBudget">Maximum Rehab Budget ($)</Label>
              <Input 
                id="maxRehabBudget" 
                name="maxRehabBudget" 
                type="number"
                min="0" 
                step="1000"
                defaultValue={initialData?.max_rehab_budget || "25000"}
              />
            </div>
          </div>
          
          {/* Risk Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="riskTolerance">Risk Tolerance</Label>
            <Select name="riskTolerance" defaultValue={initialData?.risk_tolerance || "medium"}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Safe, stable returns</SelectItem>
                <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                <SelectItem value="high">High - Higher risk, higher potential return</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 