import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In | Deal Genie',
  description: 'Log in to your Deal Genie account',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
} 