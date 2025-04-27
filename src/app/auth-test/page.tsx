'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Create a loading placeholder
function LoadingPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      <p>Loading authentication test...</p>
    </div>
  );
}

// Dynamically import the actual auth test component with SSR disabled
const AuthTestContent = dynamic(
  () => import('./auth-test-content'),
  { ssr: false }
);

export default function AuthTestPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AuthTestContent />
    </Suspense>
  );
} 