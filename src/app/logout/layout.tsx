import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logging Out | GenieOS',
  description: 'Signing out of your GenieOS account',
};

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return children;
} 