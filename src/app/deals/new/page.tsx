'use client'; // Mark as a Client Component because we use hooks (useFormState, useFormStatus)

import React, { useState } from 'react'; // Keep React, add useState for server error
import { useRouter } from 'next/navigation'; // For manual redirect on success
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from 'lucide-react'; // Icon for error message
import { toast } from 'sonner'; // Import toast
import { addDealAction } from '../actions'; // Import action
import { dealSchema, DealFormData } from '@/lib/schemas'; // Import schema and inferred type
import { DEAL_STATUSES, PROPERTY_TYPES } from '@/lib/constants'; // Import constants

export default function AddDealPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control, // Use control prop for Controller
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: { // Provide default values consistent with schema
      deal_name: '',
      status: '', // Or a default status if desired
      address: null,
      property_type: null,
      purchase_price: null,
      arv: null,
      rehab_cost: null,
      noi: null,
      loan_amount: null,
      interest_rate: null,
      loan_term_years: null,
      note: null,
    },
  });

  // Function to handle form submission
  const processForm: SubmitHandler<DealFormData> = async (data) => {
    setServerError(null); // Clear previous server errors

    // Prepare data for server action (react-hook-form gives parsed data)
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Call the server action directly
    // We need to pass a dummy prev state because the action expects it
    const result = await addDealAction({ error: null, success: false }, formData);

    if (result?.error) {
      setServerError(result.error); // Store server error
      toast.error(result.error);
    } else {
      // Server action handles redirect on success, but good to have a fallback
      toast.success("Deal added successfully!");
      // Action should redirect, but if not, push manually
      // router.push('/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Add New Deal</h1>
        
        {/* Use react-hook-form handleSubmit */}
        <form onSubmit={handleSubmit(processForm)} className="space-y-6">

          {/* Deal Name */}
          <div>
            <Label htmlFor="deal_name">Deal Name</Label>
            <Input 
              id="deal_name" 
              {...register("deal_name")} 
              required // Keep HTML required for basic checks
              placeholder="e.g., 123 Main St Flip" 
              aria-invalid={errors.deal_name ? "true" : "false"}
            />
            {errors.deal_name && <p className="text-sm text-red-600 mt-1">{errors.deal_name.message}</p>}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              {...register("address")} 
              placeholder="e.g., 123 Main St, Anytown, CA 91234" 
              aria-invalid={errors.address ? "true" : "false"}
            />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
          </div>

          {/* Status & Property Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }} // Add client-side required rule
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                    value={field.value || undefined} // Ensure value is controlled
                    required // Keep HTML required for basic checks
                  >
                    <SelectTrigger id="status" aria-invalid={errors.status ? "true" : "false"}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_STATUSES.map((stat) => (
                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
            </div>
            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Controller
                name="property_type"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                    value={field.value || undefined} // Ensure value is controlled
                  >
                    <SelectTrigger id="property_type" aria-invalid={errors.property_type ? "true" : "false"}>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.property_type && <p className="text-sm text-red-600 mt-1">{errors.property_type.message}</p>}
            </div>
          </div>

          <h3 className="text-lg font-semibold border-t pt-4 mt-6">Financials</h3>
          {/* Financial Fields - Apply register and error display pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Example: Purchase Price */}
             <div>
               <Label htmlFor="purchase_price">Purchase Price ($)</Label>
               <Input 
                 id="purchase_price" 
                 {...register("purchase_price")} 
                 type="number" step="0.01" 
                 placeholder="e.g., 150000" 
                 aria-invalid={errors.purchase_price ? "true" : "false"}
               />
               {errors.purchase_price && <p className="text-sm text-red-600 mt-1">{errors.purchase_price.message}</p>}
             </div>
             {/* Repeat for arv, rehab_cost, noi */} 
              <div>
                <Label htmlFor="arv">After Repair Value (ARV) ($)</Label>
                <Input id="arv" {...register("arv")} type="number" step="0.01" placeholder="e.g., 250000" aria-invalid={errors.arv ? "true" : "false"}/>
                {errors.arv && <p className="text-sm text-red-600 mt-1">{errors.arv.message}</p>}
              </div>
              <div>
                <Label htmlFor="rehab_cost">Rehab Cost ($)</Label>
                <Input id="rehab_cost" {...register("rehab_cost")} type="number" step="0.01" placeholder="e.g., 30000" aria-invalid={errors.rehab_cost ? "true" : "false"}/>
                {errors.rehab_cost && <p className="text-sm text-red-600 mt-1">{errors.rehab_cost.message}</p>}
              </div>
              <div>
                <Label htmlFor="noi">Est. Annual NOI ($)</Label>
                <Input id="noi" {...register("noi")} type="number" step="0.01" placeholder="e.g., 12000" aria-invalid={errors.noi ? "true" : "false"}/>
                {errors.noi && <p className="text-sm text-red-600 mt-1">{errors.noi.message}</p>}
              </div>
          </div>

          <h3 className="text-lg font-semibold border-t pt-4 mt-6">Financing</h3>
          {/* Financing Fields - Apply register and error display pattern */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="loan_amount">Loan Amount ($)</Label>
                <Input id="loan_amount" {...register("loan_amount")} type="number" step="0.01" placeholder="e.g., 120000" aria-invalid={errors.loan_amount ? "true" : "false"}/>
                {errors.loan_amount && <p className="text-sm text-red-600 mt-1">{errors.loan_amount.message}</p>}
              </div>
              <div>
                <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                <Input id="interest_rate" {...register("interest_rate")} type="number" step="0.01" placeholder="e.g., 6.5" aria-invalid={errors.interest_rate ? "true" : "false"}/>
                {errors.interest_rate && <p className="text-sm text-red-600 mt-1">{errors.interest_rate.message}</p>}
              </div>
              <div>
                <Label htmlFor="loan_term_years">Loan Term (Years)</Label>
                <Input id="loan_term_years" {...register("loan_term_years")} type="number" step="1" placeholder="e.g., 30" aria-invalid={errors.loan_term_years ? "true" : "false"}/>
                {errors.loan_term_years && <p className="text-sm text-red-600 mt-1">{errors.loan_term_years.message}</p>}
              </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="note">Notes</Label>
            <Textarea 
              id="note" 
              {...register("note")} 
              placeholder="Add any relevant notes about the deal..." 
              aria-invalid={errors.note ? "true" : "false"}
            />
             {errors.note && <p className="text-sm text-red-600 mt-1">{errors.note.message}</p>}
          </div>
          
          {/* Display Server Error Message if any */}
          {serverError && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">Server Error: {serverError}</p>
            </div>
          )}
          
          {/* Use isSubmitting for button state */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Deal...' : 'Add Deal'}
          </Button>

        </form>
      </div>
    </div>
  );
} 