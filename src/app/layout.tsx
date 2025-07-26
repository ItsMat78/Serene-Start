import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider, ThemeBody } from '@/hooks/use-theme';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Serene Start',
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path d=%22M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39z%22 fill=%22black%22/></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,701&display=swap" rel="stylesheet" />
      </head>
      <ThemeProvider>
        <AuthProvider>
          <ThemeBody>
            {children}
            <Toaster />
          </ThemeBody>
        </AuthProvider>
      </ThemeProvider>
    </html>
  );
}
