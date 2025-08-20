'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Bitcoin,
  QrCode,
  Zap,
  ShieldCheck,
  Coins,
  Search,
  ArrowRight,
  Timer as TimerIcon,
  RefreshCw,
  AlertTriangle,
  Mail,
  ArrowLeftRight,
  HelpCircle,

} from 'lucide-react';

type Pack = {
  label: string;
  priceUSD: number;
  wasUSD?: number;
  bandwidth?: string;
  planId?: string; // used for deep-link selection
};

type Provider = {
  slug: string;
  name: string;
  status: 'live' | 'soon';
  blurb: string;
  cta?: string;
  monogram: string; // First letter
  vibe: {
    ring: string;  // card ring gradient
    chip: string;  // small header chip gradient
    mono: string;  // monogram gradient
    glow: string;  // box-shadow color
  };
  packs?: Pack[];
};

const PROVIDERS: Provider[] = [
  {
    slug: 'nitroflare',
    name: 'NitroFlare.com',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy NitroFlare Premium',
    monogram: 'N',
    // NitroFlare vibe (cyan/blue like the screenshot)
    vibe: {
      ring: 'from-sky-400/70 via-cyan-500/60 to-blue-600/70',
      chip: 'from-sky-500 via-cyan-500 to-blue-600',
      mono: 'from-sky-500 via-cyan-500 to-blue-600',
      glow: 'shadow-[0_0_28px_rgba(56,189,248,0.28)]',
    },
    packs: [
      { label: '30 Days',  planId: 'nf-30',  priceUSD: 8.99,  wasUSD: 15,  bandwidth: '25 GB/day' },
      { label: '90 Days',  planId: 'nf-90',  priceUSD: 20.99, wasUSD: 35,  bandwidth: '50 GB/day' },
      { label: '180 Days', planId: 'nf-180', priceUSD: 32.99, wasUSD: 55,  bandwidth: '75 GB/day' },
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
    { label: '30 Days',  planId: 'rg-30',  priceUSD: 10.49, wasUSD: 14.99, bandwidth: '1 TB Bandwidth / 1 TB Storage' },
    { label: '90 Days',  planId: 'rg-90',  priceUSD: 27.99, wasUSD: 39.99, bandwidth: '4 TB Bandwidth / 3 TB Storage' },
    { label: '180 Days', planId: 'rg-180', priceUSD: 34.99, wasUSD: 49.99, bandwidth: '6 TB Bandwidth / 6 TB Storage' },
    { label: '365 Days', planId: 'rg-365', priceUSD: 69.99, wasUSD: 99.99, bandwidth: '12 TB Bandwidth / 12 TB Storage' },
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
  // Royal → deep blue → sky (distinct from NitroFlare’s cyan mix)
  ring: 'from-blue-600/70 via-blue-500/60 to-sky-400/70',
  chip: 'from-blue-700 via-blue-600 to-sky-500',
  mono: 'from-blue-700 via-blue-600 to-sky-500',
  glow: 'shadow-[0_0_28px_rgba(59,130,246,0.35)]', // blue-500 glow
},
  packs: [
    { label: '31 Days',  planId: 'ff-31',  priceUSD: 21.00,  wasUSD: 35.00,  bandwidth: 'Includes 1TB storage' },
    { label: '110 Days', planId: 'ff-110', priceUSD: 66.00,  wasUSD: 110.00, bandwidth: 'Includes 1TB storage' },
    { label: '180 Days', planId: 'ff-180', priceUSD: 87.00,  wasUSD: 145.00, bandwidth: 'Includes 1TB storage' },
    { label: '365 Days', planId: 'ff-365', priceUSD: 150.00, wasUSD: 250.00, bandwidth: 'Includes 1TB storage' },
  ],
},
  {
    slug: 'emload',
    name: 'Emload.com',
    status: 'soon',
    blurb: 'Fast filehost — keys coming soon.',
    monogram: 'E',
    vibe: {
      ring: 'from-teal-500/60 via-emerald-500/40 to-cyan-500/60',
      chip: 'from-teal-500 via-emerald-500 to-cyan-500',
      mono: 'from-teal-500 via-emerald-500 to-cyan-500',
      glow: 'shadow-[0_0_28px_rgba(16,185,129,0.28)]',
    },
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
    { label: '31 Days',  planId: 'df-31',  priceUSD: 12.99, wasUSD: 19.95,  bandwidth: 'Up to 50 GB / 3 days' },
    { label: '90 Days',  planId: 'df-90',  priceUSD: 27.99, wasUSD: 39.95,  bandwidth: 'Up to 50 GB / 3 days' },
    { label: '365 Days', planId: 'df-365', priceUSD: 59.99, wasUSD: 89.95,  bandwidth: 'Up to 50 GB / 3 days' },
    { label: '999 Days', planId: 'df-999', priceUSD: 89.99, wasUSD: 129.95, bandwidth: 'Up to 50 GB / 3 days' },
  ],
},
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'soon'>('all');

  // Keep whole provider card if provider matches query; else filter packs within it
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byStatus = PROVIDERS.filter(p => statusFilter === 'all' || p.status === statusFilter);

    if (!q) return byStatus;

    return byStatus
      .map((p) => {
        const providerMatches =
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q);

        if (providerMatches) return p; // keep all packs

        const packs = p.packs?.filter(
          (pk) =>
            pk.label.toLowerCase().includes(q) ||
            String(pk.priceUSD).includes(q) ||
            (pk.bandwidth ?? '').toLowerCase().includes(q)
        );

        return { ...p, packs };
      })
      .filter((p) => {
        const providerMatches =
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q);

        return providerMatches || (p.packs && p.packs.length > 0);
      });
  }, [query, statusFilter]);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link
  href="/"
  className="flex items-center gap-2 group"
  aria-label="Only.Exchange — Home"
  prefetch={false}
>
  <span
    className="inline-grid h-8 w-8 place-items-center rounded-xl
               bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500
               text-white ring-1 ring-white/20 shadow-sm
               transition-transform group-hover:scale-105"
  >
    <ArrowLeftRight className="h-4 w-4" />
  </span>
  <span className="font-semibold group-hover:text-white">Only.Exchange</span>
</Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#hosts" className="hover:text-white">Filehosts</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
        </div>
      </header>

     {/* Hero */}
<section className="relative">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-6">
        <Zap className="h-3.5 w-3.5" />
        Instant delivery • Live price lock • Unique address
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
        Buy premium filehost keys
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">
          with crypto — instantly
        </span>
      </h1>

      <p className="mt-4 text-white/80 text-lg max-w-2xl">
        Choose a host and pack, pay in BTC, ETH, SOL, BNB, LTC, USDT or USDC.
        Your key is emailed automatically after 2 confirmations.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#hosts"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 inline-flex items-center gap-2 hover:from-fuchsia-400 hover:to-indigo-400"
        >
          Browse filehosts
          <ArrowRight className="h-4 w-4" />
        </a>
       <a
  href="/support"
  className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2
             bg-white/5 hover:bg-white/10 transition"
>
  <HelpCircle className="h-4 w-4 text-fuchsia-300" />
  <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
    Contact Support
  </span>
</a>

      </div>

      <div className="mt-4 text-xs text-white/60">
        No KYC • Sender pays network fees • 30-minute payment window
      </div>
    </motion.div>
  </div>
</section>


      {/* Hosts */}
      <section id="hosts" className="py-10 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header row with controls on the right */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">Filehosts</h2>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hosts, plans, bandwidth…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'live' | 'soon')}
                className="sm:w-44 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white/80"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="live">Live</option>
                <option value="soon">Coming soon</option>
              </select>
            </div>
          </div>

          {/* Single-column list */}
          <div className="mt-8 grid gap-6">
            {filtered.map((provider) => (
              <motion.div
                key={provider.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl p-[1.5px] bg-gradient-to-r ${provider.vibe.ring} ${provider.vibe.glow}`}
              >
                <div className="rounded-[22px] bg-black/40 border border-white/10 p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: identity */}
                    <div className="flex items-center gap-4">
                      <span className={`inline-grid place-items-center h-10 w-10 rounded-xl text-sm font-bold bg-gradient-to-br ${provider.vibe.mono}`}>
                        {provider.monogram}
                      </span>
                      <div>
                        <div className="text-xl font-semibold">{provider.name}</div>
                        <p className="text-white/70 text-sm mt-0.5">{provider.blurb}</p>
                      </div>
                    </div>

                    {/* Right: status + CTA */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] tracking-wide uppercase px-2 py-1 rounded-md bg-gradient-to-r ${provider.vibe.chip}`}>
                        {provider.status === 'live' ? 'Live' : 'Coming Soon'}
                      </span>
                      {provider.status === 'live' ? (
                        <Link
                          href={`/${provider.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 text-sm"
                          prefetch={false}
                        >
                          {provider.cta ?? 'View'}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/50 cursor-not-allowed"
                          aria-disabled
                          title="Coming soon"
                        >
                          Coming soon
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Packs */}
                  {!!provider.packs?.length && (
                    <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {provider.packs.map((pk) => {
                        const live = provider.status === 'live';

                        const CardInner = (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition h-full">
                            <div className="text-sm font-medium text-white/90">{pk.label}</div>

                            {/* Price lines */}
                            <div className="mt-1 leading-tight">
                              {pk.wasUSD !== undefined && (
                                <div className="text-xs text-white/50 line-through">
                                  ${pk.wasUSD.toFixed(2)}
                                </div>
                              )}
                              <div className="text-2xl font-bold">
                                ${pk.priceUSD.toFixed(2)}
                              </div>
                            </div>

                            {pk.bandwidth && (
                              <div className="mt-2 text-xs text-white/60">{pk.bandwidth}</div>
                            )}
                          </div>
                        );

                        return live ? (
                          <Link
                            key={`${provider.slug}-${pk.label}`}
                            href={{ pathname: `/${provider.slug}`, query: { plan: pk.planId ?? pk.label } }}
                            prefetch={false}
                            aria-label={`Buy ${provider.name} ${pk.label}`}
                            className="block"
                          >
                            {CardInner}
                          </Link>
                        ) : (
                          <div
                            key={`${provider.slug}-${pk.label}`}
                            className="opacity-60 cursor-not-allowed"
                            title="Coming soon"
                          >
                            {CardInner}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features (upgraded) */}
<section id="features" className="py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Title + value badges */}
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <h2 className="text-3xl md:text-4xl font-bold">
        Why Only.Exchange?
        <span className="ml-3 inline-block align-middle h-2 w-20 rounded-full bg-gradient-to-r from-fuchsia-500/70 via-purple-500/60 to-indigo-500/70" />
      </h2>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-indigo-600/20 border border-white/10">
          No KYC • Crypto only
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-indigo-600/20 border border-white/10">
          On-chain tracking
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-indigo-600/20 border border-white/10">
          Auto-delivery API
        </span>
      </div>
    </div>

    {/* Core features */}
    <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      <Feature
        icon={<Zap className="h-5 w-5" />}
        title="Instant, API-driven delivery"
        text="We monitor the mempool and dispatch keys the moment confirmations hit—no screenshots or tickets needed."
      />
      <Feature
  icon={<ShieldCheck className="h-5 w-5" />}
  title="Privacy by design"
  text="Rotating, single-use addresses reduce reuse and improve on-chain privacy vs. shared deposit wallets."
/>
      <Feature
        icon={<ShieldCheck className="h-5 w-5" />}
        title="On-chain matching"
        text="Your payment is matched by address + amount on the blockchain, then auto-verified for release."
      />
      <Feature
        icon={<Coins className="h-5 w-5" />}
        title="Transparent pricing"
        text="Live crypto market pricing. What you see at Checkout is what you pay."
      />
      <Feature
        icon={<Bitcoin className="h-5 w-5" />}
        title="Multi-chain options"
        text="BTC, ETH (+ L2s), SOL, BNB, LTC, plus USDT/USDC on Ethereum, Solana, and BNB Smart Chain."
      />
    <Feature
  icon={<TimerIcon className="h-5 w-5" />}
  title="One-click checkout"
  text="Choose a pack, we prefill the order—generate an address and pay in seconds."
/>
    </div>

    {/* Why crypto */}
    <div className="mt-10 rounded-3xl p-[1.5px] bg-gradient-to-r from-fuchsia-600/60 via-purple-600/40 to-indigo-600/60 shadow-[0_0_26px_rgba(168,85,247,0.25)]">
      <div className="rounded-[22px] bg-black/40 border border-white/10 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <Bitcoin className="h-4 w-4" />
          Why pay with crypto?
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <Bullet
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Final, global, borderless"
            desc="No banks, regions, or card declines—crypto works wherever you do."
          />
          <Bullet
            icon={<Zap className="h-4 w-4" />}
            title="Fast settlement"
            desc="Keys auto-send as soon as confirmations clear—typically within minutes."
          />
          <Bullet
            icon={<QrCode className="h-4 w-4" />}
            title="Exact-amount accuracy"
            desc="QR & copy buttons ensure the exact amount—no rounding headaches."
          />
          <Bullet
            icon={<Coins className="h-4 w-4" />}
            title="Fewer chargebacks, better prices"
            desc="On-chain payments reduce fraud and keep plan prices competitive."
          />
        </div>

        <div className="mt-5 text-sm text-white/70">
          Have questions about networks or confirmations?{" "}
          <a
            href="/support"
            className="font-semibold text-transparent bg-clip-text
                       bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400
                       underline underline-offset-4 decoration-white/20"
          >
            Contact support
          </a>
          .
        </div>
      </div>
    </div>
  </div>
</section>


      {/* FAQ (upgraded: colorful, link-rich, customer-focused) */}
<section id="faq" className="py-16 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Heading + quick actions */}
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <h2 className="text-3xl md:text-4xl font-bold">
        FAQ
        <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full bg-gradient-to-r from-fuchsia-500/70 via-purple-500/60 to-indigo-500/70" />
      </h2>

      <div className="flex flex-wrap gap-2">
        <a
          href="/support"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     text-sm font-semibold text-white
                     bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                     hover:from-fuchsia-500 hover:to-indigo-500
                     shadow-[0_0_18px_rgba(168,85,247,0.4)]"
        >
          <Mail className="h-4 w-4" />
          Contact support
        </a>
        <a
          href="/nitroflare"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                     border border-white/15 bg-white/5 hover:border-white/30"
        >
          <Zap className="h-4 w-4" />
          Buy NitroFlare keys
        </a>
      </div>
    </div>

    <div className="mt-8 grid lg:grid-cols-3 gap-6">
      {/* Main Q&A (2 cols) */}
      <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <QrCode className="h-4 w-4 opacity-90" />
              How do I buy a key?
            </span>
          }
          a={
            <>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open <a href="/nitroflare">NitroFlare</a> (more hosts soon).</li>
                <li>Choose a pack & enter your email.</li>
                <li>Select coin (and network if using USDT/USDC or ETH L2).</li>
                <li>Click <em>Generate</em> to lock price & get your address.</li>
                <li>Send the exact amount within 30 minutes.</li>
              </ol>
              <p className="mt-2 text-white/70 text-xs">
                Need a hand? <a href="/support">Contact support</a>.
              </p>
            </>
          }
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <Coins className="h-4 w-4 opacity-90" />
              Which coins & networks are supported?
            </span>
          }
          a={
            <>
              <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
              <div className="mt-1">
                USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.
              </div>
              <div className="mt-1">
                ETH supports L2 choices (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll). Pick where you’re sending from.
              </div>
            </>
          }
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <TimerIcon className="h-4 w-4 opacity-90" />
              When do I get my key?
            </span>
          }
          a={
            <>
              <div>Instantly after required confirmations (usually minutes).</div>
              <div className="mt-1 text-white/70 text-sm">
                You’ll receive the key at the email you entered at checkout.
              </div>
            </>
          }
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4 opacity-90" />
              Can I change my pack or email?
            </span>
          }
          a={
            <>
              <div>During payment, email is temporarily locked.</div>
              <div className="mt-1">Hit <em>Cancel / Start Over</em> to update pack or email and click <em>Generate</em> again.</div>
            </>
          }
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 opacity-90" />
              Sent wrong amount or network?
            </span>
          }
          a={
            <>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                <li><strong>Overpaid:</strong> <a href="/support">Contact support</a> with your TX hash—We’ll reconcile.</li>
                <li><strong>Wrong network:</strong> For USDT/USDC, the network must match. If you’re unsure, <a href="/support">reach out</a> ASAP.</li>
              </ul>
            </>
          }
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <Bitcoin className="h-4 w-4 opacity-90" />
              Where do your prices come from?
            </span>
          }
          a="Live market pricing via our /api/price proxy (CoinGecko source). Your amount is locked for 30 minutes when you click Generate."
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 opacity-90" />
              What about fees & confirmations?
            </span>
          }
          a="Sender pays network/miner fees. Keys are released after 2 confirmations (network-dependent)."
        />

        <QA
          q={
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 opacity-90" />
              Didn’t receive my key—what now?
            </span>
          }
          a={
            <>
              <div>Check spam/junk first.</div>
              <div className="mt-1">
                Still missing? <a href="/support">Open a ticket</a> with your order email and TX hash so we can look it up immediately.
              </div>
            </>
          }
        />
      </div>

      {/* Side panel: quick help & links */}
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4 opacity-90" />
          Quick help
        </div>

        <ul className="mt-3 space-y-2 text-sm">
          <li>
            ✔️ <a href="/nitroflare">NitroFlare packs & bandwidth</a>
          </li>
          <li>
            ✔️ <a href="/nitroflare?plan=nf-90#checkout">90-day pack (deep link)</a>
          </li>
          <li>
            ✔️ <a href="/support">Payment issues (over/underpaid)</a>
          </li>
          <li>
            ✔️ <a href="/support">Key not received / not working</a>
          </li>
        </ul>

        <div className="mt-5 rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 p-4">
          <div className="text-sm font-semibold">Still stuck?</div>
          <p className="text-white/70 text-sm mt-1">
            Our support team can verify your TX and resend keys.
          </p>
          <a
            href="/support"
            className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-semibold text-white
                       bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                       hover:from-fuchsia-500 hover:to-indigo-500"
          >
            <Mail className="h-4 w-4" />
            Contact support
          </a>
        </div>
      </aside>
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
              <span className="font-semibold text-white">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="/support">Support</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/refunds">Refunds</a>
            </div>
          </div>
    <p className="mt-6 text-xs text-white/60 max-w-4xl">
  © 2025 Only.Exchange | All brand names and logos are property of their respective owners.
</p>


        </div>
      </footer>
    </div>
  );
}

/* PRESENTATIONAL HELPERS */
function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="inline-flex items-center gap-2 text-white">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-white/70 mt-1.5 text-sm">{text}</p>
    </div>
  );
}

function Bullet({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="inline-flex items-center gap-2 text-white">
        <span className="inline-grid place-items-center h-7 w-7 rounded-lg bg-white/5 border border-white/10">
          {icon}
        </span>
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-white/70 mt-1.5 text-sm">{desc}</p>
    </div>
  );
}

function QA({ q, a }: { q: ReactNode; a: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm hover:border-white/20 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
      </summary>

      {/* Accent divider */}
      <div className="h-px w-full bg-gradient-to-r from-fuchsia-500/40 via-purple-500/30 to-indigo-500/40" />

      <div className="px-4 pb-4 pt-3 text-white/80 text-sm">
        {a}
      </div>
    </details>
  );
}

function BG() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-600/15 to-indigo-600/25 blur-3xl" />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-fuchsia-600/10 to-purple-600/15 blur-3xl" />
    </div>
  );
}
