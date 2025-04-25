import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication Status | Deal Genie',
  description: 'Check your authentication status and debug any authentication issues',
};

export default function AuthStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
} 