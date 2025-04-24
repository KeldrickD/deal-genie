// src/app/deals/[dealId]/page.tsx (Server Component Wrapper)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import DealDetailClient from './DealDetailClient';
import type { Database } from '@/types/supabase';

// Define props type including params
interface DealDetailPageProps {
  params: {
    dealId: string;
  };
}

// Server component to fetch data and check auth
export default async function DealDetailPage({ params }: DealDetailPageProps) {
  // Extract dealId from params
  const dealId = params.dealId;
  console.log('SERVER: DealDetailPage rendering for deal ID:', dealId);
  
  // Using cookies() as a synchronous function (compatible with Next.js 14)
  const cookieStore = cookies();
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Silently catch errors when trying to set cookies in Server Components
            // This typically happens during static/build time rendering
            console.log('Failed to set cookie:', error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // Silently catch errors when trying to remove cookies in Server Components
            console.log('Failed to remove cookie:', error);
          }
        },
      },
    }
  );
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log('SERVER: User authentication check result:', user ? `Authenticated (${user.id})` : 'Not authenticated');
  
  if (!user) {
    console.log('SERVER: No authenticated user found, redirecting to login');
    redirect('/login');
  }
  
  // Fetch the deal data
  const { data: deal, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();
  
  if (error) {
    console.log('SERVER: Error fetching deal:', error.message);
    return <div className="p-8">Error loading deal: {error.message}</div>;
  }
  
  if (!deal) {
    console.log('SERVER: Deal not found');
    return <div className="p-8">Deal not found</div>;
  }
  
  console.log('SERVER: Deal data fetched successfully, rendering client component');
  
  return (
    <div className="debug-container">
      <p className="text-xs text-gray-400 mb-2">Deal ID: {dealId}</p>
      <DealDetailClient 
        dealId={dealId} 
        initialDeal={deal} 
      />
    </div>
  );
}

// Revalidate this page on demand or every hour, for example
// export const revalidate = 3600; 