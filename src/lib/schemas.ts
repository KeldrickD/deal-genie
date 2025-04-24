import * as z from 'zod';

// Define AND Export Zod schema for deal form data
export const dealSchema = z.object({
  // Required fields
  deal_name: z.string().min(1, { message: "Deal Name is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  
  // Optional fields
  address: z.string().nullable().optional(),
  property_type: z.string().nullable().optional(),
  note: z.string().nullable().optional(),

  // Numeric fields (coercing from string, allowing null/empty)
  purchase_price: z.coerce.number().positive().nullable().optional(),
  arv: z.coerce.number().positive().nullable().optional(),
  rehab_cost: z.coerce.number().positive().nullable().optional(),
  noi: z.coerce.number().nullable().optional(), // NOI can be negative
  loan_amount: z.coerce.number().positive().nullable().optional(),
  interest_rate: z.coerce.number().positive().nullable().optional(),
  loan_term_years: z.coerce.number().int().positive().nullable().optional(),
});

// Infer the type for client-side form usage
export type DealFormData = z.infer<typeof dealSchema>; 