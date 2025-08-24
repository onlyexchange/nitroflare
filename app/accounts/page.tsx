// app/accounts/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, ArrowLeftRight } from 'lucide-react';

import { ACCOUNTS } from '../../data/accounts';

// Types derived from your data file so we never drift
type AccountProduct = typeof ACCOUNTS[number];
type AccountSku = AccountProduct extends { skus: infer S } ? (S extends any[] ? S[number] : never) : never;

/* ── helpers ───────────────────────────────────────────────────────────── */
function resolveVibe(v?: AccountProduct extends { vibe?: infer V } ? V : never) {
  const base = 'from-fuchsia-500 via-purple-500 to-indigo-500';
  return {
    ring: (v as any)?.ring ?? base,
    chip: (v as any)?.chip ?? base,
    mono: (v as any)?.mono ?? (v as any)?.chip ?? base,
    glow: (v as any)?.glow ?? 'shadow-[0_0_28px_rgba(99,102,241,0.28)]',
  };
}

function fromPrice(p: AccountProduct) {
  const prices = (p as any)?.skus?.map((s: AccountSku) => Number(s.priceUSD)).filter(Number.isFinite) ?? [];
  if (!prices.length) return null;
  const min = Math.min(...prices);
  return Number.isFinite(min) ? min : null;
}

function scoreProduct(p: AccountProduct, q: string) {
  const s = q.toLowerCase().trim();
  if (!s) return 0;
  let score = 0;

  const name = (p as any)?.name ?? '';
  const slug = (p as any)?.slug ?? '';
  const blurb = (p as any)?.blurb ?? '';
  const skus: AccountSku[] = (p as any)?.skus ?? [];

  const hay = [
    name,
    slug,
    blurb,
    ...skus.map((sk) => `${sk?.label ?? ''} ${sk?.priceUSD ?? ''} ${(sk as any)?.bandwidth ?? ''}`),
  ]
    .join(' • ')
    .toLowerCase();

  if (name.toLowerCase().startsWith(s)) score += 30;
  if (slug.toLowerCase() === s) score += 25;
  if (name.toLowerCase().includes(s)) score += 14;
  if (hay.includes(s)) score += 8;

  const minPrice = fromPrice(p);
  if (minPrice != null && s.replace('$', '') === String(minPrice)) score += 4;

  return score;
}

/* ── page ──────────────────────────────────────────────────────────────── */
export default function AccountsIndexPage() {
  const ALL = useMemo<AccountProduct[]>(() => ACCOUNTS ?? [], []);
  const [q, setQ] = useState('');
  const router = useRouter();

  const suggestions = useMemo(() => {
    const t = q.trim();
    if (!t) return [];
    return ALL
      .map((p) => ({ p, score: scoreProduct(p, t) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || String((a.p as any).name).localeCompare(String((b.p as any).name)))
      .slice(0, 8)
      .map((x) => x.p);
  }, [q, ALL]);

  const grid = useMemo(
    () => [...ALL].sort((a, b) => String((a as any).name).localeCompare(String((b as any).name))),
    [ALL]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions[0]) {
      router.push(`/accounts/${(suggestions[0] as any).slug}`);
      return;
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      {/* Header with menu */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/filehost" className="hover:text-white">Filehosts</Link>
            <Link href="/software" className="hover:text-white">Software</Link>
            <span
              aria-current="page"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-white/15 bg-white/10"
              title="You are here"
            >
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-medium">
                Accounts
              </span>
            </span>
          </nav>
        </div>
      </header>

      {/* Hero + search */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[42vh] w-[60vw] rounded-full"
             style={{ background: 'radial-gradient(closest-side, rgba(168,85,247,.15), transparent)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-24 -right-24 h-[42vh] w-[60vw] rounded-full"
             style={{ background: 'radial-gradient(closest-side, rgba(99,102,241,.15), transparent)', filter: 'blur(40px)' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-6 text-white bg-white/10 border border-white/15 backdrop-blur">
              Instant delivery • Crypto checkout
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Game & App <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">Accounts</span>
            </h1>
            <p className="mt-4 text-white/70 text-lg">
              Search across {ALL.length} account products. Compare plans and check out in seconds.
            </p>

            <form onSubmit={onSubmit} className="relative mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search accounts, e.g. Spotify, Netflix, 1 year…"
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

              {q.trim() && suggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-white/10 bg-[#0e0e16]/95 backdrop-blur shadow-2xl">
                  <ul className="py-2">
                    {suggestions.map((p) => {
                      const vibe = resolveVibe((p as any).vibe);
                      const price = fromPrice(p);
                      return (
                        <li key={(p as any).slug}>
                          <Link
                            href={`/accounts/${(p as any).slug}`}
                            prefetch={false}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-white/5"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`inline-grid place-items-center h-8 w-8 rounded-lg text-sm font-bold bg-gradient-to-br ${vibe.mono}`}>
                                {(p as any).monogram ?? '★'}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate">{(p as any).name}</div>
                                {!!(p as any).blurb && <div className="text-xs text-white/60 truncate">{(p as any).blurb}</div>}
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
                      <span className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-white/60">
                        Tip: Press <kbd className="px-1 rounded bg-white/10 border border-white/15 text-[10px]">Enter</kbd> to open the top match
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold">Browse accounts</h2>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {grid.map((p) => {
              const vibe = resolveVibe((p as any).vibe);
              const price = fromPrice(p);
              return (
                <motion.div
                  key={(p as any).slug}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl p-[1.5px] bg-gradient-to-r ${vibe.ring} ${vibe.glow}`}
                >
                  <div className="rounded-[18px] bg-black/40 border border-white/10 p-4 h-full flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`inline-grid place-items-center h-8 w-8 rounded-lg text-sm font-bold bg-gradient-to-br ${vibe.mono}`}>
                        {(p as any).monogram ?? '★'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{(p as any).name}</div>
                        {!!(p as any).blurb && <div className="text-xs text-white/60 truncate">{(p as any).blurb}</div>}
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
                        href={`/accounts/${(p as any).slug}`}
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
