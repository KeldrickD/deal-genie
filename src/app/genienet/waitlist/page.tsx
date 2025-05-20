'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// Define a type for the waitlist entry 
interface WaitlistEntry {
  email: string;
  name: string | null;
  product: string;
  created_at: string;
}

export default function GenienetWaitlistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create the entry object with the correct type
      const waitlistEntry: WaitlistEntry = {
        email,
        name: name || null,
        product: 'genienet',
        created_at: new Date().toISOString()
      };
      
      // Insert into waitlist table
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert(waitlistEntry as any); // Using 'as any' as a temporary workaround for type issues
      
      if (insertError) throw insertError;
      
      setIsSubmitted(true);
    } catch (err: any) {
      if (err?.message?.includes('duplicate key value') || err?.message?.includes('unique constraint')) {
        setError('This email is already on our waitlist');
      } else {
        console.error('Error submitting to waitlist:', err);
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="border shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Join the GenieNet Waitlist</CardTitle>
          <CardDescription className="text-lg mt-2">
            Be the first to access our exclusive AI-powered real estate network
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">You're on the list!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for joining the GenieNet waitlist. We'll notify you when we launch.
              </p>
              <Link href="/dashboard" passHref>
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name (optional)
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address*
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Joining...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="text-center text-sm text-gray-500 border-t pt-4">
          By joining our waitlist, you agree to receive updates about GenieNet. 
          We'll never share your information with third parties.
        </CardFooter>
      </Card>
    </div>
  );
} 