import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { NafdacUnavailablePage } from '@/components/nafdac-unavailable-page';
import { isNafdacUnavailableClient } from '@/lib/nafdac-availability';
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '9ja Checkr — Check NAFDAC registration numbers instantly',
  description:
    'Free product lookup: enter a NAFDAC number and see public register details in seconds. For shoppers and businesses. Optional API for developers. Independent — not affiliated with NAFDAC.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nafdacDown = isNafdacUnavailableClient();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${outfit.variable} h-full scroll-smooth antialiased overflow-x-hidden`}
    >
      <body className="min-h-full min-w-0 overflow-x-hidden font-sans text-[15px] leading-relaxed tracking-[-0.01em]">
        <ThemeProvider>
          {nafdacDown ? (
            <NafdacUnavailablePage />
          ) : (
            <QueryProvider>{children}</QueryProvider>
          )}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
