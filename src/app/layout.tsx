import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '~/lib/registry';
import './globals.css';

import Header from '~/components/Header';
import SignedOutPage from '~/components/SignedOutPage';
import ToastContextProvider from './context/ToastProvider';
import Toast from '~/components/Toast';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Business Monitor App',
  description: 'Business Monitor App',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ToastContextProvider>
        <html lang="en" className="h-full">
          <body
            className={`${inter.className} bg-gray-50 flex flex-col flex-1 h-full`}
          >
            <StyledComponentsRegistry>
              <Header />
              <SignedOut>
                <SignedOutPage />
              </SignedOut>
              <SignedIn>{children}</SignedIn>
            </StyledComponentsRegistry>
            <Toast />
          </body>
        </html>
      </ToastContextProvider>
    </ClerkProvider>
  );
}
