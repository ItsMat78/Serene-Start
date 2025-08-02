import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
// Correctly import AppProvider and ThemeBody from the refactored file
import { AppProvider } from '@/hooks/use-theme';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Serenity Start',
  description: 'A personalized start page for focus and productivity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path d=%22M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39z%22 fill=%22black%22/></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,701&display=swap" rel="stylesheet" />
      </head>
      {/* Wrap the entire application in the AuthProvider and our new AppProvider */}
      <AuthProvider>
        <AppProvider>
          <body className="font-body antialiased">
            {children}
            <Toaster />
          </body>
        </AppProvider>
      </AuthProvider>
    </html>
  );
}
