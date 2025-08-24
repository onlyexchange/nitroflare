'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, ArrowLeftRight } from 'lucide-react';

// Import your catalog
import { ACCOUNTS } from '../../data/accounts';
type Account = (typeof ACCOUNTS)[number];

function fromPrice(a: Account) {
  const min = Math.min(...a.skus.map(s => s.priceUSD));
  return Number.isFinite(min) ? min : null;
}

function scoreAccount(a: Account, q: string) {
  const s = q.toLowerCase().trim();
  if (!s) return 0;
  let score = 0;

  const hay = [
    a.name,
    a.blurb,
    ...a.skus.map(sku => `${sku.label} ${sku.priceUSD}`)
  ].join(' • ').toLowerCase();

  if (a.name.toLowerCase().startsWith(s)) score += 30;
  if (a.slug.toLowerCase() === s) score += 25;
  if (a.name.toLowerCase().includes(s)) score += 14;
  if (hay.includes(s)) score += 8;

  // tiny boost if user types the exact “from” price
  const min = fromPrice(a);
  if (min != null && s.replace('$','') === String(min)) score += 4;

  return score;
}

export default function AccountsIndexPage() {
  const router = useRouter();
  const ALL = useMemo<Account[]>(() => ACCOUNTS, []);
  const [q, setQ] = useState('');

  const suggestions = useMemo(() => {
    const t = q.trim();
    if (!t) return [];
    return ALL
      .map(a => ({ a, score: scoreAccount(a, t) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.a.name.localeCompare(b.a.name))
      .slice(0, 8)
      .map(x => x.a);
  }, [q, ALL]);

  const browse = useMemo(
    () => [...ALL].sort((a, b) => a.name.localeCompare(b.name)),
    [ALL]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions[0]) {
      router.push(`/accounts/${suggestions[0].slug}`);
      return;
    }
    // fallback: go to first card or just stay
    if (browse[0]) router.push(`/accounts/${browse[0].slug}`);
  }

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
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/filehost" className="hover:text-white">Filehosts</Link>
            <span aria-current="page" className="px-3 py-1 rounded-xl border border-white/15 bg-white/10">Accounts</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-24 -left-24 h-[42vh] w-[60vw] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(168,85,247,.14), transparent)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-[42vh] w-[60vw] rounded-full"
          style={{ background: 'radial-gradient(closest-side, rgba(99,102,241,.14), transparent)', filter: 'blur(40px)' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Game & software <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">accounts</span>
          </h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Browse verified account products with instant email delivery and crypto checkout.
          </p>

          {/* Search */}
          <form onSubmit={onSubmit} className="relative mt-7 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search accounts, editions, warranties…"
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
                  {suggestions.map((a) => {
                    const min = fromPrice(a);
                    return (
                      <li key={a.slug}>
                        <Link
                          href={`/accounts/${a.slug}`}
                          prefetch={false}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-white/5"
                        >
                          <div className="min-w-0">
                            <div className="truncate">{a.name}</div>
                            <div className="text-xs text-white/60 truncate">{a.blurb}</div>
                          </div>
                          <div className="text-xs text-white/70 whitespace-nowrap pl-2">
                            {min != null ? <>from <span className="font-semibold">${min.toFixed(2)}</span></> : 'View'}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Browse grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl md:text-3xl font-bold">Browse accounts</h2>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {browse.map((a) => {
              const min = fromPrice(a);
              return (
                <motion.div
                  key={a.slug}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl p-[1.5px] ${a.vibe?.ring ? `bg-gradient-to-r ${a.vibe.ring} ${a.vibe.glow ?? ''}` : 'bg-white/10'}`}
                >
                  <div className="rounded-[18px] bg-black/40 border border-white/10 p-4 h-full flex flex-col">
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-white/60 mt-0.5 line-clamp-2">{a.blurb}</div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      {min != null && (
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wide text-white/50">from</div>
                          <div className="text-sm font-semibold">${min.toFixed(2)}</div>
                        </div>
                      )}
                      <Link
                        href={`/accounts/${a.slug}`}
                        prefetch={false}
                        className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm"
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
              <Link href="/">Home</Link>
              <Link href="/filehost">Filehosts</Link>
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
