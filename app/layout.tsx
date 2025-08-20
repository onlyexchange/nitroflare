// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://only.exchange'),
  title: {
    default: 'Only.Exchange — Buy Premium Filehost Keys with Crypto',
    template: '%s — Only.Exchange',
  },
  description:
    'Instant email delivery for NitroFlare and more. Pay with BTC, ETH, SOL, BNB, LTC, USDT, USDC. Unique address per order, 30-minute price lock.',
  keywords: [
    'NitroFlare keys',
    'filehost premium',
    'crypto checkout',
    'USDT',
    'USDC',
    'BTC',
    'ETH',
  ],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }, // or '/favicon.ico'
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    type: 'website',
    url: 'https://only.exchange',
    siteName: 'Only.Exchange',
    title: 'Only.Exchange — Buy Premium Filehost Keys with Crypto',
    description:
      'Instant email delivery. Unique address per order. Pay in BTC, ETH, SOL, BNB, LTC, USDT, USDC.',
    images: [
      {
        url: '/og.png', // put a 1200x630 image in /public
        width: 1200,
        height: 630,
        alt: 'Only.Exchange — crypto checkout for filehost keys',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Only.Exchange — Buy Premium Filehost Keys with Crypto',
    description:
      'Instant email delivery. Unique address per order. Pay in BTC, ETH, SOL, BNB, LTC, USDT, USDC.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
