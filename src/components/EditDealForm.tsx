'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { updateDealAction } from '../app/deals/actions';
import { toast } from 'sonner';
import { DEAL_STATUSES, PROPERTY_TYPES } from '@/lib/constants';
import { dealSchema, DealFormData } from '@/lib/schemas';

type Deal = Database['public']['Tables']['deals']['Row'];

interface EditDealFormProps {
  deal: Deal;
  onDealUpdated: () => void;
  onCancel: () => void;
  supabase: SupabaseClient<Database> | null;
}

export default function EditDealForm({ deal, onDealUpdated, onCancel, supabase }: EditDealFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    mode: 'onBlur',
    defaultValues: {
      deal_name: deal.deal_name || '',
      status: deal.status || undefined,
      address: deal.address || null,
      property_type: deal.property_type || undefined,
      purchase_price: deal.purchase_price ?? null,
      arv: deal.arv ?? null,
      rehab_cost: deal.rehab_cost ?? null,
      noi: deal.noi ?? null,
      loan_amount: deal.loan_amount ?? null,
      interest_rate: deal.interest_rate ?? null,
      loan_term_years: deal.loan_term_years ?? null,
      note: deal.note || null,
    },
  });

  const processEdit: SubmitHandler<DealFormData> = async (data) => {
    setServerError(null); 

    const formData = new FormData();
    formData.append('dealId', deal.id);
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    const result = await updateDealAction({ error: null, success: false }, formData);

    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
    } else if (result?.success) {
      toast.success("Deal updated successfully!");
      onDealUpdated();
    }
  };

  return (
    <form onSubmit={handleSubmit(processEdit)} className="space-y-4 p-4 border rounded-lg bg-gray-50 shadow-sm mt-4">
      <h3 className="text-lg font-semibold border-b pb-2">Edit Deal: {deal.deal_name || 'Unnamed Deal'}</h3>
      
      {serverError && (
         <p className="text-sm text-red-600 mt-1">Server Error: {serverError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`editDealName-${deal.id}`}>Deal Name</Label>
          <Input 
            id={`editDealName-${deal.id}`}
            {...register("deal_name")} 
            required 
            placeholder="e.g., Main St Property"
            aria-invalid={errors.deal_name ? "true" : "false"}
          />
          {errors.deal_name && <p className="text-sm text-red-600 mt-1">{errors.deal_name.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editAddress-${deal.id}`}>Address</Label>
          <Input 
            id={`editAddress-${deal.id}`}
            {...register("address")} 
            placeholder="e.g., 123 Main St, Anytown"
             aria-invalid={errors.address ? "true" : "false"}
          />
           {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editStatus-${deal.id}`}>Status</Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value || undefined} 
                required
              >
                <SelectTrigger id={`editStatus-${deal.id}`} aria-invalid={errors.status ? "true" : "false"}>
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
          <Label htmlFor={`editPropertyType-${deal.id}`}>Property Type</Label>
          <Controller
            name="property_type"
            control={control}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value || undefined} 
              >
                <SelectTrigger id={`editPropertyType-${deal.id}`} aria-invalid={errors.property_type ? "true" : "false"}>
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
         <div>
          <Label htmlFor={`editPurchasePrice-${deal.id}`}>Purchase Price ($)</Label>
          <Input 
            id={`editPurchasePrice-${deal.id}`}
            {...register("purchase_price")} 
            type="number" step="0.01" 
            placeholder="e.g., 250000"
            aria-invalid={errors.purchase_price ? "true" : "false"}
          />
          {errors.purchase_price && <p className="text-sm text-red-600 mt-1">{errors.purchase_price.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editArv-${deal.id}`}>ARV ($)</Label>
          <Input 
            id={`editArv-${deal.id}`}
            {...register("arv")} 
            type="number" step="0.01" 
            placeholder="e.g., 350000"
            aria-invalid={errors.arv ? "true" : "false"}
           />
           {errors.arv && <p className="text-sm text-red-600 mt-1">{errors.arv.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editRehabCost-${deal.id}`}>Rehab Cost ($)</Label>
          <Input 
            id={`editRehabCost-${deal.id}`}
            {...register("rehab_cost")} 
            type="number" step="0.01" 
            placeholder="e.g., 50000"
            aria-invalid={errors.rehab_cost ? "true" : "false"}
          />
          {errors.rehab_cost && <p className="text-sm text-red-600 mt-1">{errors.rehab_cost.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editNoi-${deal.id}`}>Est. Annual NOI ($)</Label>
          <Input 
            id={`editNoi-${deal.id}`}
            {...register("noi")} 
            type="number" step="0.01" 
            placeholder="e.g., 24000"
            aria-invalid={errors.noi ? "true" : "false"}
          />
          {errors.noi && <p className="text-sm text-red-600 mt-1">{errors.noi.message}</p>}
        </div>
         <div className="md:col-span-2">
            <h4 className="text-md font-semibold mb-2 mt-2 border-t pt-3">Financing (Optional)</h4>
         </div>
        <div>
          <Label htmlFor={`editLoanAmount-${deal.id}`}>Loan Amount ($)</Label>
          <Input 
            id={`editLoanAmount-${deal.id}`}
            {...register("loan_amount")} 
            type="number" step="0.01" 
            placeholder="e.g., 200000"
            aria-invalid={errors.loan_amount ? "true" : "false"}
          />
          {errors.loan_amount && <p className="text-sm text-red-600 mt-1">{errors.loan_amount.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editInterestRate-${deal.id}`}>Interest Rate (%)</Label>
          <Input 
            id={`editInterestRate-${deal.id}`}
            {...register("interest_rate")} 
            type="number" step="0.01" 
            placeholder="e.g., 5.5"
            aria-invalid={errors.interest_rate ? "true" : "false"}
          />
           {errors.interest_rate && <p className="text-sm text-red-600 mt-1">{errors.interest_rate.message}</p>}
        </div>
        <div>
          <Label htmlFor={`editLoanTerm-${deal.id}`}>Loan Term (Years)</Label>
          <Input 
            id={`editLoanTerm-${deal.id}`}
            {...register("loan_term_years")} 
            type="number" step="1" 
            placeholder="e.g., 30"
            aria-invalid={errors.loan_term_years ? "true" : "false"}
          />
           {errors.loan_term_years && <p className="text-sm text-red-600 mt-1">{errors.loan_term_years.message}</p>}
        </div>
      </div>

      <div className="pt-4 border-t">
         <Label htmlFor={`editNote-${deal.id}`}>Notes</Label>
         <Textarea
            id={`editNote-${deal.id}`}
            {...register("note")} 
            placeholder="Update notes here..."
            rows={4}
            aria-invalid={errors.note ? "true" : "false"}
         />
         {errors.note && <p className="text-sm text-red-600 mt-1">{errors.note.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}> 
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 