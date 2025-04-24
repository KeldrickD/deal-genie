import { redirect } from 'next/navigation';

// Simple redirect to the bulk analysis page
export default function AnalyzeCsvPage() {
  redirect('/bulk-analysis');
} 