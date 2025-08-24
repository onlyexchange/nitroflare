

export type AccountSku = { id: string; label: string; priceUSD: number; wasUSD?: number };
export type AccountProduct = {
  slug: string;
  name: string;
  blurb: string;
  vibe?: { ring: string; glow: string };
  skus: AccountSku[];
};

export const ACCOUNTS: AccountProduct[] = [
  {
    slug: 'demo-game-account',
    name: 'Demo Game Account',
    blurb: 'Instant delivery. Secure. Refund-friendly.',
    vibe: {
      ring: 'from-fuchsia-500/70 via-purple-500/60 to-indigo-500/70',
      glow: 'shadow-[0_0_28px_rgba(168,85,247,0.28)]',
    },
    skus: [
      { id: 'demo-basic', label: 'Basic (24h warranty)', priceUSD: 4.99 },
      { id: 'demo-pro',   label: 'Pro (7-day warranty)', priceUSD: 9.99, wasUSD: 14.99 },
    ],
  },
];
