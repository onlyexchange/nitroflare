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
    status: 'soon',
    blurb: 'High-speed downloads — keys coming soon.',
    monogram: 'D',
    vibe: {
      ring: 'from-amber-500/60 via-orange-500/40 to-red-500/60',
      chip: 'from-amber-500 via-orange-500 to-red-500',
      mono: 'from-amber-500 via-orange-500 to-red-500',
      glow: 'shadow-[0_0_28px_rgba(245,158,11,0.28)]',
    },
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
          href="/nitroflare"
          className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2"
        >
          NitroFlare deals
          <ArrowRight className="h-4 w-4" />
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

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Why Only.Exchange?</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Instant delivery" text="Keys are emailed automatically once confirmations hit." />
            <Feature icon={<QrCode className="h-5 w-5" />} title="Unique address per order" text="Clean tracking for each checkout session." />
            <Feature icon={<Zap className="h-5 w-5" />} title="Multi-chain support" text="BTC, ETH, SOL, BNB, LTC plus USDT/USDC with networks." />
            <Feature icon={<Coins className="h-5 w-5" />} title="Transparent pricing" text="Live market pricing via our price proxy." />
            <Feature icon={<Bitcoin className="h-5 w-5" />} title="Sender pays fees" text="No surprises—miner/validator fees paid by sender." />
            <Feature icon={<ArrowRight className="h-5 w-5" />} title="Smooth UX" text="Deep links pick your pack and jump to checkout." />
          </div>
        </div>
      </section>

      {/* FAQ (lighter / glassy) */}
      <section id="faq" className="py-14 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.04] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            FAQ
            <span className="ml-3 inline-block align-middle h-2 w-20 rounded-full bg-gradient-to-r from-fuchsia-500/70 via-purple-500/60 to-indigo-500/70" />
          </h2>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <QrCode className="h-4 w-4 opacity-90" />
                  How do deep links work?
                </span>
              }
              a="Click a pack on the homepage—the host page opens with that pack pre-selected and auto-scrolls to checkout."
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
                  <div>USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
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
              a="Instantly after the required confirmations on the selected network (typically minutes)."
            />

            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <Coins className="h-4 w-4 opacity-90" />
                  Where do your prices come from?
                </span>
              }
              a="Live market pricing via our /api/price proxy (CoinGecko source). The amount is locked when you click Generate."
            />

            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <TimerIcon className="h-4 w-4 opacity-90" />
                  How long is the payment window?
                </span>
              }
              a="30 minutes from Generate. If it expires, just start a new session to get a fresh address and amount."
            />

            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 opacity-90" />
                  Can I change my pack or email?
                </span>
              }
              a="During payment, email is temporarily locked. Use “Cancel / Start Over” to edit your pack or email, then Generate again."
            />

            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 opacity-90" />
                  What if I use the wrong network or amount?
                </span>
              }
              a={
                <>
                  <div><strong>Network:</strong> USDT/USDC must match the selected network. ETH supports L2 choices—send on the network you picked.</div>
                  <div><strong>Amount:</strong> Underpaid? Send the difference to the same address before the timer ends. Overpaid? Contact support.</div>
                </>
              }
            />

            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 opacity-90" />
                  Do you store my data?
                </span>
              }
              a="Only what’s needed to deliver your key (email + order metadata). No card/KYC data—payments are on-chain."
            />

            <QA
              q={
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-90" />
                  Need help?
                </span>
              }
              a="Email support@only.exchange with your order email and transaction hash—we’ll get you sorted."
            />
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
              <a href="#">Support</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Refunds</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/60 max-w-4xl">
            NitroFlare, Emload, and DaoFile are third-party services. This site sells access codes/keys only. All brand names and logos are property of their respective owners.
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
