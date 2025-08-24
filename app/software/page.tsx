// app/software/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, ArrowLeftRight, Filter } from 'lucide-react';

import { SOFTWARE, type SoftwareProduct } from '../../data/software';

type Cat = SoftwareProduct['category'] | 'All';
type Platform = 'All' | 'Windows' | 'macOS' | 'Linux' | 'Cross-platform';

function fromPrice(p: SoftwareProduct) {
  if (!p.skus?.length) return null;
  const min = Math.min(...p.skus.map(s => s.priceUSD));
  return Number.isFinite(min) ? min : null;
}

export default function SoftwareIndexPage() {
  const ALL = useMemo(() => SOFTWARE, []);
  const LIVE = useMemo(() => ALL.filter(p => p.status === 'live'), [ALL]);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Cat>('All');
  const [plat, setPlat] = useState<Platform>('All');
  const [maxPrice, setMaxPrice] = useState<'any' | 25 | 50 | 100 | 200>('any');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LIVE
      .filter(p => (cat === 'All' ? true : p.category === cat))
      .filter(p => (plat === 'All' ? true : p.skus.some(k => k.platform === plat)))
      .filter(p => {
        if (maxPrice === 'any') return true;
        return p.skus.some(k => k.priceUSD <= maxPrice);
      })
      .filter(p => {
        if (!s) return true;
        const hay = [
          p.name, p.vendor ?? '', p.blurb, p.slug,
          ...p.features,
          ...(p.skus?.map(k => `${k.label} ${k.priceUSD} ${k.license} ${k.platform}`) ?? []),
        ].join(' • ').toLowerCase();
        return hay.includes(s);
      })
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [LIVE, q, cat, plat, maxPrice]);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link href="/filehost" className="hover:text-white">Filehosts</Link>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-white/15 bg-white/10">Software</span>
            <Link href="/accounts" className="hover:text-white">Game Accounts</Link>
          </nav>
        </div>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Software</h1>
        <p className="mt-2 text-white/70 max-w-2xl">Official keys with instant email delivery. Search, filter, and check out in seconds.</p>

        {/* Controls */}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Search software, vendor, license, platform…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none"
            />
          </div>
          <select value={cat} onChange={e=>setCat(e.target.value as Cat)} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm">
            {['All','OS','Office','Security','Creative','Utility','Developer'].map(x=> <option key={x} value={x}>{x}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={plat} onChange={e=>setPlat(e.target.value as Platform)} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm">
              {['All','Windows','macOS','Linux','Cross-platform'].map(x=> <option key={x} value={x}>{x}</option>)}
            </select>
            <select value={String(maxPrice)} onChange={e=>setMaxPrice((e.target.value as any)==='any'?'any':Number(e.target.value) as any)} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm">
              <option value="any">Any price</option>
              <option value="25">Under $25</option>
              <option value="50">Under $50</option>
              <option value="100">Under $100</option>
              <option value="200">Under $200</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No software matches your filters.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => {
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
                    <div className="rounded-[18px] bg-black/40 border border-white/10 p-5 h-full flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-grid place-items-center h-9 w-9 rounded-lg text-sm font-bold bg-gradient-to-br ${p.vibe.mono}`}>
                            {p.monogram}
                          </span>
                          <div>
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-xs text-white/60">{p.vendor ?? p.category}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] tracking-wide uppercase px-2 py-1 rounded-md bg-gradient-to-r ${p.vibe.chip}`}>
                          {p.status === 'live' ? 'Live' : 'Soon'}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.blurb}</p>

                      <div className="mt-4 flex items-center justify-between">
                        {price != null ? (
                          <div className="text-sm">
                            <div className="text-[10px] uppercase tracking-wide text-white/50">from</div>
                            <div className="font-semibold">${price.toFixed(2)}</div>
                          </div>
                        ) : <span />}

                        <Link
                          href={`/software/${p.slug}`}
                          prefetch={false}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm"
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
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
            <span className="font-semibold text-white">Only.Exchange</span>
          </div>
          <p className="mt-6 text-xs text-white/60">© 2025 Only.Exchange</p>
        </div>
      </footer>
    </div>
  );
}
