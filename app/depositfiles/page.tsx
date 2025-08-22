'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Zap,
  ArrowRight,
  BadgeCheck,
  Layers,
  Download,
  Clock,
  LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { useMemo } from 'react';

type Plan = {
  id: string;
  label: string;
  priceUSD: number;
  wasUSD?: number;
  bandwidth?: string;
  note?: string;
  bestSeller?: boolean;
};

const PLANS: Plan[] = [
  { id: 'df-30',  label: '30 Days',  priceUSD: 8.95,  wasUSD: 11.95, bandwidth: '—',                   note: 'Great starter' },
  { id: 'df-90',  label: '90 Days',  priceUSD: 12.95, wasUSD: 19.95, bandwidth: '—',                   bestSeller: true, note: 'Most popular' },
  { id: 'df-180', label: '180 Days', priceUSD: 29.95, wasUSD: 44.95, bandwidth: '—' },
  { id: 'df-365', label: '365 Days', priceUSD: 49.95, wasUSD: 74.95, bandwidth: '—',                   note: 'Best value' },
];

export default function DepositFilesPage() {
  const hasAnyStrike = useMemo(() => PLANS.some(p => p.wasUSD !== undefined), []);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Only.Exchange — Home"
            prefetch={false}
          >
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl
                             bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500
                             text-white ring-1 ring-white/20 shadow-sm
                             transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>
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
              Instant delivery • Crypto checkout
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              DepositFiles <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a3d] via-[#EF360E] to-[#b51f02]">Premium Keys</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-2xl">
              Pay with crypto and receive your DepositFiles GOLD key by email right after confirmations. No ads, no wait times, full-speed downloads.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#plans"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff6a3d] to-[#EF360E] inline-flex items-center gap-2 hover:from-[#ff845b] hover:to-[#f14826]"
              >
                View plans
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/support"
                className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2"
              >
                Questions? Contact support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-white/70 mt-2">GOLD membership keys — instant email delivery after confirmations.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5"
              >
                {p.bestSeller && (
                  <span className="absolute -top-2 left-4 text-[11px] uppercase tracking-wide px-2 py-1 rounded-md
                                   bg-gradient-to-r from-[#ff6a3d] to-[#EF360E]">
                    Bestseller
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">{p.label}</div>
                  <CheckCircle2 className="h-5 w-5 text-[#ff6a3d]/70 opacity-0 group-hover:opacity-100" />
                </div>

                <div className="mt-2 leading-tight">
                  {hasAnyStrike && p.wasUSD !== undefined && (
                    <div className="text-xs text-white/50 line-through">${p.wasUSD.toFixed(2)}</div>
                  )}
                  <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                </div>

                {p.bandwidth && (
                  <div className="mt-2 text-xs text-white/60">{p.bandwidth}</div>
                )}
                {p.note && (
                  <div className="mt-2 text-[11px] text-white/60">{p.note}</div>
                )}

                <div className="mt-4">
                  <a
                    href="#how"
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:border-white/30"
                  >
                    How it works
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-sm text-white/70">
            Keys are dispatched to your email after required confirmations. Sender covers network fees.
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold">Premium features</h3>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Benefit
              icon={<Download className="h-5 w-5" />}
              title="Full-speed downloads"
              text="No speed limits. Use your favorite download manager for maximum performance."
            />
            <Benefit
              icon={<Layers className="h-5 w-5" />}
              title="Multiple connections"
              text="Parallel downloads with no waiting time between file parts."
            />
            <Benefit
              icon={<Clock className="h-5 w-5" />}
              title="Zero waiting"
              text="No queues, no timers, and no delays between downloads."
            />
            <Benefit
              icon={<LinkIcon className="h-5 w-5" />}
              title="Direct links"
              text="Skip redirections and start instant downloads from your account."
            />
            <Benefit
              icon={<BadgeCheck className="h-5 w-5" />}
              title="Ad-free experience"
              text="No advertisements or captchas across the entire premium experience."
            />
            <Benefit
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Instant email delivery"
              text="Your premium key arrives right after on-chain confirmations."
            />
          </div>
        </div>
      </section>

      {/* How to activate */}
      <section id="how" className="py-14 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold">How to activate your key</h3>

          <div className="mt-6 rounded-3xl p-[1.5px] bg-gradient-to-r from-[#ff6a3d]/60 via-[#EF360E]/40 to-[#b51f02]/60 shadow-[0_0_26px_rgba(239,54,14,0.25)]">
            <div className="rounded-[22px] bg-black/40 border border-white/10 p-6 md:p-8">
              {/* Example key */}
              <div className="text-sm font-semibold text-white/90">You’ll receive a Premium Key like:</div>
              <div className="mt-1 inline-block rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-sm text-white/90">
                3XD3-GUEL-XUPJ-H61G
              </div>

              {/* Steps */}
              <ol className="mt-4 list-decimal list-inside space-y-2 text-white/80">
                <li>
                  Log in to your DepositFiles account.{' '}
                  <a
                    href="https://depositfiles.com/signup.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a3d] via-[#EF360E] to-[#b51f02] underline underline-offset-4 decoration-white/20"
                  >
                    Don’t have one? Sign up
                  </a>
                  .
                </li>
                <li>Open the payment area in your account and locate the <em>Use Voucher</em> field.</li>
                <li>Paste your Premium Key and click <strong>Activate</strong>.</li>
              </ol>

              <p className="mt-3 text-xs text-white/60">
                Tip: Paste without spaces. If activation fails, confirm you’re logged into the correct DepositFiles account (the key is sent to your checkout email).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (global) */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
              <span className="font-semibold text-white">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/support">Support</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refunds">Refunds</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/60 max-w-4xl">
            © 2025 Only.Exchange • All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* PRESENTATIONAL HELPERS */
function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
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

function BG() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* warm red/orange glow to match #EF360E */}
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full
                      bg-gradient-to-br from-[#ff6a3d]/25 via-[#EF360E]/18 to-[#b51f02]/25 blur-3xl" />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full
                      bg-gradient-to-br from-[#EF360E]/18 via-[#ff6a3d]/12 to-[#b51f02]/18 blur-3xl" />
    </div>
  );
}
