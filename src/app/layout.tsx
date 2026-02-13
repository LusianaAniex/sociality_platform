import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Sociality',
  description: 'Creating unforgettable moments',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='bg-base-black text-base-white min-h-screen antialiased flex flex-col'>
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
