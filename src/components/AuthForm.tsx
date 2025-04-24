'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from './AuthProvider';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react'; // For alert icon

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  // console.log('[AuthForm] Component function start. Mode:', mode);

  const searchParams = useSearchParams();
  const { signIn, signUp, user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  
  useEffect(() => {
    // console.log('[AuthForm] useEffect for searchParams/error running...');
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams, user]);

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    setShowConfirmationMessage(false);
  }, [mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    // console.log('[AuthForm] !!! handleSubmit function entered !!!');
    event.preventDefault();
    
    // console.log(`[AuthForm] handleSubmit triggered for mode: ${mode}`);
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setShowConfirmationMessage(false);

    try {
      if (mode === 'login') {
        // console.log('[AuthForm] Attempting signIn:', formData.email);
        const result = await signIn(formData.email, formData.password);
        // console.log('[AuthForm] signIn result:', result);
        if (!result.success) {
          console.error('[AuthForm] signIn failure:', result.error); // Keep
          setError(result.error?.message || 'Login failed. Please check your credentials.');
        } else {
          // console.log('[AuthForm] signIn success. Parent page will handle redirect.');
          setSuccessMessage('Login successful! Redirecting...');
        }
      } else { // signup mode
        // console.log('[AuthForm] Attempting signUp:', formData.email);
        const result = await signUp(formData.email, formData.password, { data: { full_name: formData.name } });
        // console.log('[AuthForm] signUp result:', result);
        if (!result.success) {
          console.error('[AuthForm] signUp failure:', result.error); // Keep
          setError(result.error?.message || 'Sign up failed. Please try again.');
        } else {
          // console.log('[AuthForm] signUp success:', result);
          if (result.message) {
            // console.log('[AuthForm] Sign up needs email confirmation.');
            setShowConfirmationMessage(true);
          } else {
            // console.log('[AuthForm] signUp success with session. Redirect pending...');
            // Parent page handles redirect
          }
        }
      }
    } catch (err: any) {
      console.error('[AuthForm] Error during handleSubmit:', err); // Keep
      setError(err.message || 'An unexpected error occurred');
    } finally {
      // console.log('[AuthForm] handleSubmit finally block: setting isLoading false.');
      setIsLoading(false);
    }
  }, [mode, formData, signIn, signUp, setIsLoading, setError, setSuccessMessage, setShowConfirmationMessage, router]);

  // console.log(`[AuthForm] Pre-render state: isLoading=${isLoading}, success=${!!successMessage}, authLoading=${authLoading}`);

  if (authLoading) {
    // console.log('[AuthForm] Rendering loading state (authLoading)');
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading authentication status...</p>
        </div>
      </div>
    );
  }

  // console.log('[AuthForm] Rendering the main form UI');
  
  const isButtonDisabled = isLoading || successMessage !== null || showConfirmationMessage;
  // console.log(`[AuthForm] Button state: disabled=${isButtonDisabled} (isLoading=${isLoading}, success=${successMessage})`);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Log in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-gray-600">
          {mode === 'login'
            ? "Enter your credentials to access your account"
            : "Sign up to start analyzing real estate deals"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-800">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {showConfirmationMessage && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Check Your Email</AlertTitle>
          <AlertDescription>
            Sign up successful! Please check your email ({formData.email}) for a confirmation link to complete the process.
          </AlertDescription>
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {mode === 'signup' && (
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="mt-1">
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="example@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="●●●●●●●●"
              minLength={8}
              disabled={isLoading}
            />
          </div>
          {mode === 'signup' && (
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters
            </p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={isButtonDisabled}
          >
            {isLoading
              ? (mode === 'login' ? 'Logging in...' : 'Signing up...')
              : (mode === 'login' ? 'Log in' : 'Sign up')}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
} 