import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logging Out | Deal Genie',
  description: 'Signing out of your Deal Genie account',
};

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return children;
} 