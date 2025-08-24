// app/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  Clock,
  Mail,
  Globe,
  Lock,
  Wallet,
  HelpCircle,
} from 'lucide-react';

import { PROVIDERS, type Provider } from '../data/providers';

type Category = 'filehosts' | 'software' | 'accounts';

function scoreProvider(p: Provider, q: string) {
  const s = q.toLowerCase().trim();
  if (!s) return 0;
  let score = 0;
  const hay = [
    p.name,
    p.slug,
    p.blurb,
    ...(p.packs?.map(pk => `${pk.label} ${pk.priceUSD} ${pk.bandwidth ?? ''}`) ?? []),
  ].join(' • ').toLowerCase();

  if (p.name.toLowerCase().startsWith(s)) score += 30;
  if (p.slug.toLowerCase() === s) score += 25;
  if (p.name.toLowerCase().includes(s)) score += 14;
  if (hay.includes(s)) score += 8;

  const minPrice = Math.min(...(p.packs?.map(pk => pk.priceUSD) ?? [Infinity]));
  if (Number.isFinite(minPrice) && s.replace('$', '') === String(minPrice)) score += 4;

  return score;
}

function fromPrice(p: Provider) {
  if (!p.packs?.length) return null;
  const min = Math.min(...p.packs.map(pk => pk.priceUSD));
  return Number.isFinite(min) ? min : null;
}

export default function HomePage() {
  const ALL = useMemo<Provider[]>(() => PROVIDERS, []);
  const LIVE = useMemo(() => ALL.filter(p => p.status === 'live'), [ALL]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category>('filehosts');
  const router = useRouter();

  const suggestions = useMemo(() => {
    if (cat !== 'filehosts') return [];
    const trimmed = q.trim();
    if (!trimmed) return [];
    return LIVE
      .map(p => ({ p, score: scoreProvider(p, trimmed) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
      .slice(0, 8)
      .map(x => x.p);
  }, [q, LIVE, cat]);

  const browseCompact = useMemo(() => {
    if (cat !== 'filehosts') return [];
    return [...LIVE].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 12);
  }, [LIVE, cat]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cat === 'filehosts') {
      if (suggestions[0]) {
        router.push(`/${suggestions[0].slug}`);
        return;
      }
      router.push('/filehost');
      return;
    }
    // software / accounts — placeholder routes for now
    router.push(`/${cat}`);
  }

  const placeholders: Record<Category, string> = {
    filehosts: 'Search hosts, e.g. Nitroflare, Rapidgator',
    software: 'Search software keys',
    accounts: 'Search game/service accounts',
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link href="/filehost" className="hover:text-white">Filehosts</Link>
            <Link href="/software" className="hover:text-white">Software</Link>
            <Link href="/accounts" className="hover:text-white">Game Accounts</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[42vh] w-[60vw] rounded-full"
             style={{ background: 'radial-gradient(closest-side, rgba(168,85,247,.15), transparent)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-24 -right-24 h-[42vh] w-[60vw] rounded-full"
             style={{ background: 'radial-gradient(closest-side, rgba(99,102,241,.15), transparent)', filter: 'blur(40px)' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-6 text-white bg-white/10 border border-white/15 backdrop-blur">
              Instant email delivery • Crypto checkout
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Buy official{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">
                filehost keys
              </span>{' '}
              <span className="text-white/70">/ software / game accounts</span>
            </h1>
            <p className="mt-4 text-white/70 text-lg">
              Search across {LIVE.length} supported hosts. Compare plans, then check out in seconds.
            </p>

            {/* Category tabs */}
            <div className="mt-6 flex gap-2 text-sm">
              {(['filehosts','software','accounts'] as Category[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-2 rounded-xl border ${
                    cat === c ? 'border-fuchsia-400/60 bg-white/10' : 'border-white/15 hover:bg-white/10'
                  }`}
                >
                  {c === 'filehosts' ? 'Filehost Premium Keys' : c === 'software' ? 'Software' : 'Game Accounts'}
                </button>
              ))}
            </div>

            {/* Search box */}
            <form onSubmit={onSubmit} className="relative mt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={placeholders[cat]}
                  className="w-full pl-12 pr-36 py-4 rounded-2xl bg-white/10 border border-white/15 outline-none placeholder-white/40 focus:border-white/30"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 text-sm inline-flex items-center gap-2"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Suggestions (filehosts only) */}
              {cat === 'filehosts' && q.trim() && suggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-white/10 bg-[#0e0e16]/95 backdrop-blur shadow-2xl">
                  <ul className="py-2">
                    {suggestions.map((p) => {
                      const price = fromPrice(p);
                      return (
                        <li key={p.slug}>
                          <Link
                            href={`/${p.slug}`}
                            prefetch={false}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-white/5"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`inline-grid place-items-center h-8 w-8 rounded-lg text-sm font-bold bg-gradient-to-br ${p.vibe.mono}`}>
                                {p.monogram}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate">{p.name}</div>
                                <div className="text-xs text-white/60 truncate">{p.blurb}</div>
                              </div>
                            </div>
                            <div className="text-xs text-white/70 whitespace-nowrap pl-2">
                              {price != null ? <>from <span className="font-semibold">${price.toFixed(2)}</span></> : 'View'}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    <li className="mt-1 border-t border-white/10">
                      <Link href="/filehost" className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-white/80 hover:text-white">
                        Browse all filehosts
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  </ul>
                </div>
              )}

              {/* Coming soon banner for other categories */}
              {cat !== 'filehosts' && (
                <div className="mt-3 text-sm text-white/70">
                  Coming soon — we’re expanding into {cat === 'software' ? 'software licenses' : 'game & service accounts'}.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Compact browse grid (filehosts) */}
      {cat === 'filehosts' && (
        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-2xl md:text-3xl font-bold">Browse filehosts</h2>
              <Link
                href="/filehost"
                className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {browseCompact.map((p) => {
                const price = fromPrice(p);
                return (
                  <motion.div
                    key={p.slug}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-2xl p-[1.5px] bg-gradient-to-r ${p.vibe.ring} ${p.vibe.glow}`}
                  >
                    <div className="rounded-[18px] bg-black/40 border border-white/10 p-4 h-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{p.name}</div>
                          <div className="text-xs text-white/60 truncate">{p.blurb}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {price != null && (
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wide text-white/50">from</div>
                            <div className="text-sm font-semibold">${price.toFixed(2)}</div>
                          </div>
                        )}
                        <Link
                          href={`/${p.slug}`}
                          prefetch={false}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm whitespace-nowrap"
                        >
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why buy from Only.Exchange */}
      <section className="py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold">Why buy from Only.Exchange</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Official & verified keys"
              text="We source directly from providers. No third-party resellers, no reused codes."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Instant email delivery"
              text="Keys are sent automatically right after confirmations—usually in minutes."
            />
            <Feature
              icon={<Clock className="h-5 w-5" />}
              title="Price lock during checkout"
              text="Your crypto amount is locked for 30 minutes, so fees and swings don’t bite."
            />
            <Feature
              icon={<Mail className="h-5 w-5" />}
              title="Human support"
              text="Made a mistake? Sent the wrong amount? Send us the TX hash—we’ll help."
            />
            <Feature
              icon={<Lock className="h-5 w-5" />}
              title="Privacy-first"
              text="We only need an email to deliver the key. No card details, no KYC."
            />
            <Feature
              icon={<Globe className="h-5 w-5" />}
              title="Global access"
              text="Pay from anywhere—no bank blocks, no geo payment errors."
            />
          </div>
        </div>
      </section>

      {/* Why crypto payments are better */}
      <section className="py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold">Why pay with crypto</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Mini
              icon={<Wallet className="h-5 w-5" />}
              title="Fast settlement"
              text="No card holds or bank delays—most orders confirm in minutes."
            />
            <Mini
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No chargebacks"
              text="Fewer reversals mean lower prices and instant fulfillment."
            />
            <Mini
              icon={<Globe className="h-5 w-5" />}
              title="Works worldwide"
              text="Avoid region blocks and failed card payments."
            />
            <Mini
              icon={<Lock className="h-5 w-5" />}
              title="More private"
              text="Just an email for delivery—no card or bank info."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl md:text-3xl font-bold">FAQ</h2>
            <Link
              href="/support"
              className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15"
            >
              <HelpCircle className="h-4 w-4" />
              More help
            </Link>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <QA q="How long until I receive my key?"
                a="We email keys automatically after the required confirmations (usually within minutes). If it takes longer, contact support with your TX hash." />
            <QA q="Which coins and networks can I use?"
                a="BTC, ETH, SOL, BNB, LTC, USDT, and USDC. USDT/USDC support Ethereum, BNB, and Solana. ETH also supports L2s like Base, Arbitrum, and Optimism." />
            <QA q="What if I sent the wrong amount?"
                a="Underpaid: send the difference to the same address before the timer expires. Overpaid: contact support—we’ll reconcile it." />
            <QA q="Can I change my email after starting checkout?"
                a="During payment the email is locked. Cancel / Start Over to edit, then generate a new address." />
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
              <Link href="/filehost">Filehosts</Link>
              <Link href="/software">Software</Link>
              <Link href="/accounts">Game Accounts</Link>
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

/* ── UI bits ─────────────────────────────────────────────────────────── */

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="inline-flex items-center gap-2 text-white">
        {icon}<span className="font-semibold">{title}</span>
      </div>
      <p className="text-white/70 text-sm mt-1.5">{text}</p>
    </div>
  );
}

function Mini({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="inline-flex items-center gap-2 text-white/90">
        {icon}<span className="font-medium">{title}</span>
      </div>
      <p className="text-white/70 text-sm mt-1">{text}</p>
    </div>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="font-medium">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
      </summary>
      <div className="px-4 pb-4 pt-0 text-white/75 text-sm">{a}</div>
    </details>
  );
}
