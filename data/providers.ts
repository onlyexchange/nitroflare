// Types (keep exactly what you use today)
export type Pack = {
  label: string;
  priceUSD: number;
  wasUSD?: number;
  bandwidth?: string;
  planId?: string;
};
export type Provider = {
  slug: string;
  name: string;
  status: 'live' | 'soon';
  blurb: string;
  cta?: string;
  monogram: string;
  vibe: { ring: string; chip: string; mono: string; glow: string };
  packs?: Pack[];
};

// 👇 Move your entire big array from app/filehost/page.tsx into here:
export const PROVIDERS: Provider[] = [
{
    slug: '1fichier',
    name: '1Fichier.com',
    status: 'live',
    blurb: 'Premium GOLD keys — instant email delivery.',
    cta: 'Buy 1Fichier GOLD',
    monogram: '1F',
    vibe: {
      ring: 'from-amber-300/70 via-orange-400/60 to-amber-600/70',
      chip: 'from-amber-400 via-orange-500 to-amber-600',
      mono: 'from-amber-400 via-orange-500 to-amber-600',
      glow: 'shadow-[0_0_28px_rgba(251,146,60,0.28)]',
    },
    packs: [
      { label: '30 Days GOLD', planId: '1f-30', priceUSD: 7.0, wasUSD: 11.95 },
      { label: '1 Year GOLD', planId: '1f-365', priceUSD: 26.95, wasUSD: 44.95 },
      { label: '5 Years GOLD', planId: '1f-1825', priceUSD: 119.95, wasUSD: 199.95 },
    ],
  },
  {
    slug: 'nitroflare',
    name: 'NitroFlare.com',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy NitroFlare Premium',
    monogram: 'N',
    vibe: {
      ring: 'from-sky-400/70 via-cyan-500/60 to-blue-600/70',
      chip: 'from-sky-500 via-cyan-500 to-blue-600',
      mono: 'from-sky-500 via-cyan-500 to-blue-600',
      glow: 'shadow-[0_0_28px_rgba(56,189,248,0.28)]',
    },
    packs: [
      { label: '30 Days', planId: 'nf-30', priceUSD: 8.99, wasUSD: 15, bandwidth: '25 GB/day' },
      { label: '90 Days', planId: 'nf-90', priceUSD: 20.99, wasUSD: 35, bandwidth: '50 GB/day' },
      { label: '180 Days', planId: 'nf-180', priceUSD: 32.99, wasUSD: 55, bandwidth: '75 GB/day' },
      { label: '365 Days', planId: 'nf-365', priceUSD: 59.99, wasUSD: 100, bandwidth: '100 GB/day' },
    ],
  },
  {
    slug: 'rapidgator',
    name: 'Rapidgator.net',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy Rapidgator Premium',
    monogram: 'R',
    vibe: {
      ring: 'from-orange-500/70 via-amber-500/60 to-orange-600/70',
      chip: 'from-orange-500 via-amber-500 to-orange-600',
      mono: 'from-orange-600 via-amber-500 to-orange-400',
      glow: 'shadow-[0_0_28px_rgba(255,134,27,0.35)]',
    },
    packs: [
      { label: '30 Days', planId: 'rg-30', priceUSD: 10.49, wasUSD: 14.99, bandwidth: '1 TB Bandwidth / 1 TB Storage' },
      { label: '90 Days', planId: 'rg-90', priceUSD: 27.99, wasUSD: 39.99, bandwidth: '4 TB Bandwidth / 3 TB Storage' },
      { label: '180 Days', planId: 'rg-180', priceUSD: 34.99, wasUSD: 49.99, bandwidth: '6 TB Bandwidth / 6 TB Storage' },
      { label: '365 Days', planId: 'rg-365', priceUSD: 69.99, wasUSD: 99.99, bandwidth: '12 TB Bandwidth / 12 TB Storage' },
    ],
  },
  {
    slug: 'real-debrid',
    name: 'Real-Debrid.com',
    status: 'live',
    blurb: 'Multi-host premium — high-speed links from many filehosters.',
    cta: 'Buy Real-Debrid Premium',
    monogram: 'R',
    vibe: {
      ring: 'from-emerald-500/70 via-teal-500/60 to-sky-600/70',
      chip: 'from-emerald-500 via-teal-500 to-sky-600',
      mono: 'from-emerald-500 via-teal-500 to-sky-600',
      glow: 'shadow-[0_0_28px_rgba(45,212,191,0.28)]',
    },
    packs: [
      { label: '30 Days', planId: 'rd-30', priceUSD: 3.75, wasUSD: 4.95, bandwidth: 'Up to 2500 Mbps' },
      { label: '90 Days', planId: 'rd-90', priceUSD: 11.95, wasUSD: 14.95, bandwidth: 'Up to 2500 Mbps' },
      { label: '180 Days', planId: 'rd-180', priceUSD: 16.95, wasUSD: 18.95, bandwidth: 'Unlimited traffic*' },
      { label: '360 Days', planId: 'rd-360', priceUSD: 28.95, wasUSD: 34.95, bandwidth: 'Unlimited traffic*' },
    ],
  },
  {
    slug: 'filesfly',
    name: 'FilesFly.cc',
    status: 'live',
    blurb: 'Full-speed downloads, no ads or captchas — keys by email instantly. Includes 1TB storage.',
    cta: 'Buy FilesFly Premium',
    monogram: 'F',
    vibe: {
      ring: 'from-blue-600/70 via-blue-500/60 to-sky-400/70',
      chip: 'from-blue-700 via-blue-600 to-sky-500',
      mono: 'from-blue-700 via-blue-600 to-sky-500',
      glow: 'shadow-[0_0_28px_rgba(59,130,246,0.35)]',
    },
    packs: [
      { label: '31 Days', planId: 'ff-31', priceUSD: 21.0, wasUSD: 35.0, bandwidth: 'Includes 1TB storage' },
      { label: '110 Days', planId: 'ff-110', priceUSD: 66.0, wasUSD: 110.0, bandwidth: 'Includes 1TB storage' },
      { label: '180 Days', planId: 'ff-180', priceUSD: 87.0, wasUSD: 145.0, bandwidth: 'Includes 1TB storage' },
      { label: '365 Days', planId: 'ff-365', priceUSD: 150.0, wasUSD: 250.0, bandwidth: 'Includes 1TB storage' },
    ],
  },
  {
    slug: 'emload',
    name: 'Emload.com',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy Emload Premium',
    monogram: 'E',
    vibe: {
      ring: 'from-[#4DA0FF]/70 via-[#2E79F6]/60 to-[#035DE7]/70',
      chip: 'from-[#4DA0FF] via-[#2E79F6] to-[#035DE7]',
      mono: 'from-[#4DA0FF] via-[#2E79F6] to-[#035DE7]',
      glow: 'shadow-[0_0_28px_rgba(3,93,231,0.28)]',
    },
    packs: [
      { label: '30 Days', planId: 'em-30', priceUSD: 13.95, wasUSD: 19.95, bandwidth: '35 GB/day • 1 TB storage' },
      { label: '90 Days', planId: 'em-90', priceUSD: 34.95, wasUSD: 49.95, bandwidth: '35 GB/day • 1 TB storage' },
      { label: '180 Days', planId: 'em-180', priceUSD: 55.95, wasUSD: 79.95, bandwidth: '35 GB/day • 1 TB storage' },
      { label: '365 Days', planId: 'em-365', priceUSD: 83.95, wasUSD: 119.95, bandwidth: '35 GB/day • 1 TB storage' },
    ],
  },
  {
    slug: 'daofile',
    name: 'DaoFile.com',
    status: 'live',
    blurb: 'High-speed downloads — instant email delivery for premium keys.',
    cta: 'Buy DaoFile Premium',
    monogram: 'D',
    vibe: {
      ring: 'from-[#058CC2]/70 via-[#1E75BE]/60 to-[#2D58A7]/70',
      chip: 'from-[#058CC2] via-[#1E75BE] to-[#2D58A7]',
      mono: 'from-[#058CC2] via-[#1E75BE] to-[#2D58A7]',
      glow: 'shadow-[0_0_28px_rgba(5,140,194,0.28)]',
    },
    packs: [
      { label: '31 Days', planId: 'df-31', priceUSD: 12.99, wasUSD: 19.95, bandwidth: 'Up to 50 GB / 3 days' },
      { label: '90 Days', planId: 'df-90', priceUSD: 27.99, wasUSD: 39.95, bandwidth: 'Up to 50 GB / 3 days' },
      { label: '365 Days', planId: 'df-365', priceUSD: 59.99, wasUSD: 89.95, bandwidth: 'Up to 50 GB / 3 days' },
      { label: '999 Days', planId: 'df-999', priceUSD: 89.99, wasUSD: 129.95, bandwidth: 'Up to 50 GB / 3 days' },
    ],
  },
  {
    slug: 'tezfiles',
    name: 'TezFiles.com',
    status: 'live',
    blurb: 'Premium keys (20–150GB/day), ad-free, instant email delivery.',
    cta: 'Buy TezFiles Premium',
    monogram: 'T',
    vibe: {
      ring: 'from-amber-400/70 via-orange-500/60 to-[#ff861b]/70',
      chip: 'from-amber-500 via-orange-500 to-[#ff861b]',
      mono: 'from-amber-500 via-orange-500 to-[#ff861b]',
      glow: 'shadow-[0_0_28px_rgba(255,134,27,0.28)]',
    },
    packs: [
      { label: 'Premium Max — 30 Days', planId: 'tz-max-30', priceUSD: 27.95, wasUSD: 39.95, bandwidth: '150 GB/day' },
      { label: 'Premium Max — 90 Days', planId: 'tz-max-90', priceUSD: 66.45, wasUSD: 94.95, bandwidth: '150 GB/day' },
      { label: 'Premium Max — 365 Days', planId: 'tz-max-365', priceUSD: 139.95, wasUSD: 199.95, bandwidth: '150 GB/day' },
    ],
  },
  {
    slug: 'alfafile',
    name: 'Alfafile.net',
    status: 'live',
    blurb: 'Ad-free, full-speed downloads with direct links — instant key delivery.',
    cta: 'Buy Alfafile Premium',
    monogram: 'A',
    vibe: {
      ring: 'from-lime-400/70 via-sky-500/60 to-blue-700/70',
      chip: 'from-lime-500 via-sky-500 to-blue-700',
      mono: 'from-lime-500 via-sky-500 to-blue-700',
      glow: 'shadow-[0_0_28px_rgba(56,189,248,0.32)]',
    },
    packs: [
      { label: '30 Days', planId: 'af-30', priceUSD: 14.99, bandwidth: '1 TB bandwidth • 1 TB storage' },
      { label: '90 Days', planId: 'af-90', priceUSD: 39.99, bandwidth: '4 TB bandwidth • 3 TB storage' },
      { label: '180 Days', planId: 'af-180', priceUSD: 49.99, bandwidth: '6 TB bandwidth • 6 TB storage' },
      { label: '365 Days', planId: 'af-365', priceUSD: 99.99, bandwidth: '12 TB bandwidth • 12 TB storage' },
    ],
  },
  {
  slug: 'crockdown',
  name: 'CrockDown.com',
  status: 'live',
  blurb: '100 GB/day on all plans. No ads, no captchas — instant email delivery.',
  cta: 'Buy CrockDown Premium',
  monogram: 'C',
  vibe: {
    // blue-on-blue (distinct from NitroFlare’s cyan mix)
    ring: 'from-sky-500/70 via-blue-600/60 to-indigo-700/70',
    chip: 'from-sky-500 via-blue-600 to-indigo-700',
    mono: 'from-sky-500 via-blue-600 to-indigo-700',
    glow: 'shadow-[0_0_28px_rgba(37,99,235,0.30)]', // blue-600 glow
  },
  packs: [
    { label: '30 Days',  planId: 'cd-30',  priceUSD:  5.99, wasUSD:  9.99, bandwidth: '100 GB/day' },
    { label: '90 Days',  planId: 'cd-90',  priceUSD: 17.99, wasUSD: 24.99, bandwidth: '100 GB/day' },
    { label: '180 Days', planId: 'cd-180', priceUSD: 29.99, wasUSD: 49.99, bandwidth: '100 GB/day' },
    { label: '365 Days', planId: 'cd-365', priceUSD: 49.99, wasUSD: 74.99, bandwidth: '100 GB/day' },
  ],
},
{
  slug: 'dasan',
  name: 'Dasan.co',
  status: 'live',
  blurb: 'GB credit for multi-host premium links (40+ hosts).',
  cta: 'Buy Dasan Credits',
  monogram: 'D',
  vibe: {
    ring: 'from-[#1E2B6A]/70 via-[#24317A]/60 to-[#192766]/70',
    chip: 'from-[#1E2B6A] via-[#24317A] to-[#192766]',
    mono: 'from-[#1E2B6A] via-[#24317A] to-[#192766]',
    glow: 'shadow-[0_0_28px_rgba(30,43,106,0.28)]',
  },
  packs: [
    { label: '35 GB',   planId: 'ds-35',   priceUSD: 2.99,  bandwidth: 'Free daily quota: 0 MB • 30% off' },
    { label: '115 GB',  planId: 'ds-115',  priceUSD: 5.99,  bandwidth: 'Free daily quota: 300 MB • 30% off' },
    { label: '310 GB',  planId: 'ds-310',  priceUSD: 14.99, bandwidth: 'Free daily quota: 500 MB • 30% off' },
    { label: '1000 GB', planId: 'ds-1000', priceUSD: 33.00, bandwidth: 'Free daily 1.2 GB + 2 GB Usenet • 30% off' },
  ],
},
{
  slug: 'ddownload',
  name: 'DDownload.com',
  status: 'live',
  blurb: 'Unlimited speed and 200 GB/day — instant key delivery.',
  cta: 'Buy DDownload Premium',
  monogram: 'D',
  vibe: {
    ring: 'from-[#6ea0ff]/70 via-[#3562da]/60 to-[#153FA6]/70',
    chip: 'from-[#6ea0ff] via-[#3562da] to-[#153FA6]',
    mono: 'from-[#6ea0ff] via-[#3562da] to-[#153FA6]',
    glow: 'shadow-[0_0_28px_rgba(21,63,166,0.28)]',
  },
  packs: [
    { label: '1 Month',   planId: 'dd-30',  priceUSD: 14.99,                 bandwidth: '200 GB/day • parallel downloads' },
    { label: '6 Months',  planId: 'dd-180', priceUSD: 49.99,                 bandwidth: '200 GB/day • parallel downloads' },
    { label: '12 Months', planId: 'dd-365', priceUSD: 39.99, wasUSD: 69.99,  bandwidth: '200 GB/day • parallel downloads' },
  ],
},
{
  slug: 'depositfiles',
  name: 'DepositFiles.com',
  status: 'live',
  blurb: 'GOLD membership keys — instant email delivery.',
  cta: 'Buy DepositFiles GOLD',
  monogram: 'D',
  vibe: {
    ring: 'from-[#ff6a3d]/70 via-[#EF360E]/60 to-[#b51f02]/70',
    chip: 'from-[#ff6a3d] via-[#EF360E] to-[#b51f02]',
    mono: 'from-[#ff6a3d] via-[#EF360E] to-[#b51f02]',
    glow: 'shadow-[0_0_28px_rgba(239,54,14,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'dp-30',  priceUSD: 8.95,  wasUSD: 11.95 },
    { label: '90 Days',  planId: 'dp-90',  priceUSD: 12.95, wasUSD: 19.95 },
    { label: '180 Days', planId: 'dp-180', priceUSD: 29.95, wasUSD: 44.95 },
    { label: '365 Days', planId: 'dp-365', priceUSD: 49.95, wasUSD: 74.95 },
  ],
},
{
  slug: 'drop-download',
  name: 'Drop.Download',
  status: 'live',
  blurb: 'Premium PRO keys — unlimited storage, instant email delivery.',
  cta: 'Buy Drop.Download Premium',
  monogram: 'D',
  vibe: {
    // mint → cyan
    ring: 'from-[#36EEB0]/70 via-[#1CB8E8]/60 to-[#1CB8E8]/70',
    chip: 'from-[#36EEB0] via-[#1CB8E8] to-[#1CB8E8]',
    mono: 'from-[#36EEB0] via-[#1CB8E8] to-[#1CB8E8]',
    glow: 'shadow-[0_0_28px_rgba(28,184,232,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'dd-30',  priceUSD: 30.00,  bandwidth: 'Unlimited storage' },
    { label: '90 Days',  planId: 'dd-90',  priceUSD: 75.00,  bandwidth: 'Unlimited storage' },
    { label: '180 Days', planId: 'dd-180', priceUSD: 120.00, bandwidth: 'Unlimited storage' },
    { label: '365 Days', planId: 'dd-365', priceUSD: 200.00, bandwidth: 'Unlimited storage' },
  ],
},
{
  slug: 'elitefile',
  name: 'EliteFile.net',
  status: 'live',
  blurb: 'No waiting, unlimited downloads — 1 TB storage, 30 GB/day.',
  cta: 'Buy EliteFile Premium',
  monogram: 'E',
  vibe: {
    ring: 'from-[#953EFE]/70 via-[#B85CFF]/60 to-[#DA72FF]/70',
    chip: 'from-[#953EFE] via-[#B85CFF] to-[#DA72FF]',
    mono: 'from-[#953EFE] via-[#B85CFF] to-[#DA72FF]',
    glow: 'shadow-[0_0_28px_rgba(186,104,255,0.32)]',
  },
  packs: [
    { label: '30 Days',  planId: 'ef-30',  priceUSD: 36.00,  bandwidth: '30 GB/day • 1 TB storage' },
    { label: '90 Days',  planId: 'ef-90',  priceUSD: 96.00,  bandwidth: '30 GB/day • 1 TB storage' }, // popular
    { label: '180 Days', planId: 'ef-180', priceUSD: 180.00, bandwidth: '30 GB/day • 1 TB storage' },
    { label: '365 Days', planId: 'ef-365', priceUSD: 300.00, bandwidth: '30 GB/day • 1 TB storage' },
  ],
},
{
  slug: 'ex-load',
  name: 'Ex-Load.com',
  status: 'live',
  blurb: 'Sale pricing • instant email delivery • unlimited speed & storage.',
  cta: 'Buy Ex-Load Premium',
  monogram: 'E',
  vibe: {
    ring: 'from-[#C36259]/70 via-[#a85456]/60 to-[#64444B]/70',
    chip: 'from-[#C36259] via-[#a85456] to-[#64444B]',
    mono: 'from-[#C36259] via-[#a85456] to-[#64444B]',
    glow: 'shadow-[0_0_28px_rgba(195,98,89,0.28)]',
  },
  packs: [
    { label: '30 Days',          planId: 'xl-30',  priceUSD: 12.50, wasUSD: 34,   bandwidth: '1 TB total • 65 GB / 2 days' },
    { label: '90 Days',          planId: 'xl-90',  priceUSD: 29.99, wasUSD: 69,   bandwidth: '3 TB total • 65 GB / 2 days' },
    { label: '180 + 60 Days',    planId: 'xl-180', priceUSD: 79.99, wasUSD: 115,  bandwidth: '6 TB + 2 TB total • 65 GB / 2 days' },
    { label: '365 + 120 Days',   planId: 'xl-365', priceUSD: 99.99, wasUSD: 155,  bandwidth: '12 TB + 4 TB total • 65 GB / 2 days' },
  ],
},
{
  slug: 'fastbit',
  name: 'FastBit.cc',
  status: 'live',
  blurb: '50 GB/day, unlimited speed — instant key by email.',
  cta: 'Buy FastBit Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#05B565]/70 via-emerald-500/60 to-[#39505A]/70',
    chip: 'from-[#05B565] via-emerald-500 to-[#39505A]',
    mono: 'from-[#05B565] via-emerald-500 to-[#39505A]',
    glow: 'shadow-[0_0_28px_rgba(5,181,101,0.28)]',
  },
  packs: [
    { label: '1 Month',   planId: 'fb-30',  priceUSD: 14.95, wasUSD: 24.95, bandwidth: '50 GB/day' },
    { label: '3 Months',  planId: 'fb-180', priceUSD: 42.95, wasUSD: 49.95,                bandwidth: '50 GB/day' },
    { label: '1 Year',  planId: 'fb-365', priceUSD: 89.95,    wasUSD: 99.95,             bandwidth: '50 GB/day' },
  ],
},
{
  slug: 'fastfile',
  name: 'FastFile.cc',
  status: 'live',
  blurb: '150 GB/day • no delays or captchas — instant key by email.',
  cta: 'Buy FastFile Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#4692C3]/70 via-sky-400/60 to-[#4692C3]/70',
    chip: 'from-[#4692C3] via-sky-400 to-[#4692C3]',
    mono: 'from-[#4692C3] via-sky-400 to-[#4692C3]',
    glow: 'shadow-[0_0_28px_rgba(70,146,195,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'ff-30',  priceUSD: 11.95, wasUSD: 19.95, bandwidth: '150 GB/day' },
    { label: '90 Days',  planId: 'ff-90',  priceUSD: 42.95,                 bandwidth: '150 GB/day' },
    { label: '180 Days', planId: 'ff-180', priceUSD: 65.95,                 bandwidth: '150 GB/day' },
    { label: '365 Days', planId: 'ff-365', priceUSD: 95.95,                 bandwidth: '150 GB/day' },
  ],
},
{
  slug: 'fboom',
  name: 'Fboom.me',
  status: 'live',
  blurb: 'Fileboom Premium keys — up to 100GB/day. Instant email delivery.',
  cta: 'Buy Fboom Premium',
  monogram: 'F',
  // Charcoal/grey with orange highlight (#FFA648)
  vibe: {
    ring: 'from-zinc-700/70 via-zinc-800/60 to-zinc-900/70',
    chip: 'from-[#FFA648] via-[#FFA648] to-[#FFA648]', // solid
    mono: 'from-[#FFA648] via-[#FFA648] to-[#FFA648]', // solid
    glow: 'shadow-[0_0_28px_rgba(255,166,72,0.34)]',
  },
  packs: [
    // Show the Max tier first (homepage/filehost list will slice to 4)
    { label: 'Premium Max — 30 Days',  planId: 'fb-max-30',  priceUSD: 34.95,  wasUSD: 46.95,  bandwidth: '100 GB/day • Video streaming' },
    { label: 'Premium Max — 90 Days',  planId: 'fb-max-90',  priceUSD: 79.95,  wasUSD: 109.95, bandwidth: '100 GB/day • Video streaming' },
    { label: 'Premium Max — 365 Days', planId: 'fb-max-365', priceUSD: 199.95, wasUSD: 279.95, bandwidth: '100 GB/day • Video streaming' },
    { label: 'Premium — 30 Days',      planId: 'fb-prem-30', priceUSD: 28.95,                      bandwidth: '20 GB/day' },
  ],
},
{
  slug: 'fikper',
  name: 'Fikper.com',
  status: 'live',
  blurb: 'No-speed-limit downloads, no ads or queues — instant key delivery.',
  cta: 'Buy Fikper Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#0D47A1]/70 via-[#1565C0]/60 to-[#1E88E5]/70',
    chip: 'from-[#0D47A1] via-[#1565C0] to-[#1E88E5]',
    mono: 'from-[#0D47A1] via-[#1565C0] to-[#1E88E5]',
    glow: 'shadow-[0_0_28px_rgba(13,71,161,0.30)]',
  },
  packs: [
    { label: '30 Days',  planId: 'fk-30',  priceUSD: 19.95 },
    { label: '90 Days',  planId: 'fk-90',  priceUSD: 49.95 },
    { label: '180 Days', planId: 'fk-180', priceUSD: 89.95 },
    { label: '365 Days', planId: 'fk-365', priceUSD: 129.95 },
  ],
},
{
  slug: 'fileal',
  name: 'File.al',
  status: 'live',
  blurb: '4TB storage • 30GB/day • up to 100GB uploads — instant key delivery.',
  cta: 'Buy File.al Premium',
  monogram: 'F',
 vibe: {
    // subtle white/silver ring; works on dark home too
    ring: 'from-white via-zinc-100 to-zinc-200',
    // keep solid red accents for identity
    chip: 'from-red-600 via-red-600 to-red-600',
    mono: 'from-red-600 via-red-600 to-red-600',
    // ✨ white glow (not red)
    glow: 'shadow-[0_0_34px_rgba(255,255,255,0.45)]',
  },
  packs: [
    { label: '30 Days',        planId: 'fa-30',   priceUSD: 19.95, wasUSD: 29.95, bandwidth: '30 GB/day • 4 TB storage' },
    { label: '90 Days',        planId: 'fa-90',   priceUSD: 59.95,                  bandwidth: '30 GB/day • 4 TB storage' },
    { label: '365 Days',       planId: 'fa-365',  priceUSD: 99.95,                  bandwidth: '30 GB/day • 4 TB storage' },
    { label: '25 GB Traffic',  planId: 'fa-25gb', priceUSD: 17.95,                  bandwidth: 'One-time data' },
    { label: '50 GB Traffic',  planId: 'fa-50gb', priceUSD: 24.95,                  bandwidth: 'One-time data' },
    { label: '100 GB Traffic', planId: 'fa-100gb',priceUSD: 39.95,                  bandwidth: 'One-time data' },
  ],
},
{
  slug: 'filejoker',
  name: 'FileJoker.net',
  status: 'live',
  blurb: 'Premium & Premium VIP keys — instant email delivery.',
  cta: 'Buy FileJoker Premium',
  monogram: 'F',
  vibe: {
    // teal (Premium) → blue (VIP) → brand steel
    ring: 'from-[#1EB4AA]/70 via-[#5C98CA]/60 to-[#457299]/70',
    chip: 'from-[#1EB4AA] via-[#5C98CA] to-[#457299]',
    mono: 'from-[#1EB4AA] via-[#5C98CA] to-[#457299]',
    glow: 'shadow-[0_0_28px_rgba(92,152,202,0.28)]',
  },
  packs: [
    // Show Premium first so homepage/filehost grids (slice 0..4) display 30/90/180/365
    { label: 'Premium — 30 Days',  planId: 'fj-prem-30',  priceUSD: 18.95, wasUSD: 22.95 },
    { label: 'Premium — 90 Days',  planId: 'fj-prem-90',  priceUSD: 44.95 },
    { label: 'Premium — 180 Days', planId: 'fj-prem-180', priceUSD: 89.95 },
    { label: 'Premium — 365 Days', planId: 'fj-prem-365', priceUSD: 134.95 },

    // VIP tier
    { label: 'Premium VIP — 30 Days',  planId: 'fj-vip-30',  priceUSD: 29.95, wasUSD: 33.95 },
    { label: 'Premium VIP — 90 Days',  planId: 'fj-vip-90',  priceUSD: 73.95 },
    { label: 'Premium VIP — 180 Days', planId: 'fj-vip-180', priceUSD: 109.95 },
    { label: 'Premium VIP — 365 Days', planId: 'fj-vip-365', priceUSD: 169.95 },
  ],
},
{
  slug: 'filesmonster',
  name: 'FilesMonster.com',
  status: 'live',
  blurb: 'Unlimited speed, media streaming, instant start — keys by email.',
  cta: 'Buy FilesMonster Premium',
  monogram: 'F',
  // Light/glass page uses red accents — keep a rich red ring for the card
  vibe: {
    ring: 'from-rose-400/70 via-red-500/60 to-red-600/70',
    chip: 'from-rose-500 via-red-500 to-red-600',
    mono: 'from-rose-500 via-red-500 to-red-600',
    glow: 'shadow-[0_0_28px_rgba(244,63,94,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'fm-30',  priceUSD: 13.95, wasUSD: 17.00 },
    { label: '90 Days',  planId: 'fm-90',  priceUSD: 32.95, wasUSD: 37.00 },
    { label: '180 Days', planId: 'fm-180', priceUSD: 59.95, wasUSD: 66.00 },
    { label: '365 Days', planId: 'fm-365', priceUSD: 99.95, wasUSD: 116.00 },
  ],
},
{
  slug: 'filespace',
  name: 'Filespace.com',
  status: 'live',
  blurb: 'Ad-free, unlimited speed, direct links — instant key delivery.',
  cta: 'Buy Filespace Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#52AEE0]/70 via-sky-400/60 to-[#8ABD3F]/70',
    chip: 'from-[#52AEE0] via-sky-500 to-[#8ABD3F]',
    mono: 'from-sky-500 via-[#52AEE0] to-[#8ABD3F]',
    glow: 'shadow-[0_0_28px_rgba(82,174,224,0.32)]',
  },
  packs: [
    { label: '30 Days',  planId: 'fs-30',  priceUSD: 9.95,  wasUSD: 15.95,  bandwidth: 'Unlimited speed • 500 GB storage' },
    { label: '90 Days',  planId: 'fs-90',  priceUSD: 14.95, wasUSD: 39.95,  bandwidth: 'Unlimited speed • 500 GB storage' },
    { label: '330 Days', planId: 'fs-330', priceUSD: 79.95, wasUSD: 117.95, bandwidth: 'Unlimited speed • 500 GB storage' },
  ],
},
{
  slug: 'file-upload',
  name: 'File-Upload.org',
  status: 'live',
  blurb: 'No waiting, unlimited speed, no ads — instant email delivery.',
  cta: 'Buy File-Upload Premium',
  monogram: 'F',
  vibe: {
    // blue highlight + orange CTA, on white-glass cards
    ring: 'from-[#2C82C9]/70 via-[#62A9DD]/60 to-[#FE5722]/70',
    chip: 'from-[#2C82C9] via-[#62A9DD] to-[#FE5722]',
    mono: 'from-[#2C82C9] via-[#62A9DD] to-[#FE5722]',
    glow: 'shadow-[0_0_28px_rgba(255,87,34,0.25)]',
  },
  packs: [
    { label: '7 Days',   planId: 'fu-7',   priceUSD: 5.95, wasUSD: 5.95 },
    { label: '30 Days',  planId: 'fu-30',  priceUSD: 16.95, wasUSD: 19.95 },
    { label: '90 Days',  planId: 'fu-90',  priceUSD: 24.95, wasUSD: 29.95 },
    { label: '180 Days', planId: 'fu-180', priceUSD: 49.95, wasUSD: 56.95 },
    { label: '365 Days', planId: 'fu-365', priceUSD: 89.95, wasUSD: 99.95 },
    { label: '730 Days', planId: 'fu-730', priceUSD: 129.95, wasUSD: 499.95 },
  ],
},
{
  slug: 'flashbit',
  name: 'FlashBit.cc',
  status: 'live',
  blurb: 'Premium MAX keys — instant delivery. No waiting, no ads, max speeds.',
  cta: 'Buy FlashBit Premium',
  monogram: 'F',
  vibe: {
    // Charcoal ring/mono to match the page bg; red chip as the accent
    ring: 'from-slate-600/70 via-slate-700/70 to-slate-800/70',
    chip: 'from-red-500 via-red-600 to-red-700',
    mono: 'from-slate-700 via-slate-800 to-gray-900',
    glow: 'shadow-[0_0_28px_rgba(15,23,42,0.35)]',
  },
  packs: [
    { label: 'Premium MAX — 30 Days',  planId: 'fb-30',  priceUSD: 12.50, wasUSD: 24.95 },
    { label: 'Premium MAX — 90 Days',  planId: 'fb-90',  priceUSD: 29.75, wasUSD: 59.95 },
    { label: 'Premium MAX — 180 Days', planId: 'fb-180', priceUSD: 49.95, wasUSD: 79.95 },
    { label: 'Premium MAX — 365 Days', planId: 'fb-365', priceUSD: 89.95, wasUSD: 110.00 },
  ],
},
{
  slug: 'gigapeta',
  name: 'GigaPeta.com',
  status: 'live',
  blurb: 'Unlimited speed & threads, direct links — 90GB traffic per 72h.',
  cta: 'Buy GigaPeta Premium',
  monogram: 'G',
  vibe: {
    // white-glass friendly greens
    ring: 'from-emerald-300/70 via-emerald-400/60 to-emerald-600/70',
    chip: 'from-[#66CC66] via-[#59c159] to-[#4fb74f]',
    mono: 'from-emerald-400 via-emerald-500 to-emerald-600',
    glow: 'shadow-[0_0_28px_rgba(102,204,102,0.28)]',
  },
  packs: [
    { label: '3 Days',    planId: 'gp-3',   priceUSD: 4.00 },
    { label: '1 Week',    planId: 'gp-7',   priceUSD: 5.00 },
    { label: '2 Weeks',   planId: 'gp-14',  priceUSD: 8.00 },
    { label: '1 Month',   planId: 'gp-30',  priceUSD: 13.00 },
    { label: '3 Months',  planId: 'gp-90',  priceUSD: 30.00 },
    { label: '6 Months',  planId: 'gp-180', priceUSD: 55.00 },
    { label: '1 Year',    planId: 'gp-365', priceUSD: 90.00 },
  ],
},
{
  slug: 'hitfile',
  name: 'Hitfile.net',
  status: 'live',
  blurb: 'Max speed, ad-free, no timeouts — instant email delivery.',
  cta: 'Buy Hitfile Premium',
  monogram: 'H',
  vibe: {
    ring: 'from-cyan-300/70 via-[#00A5B5]/60 to-teal-600/70',
    chip: 'from-cyan-400 via-[#00A5B5] to-teal-600',
    mono: 'from-cyan-400 via-[#00A5B5] to-teal-600',
    glow: 'shadow-[0_0_28px_rgba(0,165,181,0.28)]',
  },
  packs: [
    { label: '25 Days',     planId: 'hf-25',       priceUSD: 5.95,  wasUSD: 9.95,  bandwidth: '300 GB' },
    { label: '70 Days',     planId: 'hf-70',       priceUSD: 19.95, wasUSD: 24.95, bandwidth: '1400 GB' },
    { label: '150 Days',    planId: 'hf-150',      priceUSD: 39.95, wasUSD: 49.95, bandwidth: '3000 GB' },
    { label: '350 Days',    planId: 'hf-350',      priceUSD: 69.95, wasUSD: 89.95, bandwidth: '7000 GB' },
    { label: '25 Days +',   planId: 'hf-25-plus',  priceUSD: 7.95,  wasUSD: 12.45, bandwidth: '600 GB' },
    { label: '70 Days +',   planId: 'hf-70-plus',  priceUSD: 24.95, wasUSD: 30.45, bandwidth: '2800 GB' },
    { label: '150 Days +',  planId: 'hf-150-plus', priceUSD: 49.95, wasUSD: 62.45, bandwidth: '6000 GB' },
    { label: '350 Days +',  planId: 'hf-350-plus', priceUSD: 99.95, wasUSD: 112.45, bandwidth: '14000 GB' },
  ],
},
{
  slug: 'hotlink',
  name: 'Hotlink.cc',
  status: 'live',
  blurb: '65 GB every 2 days • max speed • direct downloads — instant key delivery.',
  cta: 'Buy Hotlink Premium',
  monogram: 'H',
  vibe: {
    ring: 'from-amber-300/70 via-[#FF9600]/60 to-orange-600/70',
    chip: 'from-amber-400 via-[#FF9600] to-orange-600',
    mono: 'from-amber-400 via-[#FF9600] to-orange-600',
    glow: 'shadow-[0_0_28px_rgba(255,150,0,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'hl-30',  priceUSD: 17.95, wasUSD: 23.95, bandwidth: '65 GB every 2 days' },
    { label: '60 Days',  planId: 'hl-60',  priceUSD: 29.95, wasUSD: 36.95, bandwidth: '65 GB every 2 days' },
    { label: '90 Days',  planId: 'hl-90',  priceUSD: 39.95, wasUSD: 47.95, bandwidth: '65 GB every 2 days' },
    { label: '365 Days', planId: 'hl-365', priceUSD: 99.95, wasUSD: 109.95, bandwidth: '65 GB every 2 days' },
  ],
},
{
  slug: 'jumploads',
  name: 'Jumploads.com',
  status: 'live',
  blurb: '500 GB storage • 2 TB bandwidth — instant key delivery.',
  cta: 'Buy Jumploads Premium',
  monogram: 'J',
vibe: {
    // Subtle blue ring for white/glass background
    ring: 'from-[#8FB8FF]/70 via-[#4D96FF]/60 to-[#2F82FF]/70',
    // Status/label chip = strong blue
    chip: 'from-[#4D96FF] via-[#3A89FF] to-[#2F82FF]',
    // Monogram chip = your brand blue
    mono: 'from-[#3385FF] via-[#2F82FF] to-[#1E6FFF]',
    // Soft blue glow; reads well on white glass
    glow: 'shadow-[0_0_28px_rgba(47,130,255,0.30)]',
  },
  packs: [
    { label: '30 Days',  planId: 'jl-30',  priceUSD: 12.95, wasUSD: 17.95, bandwidth: '500 GB storage • 2 TB bandwidth' },
    { label: '90 Days',  planId: 'jl-90',  priceUSD: 39.95, wasUSD: 43.95, bandwidth: '500 GB storage • 2 TB bandwidth' },
    { label: '180 Days', planId: 'jl-180', priceUSD: 69.95, wasUSD: 70.95, bandwidth: '500 GB storage • 2 TB bandwidth' },
    { label: '365 Days', planId: 'jl-365', priceUSD: 89.95, wasUSD: 107.95, bandwidth: '500 GB storage • 2 TB bandwidth' },
  ],
},
{
  slug: 'k2s',
  name: 'K2S.cc',
  status: 'live',
  blurb: 'Premium / Pro / Max keys — instant email delivery.',
  cta: 'Buy K2S Premium',
  monogram: 'K2',
  vibe: {
    ring: 'from-sky-400/70 via-sky-500/60 to-[#0092D6]/70',
    chip: 'from-sky-500 via-sky-600 to-[#0092D6]',
    mono: 'from-sky-500 via-sky-600 to-[#0092D6]',
    glow: 'shadow-[0_0_28px_rgba(0,146,214,0.28)]',
  },
  packs: [
    { label: '30 Days PRO',  planId: 'k2s-pro-30',  priceUSD: 18.95, wasUSD: 29.94, bandwidth: '50 GB / Day' },
    { label: '90 Days PRO',  planId: 'k2s-pro-90',  priceUSD: 24.95, wasUSD: 71.94, bandwidth: '50 GB / Day' },
    { label: '30 Days MAX',  planId: 'k2s-max-30',  priceUSD: 19.99, wasUSD: 39.99, bandwidth: '100 GB / Day' },
    { label: '365 Days MAX', planId: 'k2s-max-365', priceUSD: 149.99, wasUSD: 299.99, bandwidth: '100 GB / Day' },
  ],
},
{
  slug: 'katfile',
  name: 'KatFile.com',
  status: 'live',
  blurb: 'Premium keys — 100GB/day or 200GB/day tiers. Instant email delivery.',
  cta: 'Buy KatFile Premium',
  monogram: 'K',
  vibe: {
    // white-glass brand with solid blue accent
    ring: 'from-[#66A6E8]/70 via-[#3E86C9]/60 to-[#3074B5]/70',
    chip: 'from-[#66A6E8] via-[#3E86C9] to-[#3074B5]',
    mono: 'from-[#66A6E8] via-[#3E86C9] to-[#3074B5]',
    glow: 'shadow-[0_0_28px_rgba(48,116,181,0.28)]',
  },
  packs: [
    // 100 GB/day
    { label: '30 Days — 100 GB/day',  planId: 'kf-30-100',   priceUSD: 6.95 },
    { label: '60 Days — 100 GB/day',  planId: 'kf-60-100',   priceUSD: 19.95 },
    { label: '365 Days — 100 GB/day', planId: 'kf-365-100',  priceUSD: 29.95 },
    { label: 'Lifetime — 100 GB/day', planId: 'kf-life-100', priceUSD: 49.95 },

    // 200 GB/day
    { label: '30 Days — 200 GB/day',  planId: 'kf-30-200',   priceUSD: 9.95 },
    { label: '60 Days — 200 GB/day',  planId: 'kf-60-200',   priceUSD: 24.95 },
    { label: '365 Days — 200 GB/day', planId: 'kf-365-200',  priceUSD: 49.95 },
    { label: 'Lifetime — 200 GB/day', planId: 'kf-life-200', priceUSD: 69.95 },

    // PRO
    { label: 'Lifetime — PRO',        planId: 'kf-life-pro', priceUSD: 149.99 },
  ],
},
{
  slug: 'kshared',
  name: 'Kshared.com',
  status: 'live',
  blurb: '35 GB/day bandwidth • instant email delivery.',
  cta: 'Buy Kshared Premium',
  monogram: 'K',
  vibe: {
    ring: 'from-[#49A8FF]/70 via-[#1E88FF]/60 to-[#0661E8]/70',
    chip: 'from-[#49A8FF] via-[#1E88FF] to-[#0661E8]',
    mono: 'from-[#49A8FF] via-[#1E88FF] to-[#0661E8]',
    glow: 'shadow-[0_0_28px_rgba(6,97,232,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'ks-30',  priceUSD: 14.95, wasUSD: 19.95,  bandwidth: '35 GB/day • 1 TB storage' },
    { label: '90 Days',  planId: 'ks-90',  priceUSD: 37.95, wasUSD: 49.95,  bandwidth: '35 GB/day • 1 TB storage' },
    { label: '180 Days', planId: 'ks-180', priceUSD: 49.95, wasUSD: 79.95,  bandwidth: '35 GB/day • 1 TB storage' },
    { label: '365 Days', planId: 'ks-365', priceUSD: 89.95, wasUSD: 119.95, bandwidth: '35 GB/day • 1 TB storage' },
  ],
},
{
  slug: 'novafile',
  name: 'NovaFile.org',
  status: 'live',
  blurb: 'Premium & VIP keys — instant email delivery.',
  cta: 'Buy NovaFile',
  monogram: 'N',
  vibe: {
    // Cyan → deep-cyan (matches the site)
    ring: 'from-[#2DA6D8]/70 via-[#1E7CC0]/60 to-[#2DA6D8]/70',
    chip: 'from-[#2DA6D8] via-[#1E7CC0] to-[#2DA6D8]',
    mono: 'from-[#2DA6D8] via-[#1E7CC0] to-[#2DA6D8]',
    glow: 'shadow-[0_0_28px_rgba(30,124,192,0.28)]',
  },
  packs: [
    // Premium
    { label: 'Premium — 30 Days',  planId: 'nv-30',   priceUSD: 9.95,  wasUSD: 14.95 },
    { label: 'Premium — 90 Days',  planId: 'nv-90',   priceUSD: 33.95, wasUSD: 39.95 },
    { label: 'Premium — 180 Days', planId: 'nv-180',  priceUSD: 64.95, wasUSD: 69.95 },
    { label: 'Premium — 365 Days', planId: 'nv-365',  priceUSD: 89.95, wasUSD: 99.95 },

    // Premium VIP
    { label: 'VIP — 30 Days',      planId: 'nv-vip-30',  priceUSD: 16.95, wasUSD: 22.95 },
    { label: 'VIP — 90 Days',      planId: 'nv-vip-90',  priceUSD: 39.95, wasUSD: 49.95 },
    { label: 'VIP — 180 Days',     planId: 'nv-vip-180', priceUSD: 69.95, wasUSD: 79.95 },
    { label: 'VIP — 365 Days',     planId: 'nv-vip-365', priceUSD: 99.95, wasUSD: 109.95 },
  ],
},
{
  slug: 'rarefile',
  name: 'RareFile.net',
  status: 'live',
  blurb: 'Fast, direct downloads — instant premium key delivery.',
  cta: 'Buy RareFile Premium',
  monogram: 'R',
  vibe: {
    ring: 'from-sky-300/70 via-sky-500/60 to-[#007DD0]/70',
    chip: 'from-sky-400 via-sky-500 to-[#007DD0]',
    mono: 'from-sky-400 via-sky-500 to-[#007DD0]',
    glow: 'shadow-[0_0_28px_rgba(0,125,208,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'rf-30',  priceUSD: 7.99,  wasUSD: 12.95 },
    { label: '90 Days',  planId: 'rf-90',  priceUSD: 17.99, wasUSD: 32.95 },
    { label: '180 Days', planId: 'rf-180', priceUSD: 38.99, wasUSD: 53.95 },
    { label: '365 Days', planId: 'rf-365', priceUSD: 49.99, wasUSD: 89.90 },
  ],
},
{
  slug: 'silkfiles',
  name: 'SilkFiles.com',
  status: 'live',
  blurb: 'Super-fast, direct downloads — instant key delivery.',
  cta: 'Buy SilkFiles Premium',
  monogram: 'S',
  vibe: {
    ring: 'from-[#E0664B]/70 via-[#C14E31]/60 to-[#9F3F27]/70',
    chip: 'from-[#E0664B] via-[#C14E31] to-[#9F3F27]',
    mono: 'from-[#E0664B] via-[#C14E31] to-[#9F3F27]',
    glow: 'shadow-[0_0_28px_rgba(193,78,49,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'sf-30',  priceUSD: 19.99, wasUSD: 30.00,  bandwidth: 'Includes 1 TB storage' },
    { label: '90 Days',  planId: 'sf-90',  priceUSD: 59.99, wasUSD: 70.00,  bandwidth: 'Includes 1 TB storage' },
    { label: '180 Days', planId: 'sf-180', priceUSD: 99.99, wasUSD: 130.00, bandwidth: 'Includes 1 TB storage' },
    { label: '365 Days', planId: 'sf-365', priceUSD: 249.99, wasUSD: 270.00, bandwidth: 'Includes 1 TB storage' },
  ],
},
{
  slug: 'subyshare',
  name: 'SubyShare.com',
  status: 'live',
  blurb: '40 GB/day, no ads or waiting — instant email delivery.',
  cta: 'Buy SubyShare Premium',
  monogram: 'S',
  vibe: {
    ring: 'from-[#1AA3CD]/70 via-[#1489AD]/60 to-[#1AA3CD]/70',
    chip: 'from-[#1AA3CD] via-[#1489AD] to-[#1AA3CD]',
    mono: 'from-[#1AA3CD] via-[#1489AD] to-[#1AA3CD]',
    glow: 'shadow-[0_0_28px_rgba(26,163,205,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'ss-30',  priceUSD: 12.95, wasUSD: 19.99, bandwidth: '40 GB/day' },
    { label: '75 Days',  planId: 'ss-75',  priceUSD: 22.95, wasUSD: 29.95, bandwidth: '40 GB/day' },
    { label: '180 Days', planId: 'ss-180', priceUSD: 34.95, wasUSD: 47.45, bandwidth: '40 GB/day' },
    { label: '365 Days', planId: 'ss-365', priceUSD: 72.95, wasUSD: 87.95, bandwidth: '40 GB/day' },
  ],
},
{
  slug: 'takefile',
  name: 'TakeFile.link',
  status: 'live',
  blurb: 'Premium keys — 65 GB every 2 days, instant email delivery.',
  cta: 'Buy TakeFile Premium',
  monogram: 'T',
  vibe: {
    ring: 'from-[#F8A53E]/70 via-[#F7921E]/60 to-[#DE7F10]/70',
    chip: 'from-[#F8A53E] via-[#F7921E] to-[#DE7F10]',
    mono: 'from-[#F8A53E] via-[#F7921E] to-[#DE7F10]',
    glow: 'shadow-[0_0_28px_rgba(247,146,30,0.28)]',
  },
  packs: [
    { label: 'Premium — 30 Days',  planId: 'tf-30',  priceUSD: 20.99, wasUSD: 34.99, bandwidth: '65 GB / 2 days' },
    { label: 'Premium — 60 Days',  planId: 'tf-60',  priceUSD: 38.99, wasUSD: 49.99, bandwidth: '65 GB / 2 days' },
    { label: 'Premium — 90 Days',  planId: 'tf-90',  priceUSD: 62.39, wasUSD: 68.99, bandwidth: '65 GB / 2 days' },
    { label: 'Premium — 365 Days', planId: 'tf-365', priceUSD: 117.99, wasUSD: 129.99, bandwidth: '65 GB / 2 days' },
  ],
},
{
  slug: 'turbobit',
  name: 'Turbobit.net',
  status: 'live',
  blurb: 'Ultra-fast downloads with large traffic limits — instant key delivery.',
  cta: 'Buy Turbobit Premium',
  monogram: 'T',
  vibe: {
    ring: 'from-orange-400/70 via-orange-500/60 to-[#F8641C]/70',
    chip: 'from-orange-500 via-orange-500 to-[#F8641C]',
    mono: 'from-orange-500 via-orange-500 to-[#F8641C]',
    glow: 'shadow-[0_0_28px_rgba(248,100,28,0.28)]',
  },
  packs: [
    { label: '1 Month (Premium)',  planId: 'tb-30',   priceUSD: 6.95,  wasUSD: 9.95,  bandwidth: '600 GB total' },
    { label: '6 Months (Premium)', planId: 'tb-180',  priceUSD: 19.95, wasUSD: 34.95, bandwidth: '3600 GB total' },
    { label: '1 Year (Premium)',   planId: 'tb-365',  priceUSD: 29.95, wasUSD: 59.95, bandwidth: '7200 GB total' },
    { label: '2 Years (Premium)',  planId: 'tb-730',  priceUSD: 39.95, wasUSD: 89.95, bandwidth: '14400 GB total' },
    // If you want PLUS on the card instead, swap these in:
    // { label: '1 Month (PLUS)',  planId: 'tb-plus-30',  priceUSD: 8.95,  wasUSD: 12.95, bandwidth: '1200 GB total' },
    // { label: '6 Months (PLUS)', planId: 'tb-plus-180', priceUSD: 27.95, wasUSD: 44.95, bandwidth: '7200 GB total' },
    // { label: '1 Year (PLUS)',   planId: 'tb-plus-365', priceUSD: 39.95, wasUSD: 74.95, bandwidth: '14400 GB total' },
    // { label: '2 Years (PLUS)',  planId: 'tb-plus-730', priceUSD: 79.95, wasUSD: 124.95, bandwidth: '28800 GB total' },
  ],
},
{
  slug: 'ubiqfile',
  name: 'UbiqFile.com',
  status: 'live',
  blurb: 'Premium Pro keys — MAX speed up to 10 Gbit/s, 55 GB/day, instant email delivery.',
  cta: 'Buy UbiqFile Premium Pro',
  monogram: 'U',
  // UbiqFile vibe (sky blue)
  vibe: {
    ring: 'from-[#3C9ADC]/70 via-[#2B7EBF]/60 to-[#2B7EBF]/70',
    chip: 'from-[#3C9ADC] via-[#2B7EBF] to-[#2B7EBF]',
    mono: 'from-[#3C9ADC] via-[#2B7EBF] to-[#2B7EBF]',
    glow: 'shadow-[0_0_28px_rgba(60,154,220,0.28)]',
  },
  packs: [
    { label: 'Premium Pro — 30 Days',  planId: 'ub-30',  priceUSD: 19.95, wasUSD: 25.00, bandwidth: '55 GB/day • up to 10 Gbit/s' },
    { label: 'Premium Pro — 90 Days',  planId: 'ub-90',  priceUSD: 37.95, wasUSD: 55.00, bandwidth: '55 GB/day • up to 10 Gbit/s' },
    { label: 'Premium Pro — 180 Days', planId: 'ub-180', priceUSD: 69.95, wasUSD: 85.00, bandwidth: '55 GB/day • up to 10 Gbit/s' },
    { label: 'Premium Pro — 365 Days', planId: 'ub-365', priceUSD: 49.95, wasUSD: 115.00, bandwidth: '55 GB/day • up to 10 Gbit/s' },
  ],
},
{
  slug: 'uploady',
  name: 'Uploady.io',
  status: 'live',
  blurb: '300 GB/day, 5 TB storage — instant email delivery.',
  cta: 'Buy Uploady Premium',
  monogram: 'U',
  vibe: {
    ring: 'from-[#2269FF]/70 via-[#1B59D4]/60 to-[#2269FF]/70',
    chip: 'from-[#2269FF] via-[#1B59D4] to-[#2269FF]',
    mono: 'from-[#2269FF] via-[#1B59D4] to-[#2269FF]',
    glow: 'shadow-[0_0_28px_rgba(34,105,255,0.22)]',
  },
  packs: [
    { label: '30 Days',  planId: 'up-30',  priceUSD: 11.95, wasUSD: 14.99, bandwidth: '300 GB/day • 5 TB storage' },
    { label: '90 Days',  planId: 'up-90',  priceUSD: 27.95, wasUSD: 35.99, bandwidth: '300 GB/day • 5 TB storage' },
    { label: '180 Days', planId: 'up-180', priceUSD: 47.95, wasUSD: 59.99, bandwidth: '300 GB/day • 5 TB storage' },
    { label: '365 Days', planId: 'up-365', priceUSD: 69.95, wasUSD: 89.99, bandwidth: '300 GB/day • 5 TB storage' },
  ],
},
];
