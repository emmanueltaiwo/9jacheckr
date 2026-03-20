import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

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
  title: '9ja Checkr — NAFDAC number lookup API',
  description:
    'Look up a NAFDAC registration number and get product details as JSON. Free API key after Google sign-in.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${outfit.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full font-sans text-[15px] leading-relaxed tracking-[-0.01em]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
