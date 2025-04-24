import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In | GenieOS',
  description: 'Log in to your GenieOS account',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
} 