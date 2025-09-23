import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '~/lib/registry';
import './globals.css';

import Header from '~/components/Header';
import Breadcrumbs from '~/components/Breadcrumbs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from '~/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Business Monitor App',
  description: 'Business Monitor App',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
  ],
};

export const viewport: Viewport = {
  themeColor: '#111827',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body
          className={`${inter.className} bg-gray-50 flex flex-col flex-1 h-full`}
        >
          <StyledComponentsRegistry>
            <Header />
            <Breadcrumbs />
            {children}
          </StyledComponentsRegistry>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
