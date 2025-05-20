import { redirect } from 'next/navigation';

export default function AuthPage() {
  // Simply redirect to the login page
  redirect('/login');
  
  // This content won't be shown due to the redirect, but is here for completeness
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication</h1>
      <p>Redirecting to login page...</p>
    </div>
  );
} 