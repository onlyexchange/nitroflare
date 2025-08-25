// app/software/page.tsx
'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { SOFTWARE, type SoftwareProduct } from '../../data/software';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Platform = 'Windows' | 'macOS' | 'Linux' | 'Cross-platform';
type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

const FALLBACK_IMG = '/images/software/_placeholder.png';
const PAGE_SIZE = 16;

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}
function fromPrice(p: SoftwareProduct) {
  if (!p.skus?.length) return null;
  const min = Math.min(...p.skus.map(s => s.priceUSD));
  return Number.isFinite(min) ? min : null;
}
function imgFor(p: SoftwareProduct) {
  if (p.image) return p.image;
  return `/images/software/${p.slug}.png`;
}
function toggleSet<T>(setter: (fn: (prev: Set<T>) => Set<T>) => void, v: T) {
  setter(prev => {
    const next = new Set(prev);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  });
}

// compact page list like: 1 … 4 5 [6] 7 8 … 20
function pageList(current: number, count: number): (number | '…')[] {
  const set = new Set<number>();
  for (let i = current - 2; i <= current + 2; i++) if (i >= 1 && i <= count) set.add(i);
  set.add(1);
  set.add(count);
  const arr = Array.from(set).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]!);
    if (i < arr.length - 1 && arr[i + 1]! - arr[i]! > 1) out.push('…');
  }
  return out;
}

export default function SoftwarePage() {
  // 1) Source: live, dedup
  const PRODUCTS = useMemo(() => {
    const live = (SOFTWARE || []).filter(p => p.status === 'live');
    const uniq = new Map<string, SoftwareProduct>();
    for (const p of live) uniq.set(p.slug, p);
    return Array.from(uniq.values());
  }, []);

  // 2) UI state
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [selVendors, setSelVendors] = useState<Set<string>>(new Set());
  const [selCats, setSelCats] = useState<Set<SoftwareProduct['category']>>(new Set());
  const [selPlats, setSelPlats] = useState<Set<Platform>>(new Set());
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Pagination (init from ?page=)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPage = Math.max(1, Number(searchParams.get('page') || '1') || 1);
  const [page, setPage] = useState<number>(initialPage);

  // Reset to page 1 whenever filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [q, sortBy, selVendors, selCats, selPlats, minPrice, maxPrice]);

  // Sync page -> URL (?page=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [page, pathname, router]);

  // Quick UX: "/" focuses search; Esc clears
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as any)?.tagName || '';
      if (e.key === '/' && !/input|textarea/i.test(tag)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setQ('');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // 3) Enumerations for filters
  const allVendors = useMemo(
    () => Array.from(new Set(PRODUCTS.map(p => p.vendor ?? '').filter(Boolean))).sort(),
    [PRODUCTS]
  );
  const allCats = useMemo(
    () => Array.from(new Set(PRODUCTS.map(p => p.category))).sort(),
    [PRODUCTS]
  );
  const allPlats: Platform[] = useMemo(() => {
    const s = new Set<Platform>();
    for (const p of PRODUCTS) for (const k of (p.skus ?? [])) s.add(k.platform as Platform);
    return ['Windows', 'macOS', 'Linux', 'Cross-platform'].filter(x => s.has(x as Platform)) as Platform[];
  }, [PRODUCTS]);

  // 4) Filter + sort (single source of truth)
  const query = norm(q);
  const results = useMemo(() => {
    const min = typeof minPrice === 'number' ? minPrice : 0;
    const max = typeof maxPrice === 'number' ? maxPrice : Infinity;

    const filtered = PRODUCTS
      .map(p => ({
        p,
        nameNorm: norm(p.name),
        price: fromPrice(p),
        plats: (p.skus?.map(s => s.platform) ?? []) as Platform[],
      }))
      .filter(({ p, nameNorm, price, plats }) => {
        if (query && !nameNorm.includes(query)) return false; // title-only
        if (selVendors.size) {
          const v = (p.vendor ?? '');
          if (!(selVendors.has(v) || selVendors.has(v.toLowerCase()))) return false;
        }
        if (selCats.size && !selCats.has(p.category)) return false;
        if (selPlats.size && !plats.some(pl => selPlats.has(pl))) return false;
        if (price != null && (price < min || price > max)) return false;
        return true;
      });

    filtered.sort((a, b) => {
      if (sortBy === 'relevance') {
        if (query) {
          const aStarts = a.nameNorm.startsWith(query) ? 1 : 0;
          const bStarts = b.nameNorm.startsWith(query) ? 1 : 0;
          if (bStarts !== aStarts) return bStarts - aStarts;
          const ai = a.nameNorm.indexOf(query);
          const bi = b.nameNorm.indexOf(query);
          if (ai !== bi) return ai - bi;
        }
        const ap = a.price ?? Infinity, bp = b.price ?? Infinity;
        if (ap !== bp) return ap - bp;
        return a.p.name.localeCompare(b.p.name);
      }
      if (sortBy === 'price-asc') {
        const ap = a.price ?? Infinity, bp = b.price ?? Infinity;
        if (ap !== bp) return ap - bp;
        return a.p.name.localeCompare(b.p.name);
      }
      if (sortBy === 'price-desc') {
        const ap = a.price ?? -Infinity, bp = b.price ?? -Infinity;
        if (ap !== bp) return bp - ap;
        return a.p.name.localeCompare(b.p.name);
      }
      return a.p.name.localeCompare(b.p.name);
    });

    return filtered.map(x => x.p);
  }, [PRODUCTS, query, selVendors, selCats, selPlats, minPrice, maxPrice, sortBy]);

  // 5) Pagination slice
  const total = results.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const curPage = Math.min(Math.max(1, page), pageCount);
  const start = total === 0 ? 0 : (curPage - 1) * PAGE_SIZE;
  const end = total === 0 ? 0 : Math.min(start + PAGE_SIZE, total);
  const pageItems = results.slice(start, end);

  function clearAll() {
    setQ('');
    setSelVendors(new Set());
    setSelCats(new Set());
    setSelPlats(new Set());
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');
  }

  // 6) Render
  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="font-semibold">Only.Exchange</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link href="/filehost" className="hover:text-white">Filehosts</Link>
            <span className="px-3 py-1 rounded-xl border border-white/15 bg-white/10">Software</span>
            <Link href="/accounts" className="hover:text-white">Game Accounts</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Software</h1>

        {/* Search */}
        <div className="mt-4">
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Type a product title… e.g., AVG, Microsoft Office, Windows 11"
            className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 outline-none text-base"
          />
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-white/70">
            Showing{' '}
            <span className="text-white font-medium">
              {total === 0 ? 0 : `${start + 1}-${end}`}
            </span>{' '}
            of <span className="text-white font-medium">{total}</span> results
            {total > 0 && <> (page {curPage} of {pageCount})</>}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none text-sm"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Sort: Price ↑</option>
              <option value="price-desc">Sort: Price ↓</option>
              <option value="name-asc">Sort: Name A–Z</option>
            </select>
            <button
              onClick={clearAll}
              className="text-sm px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar filters */}
          <aside className="space-y-4">
            <Section title="Vendor">
              <div className="flex flex-col gap-2">
                {allVendors.map(v => {
                  const checked = selVendors.has(v) || selVendors.has(v.toLowerCase());
                  return (
                    <label key={v} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={checked}
                        onChange={() => toggleSet(setSelVendors, v)}
                      />
                      {v}
                    </label>
                  );
                })}
              </div>
            </Section>

            <Section title="Category">
              <div className="flex flex-col gap-2">
                {allCats.map(c => {
                  const checked = selCats.has(c);
                  return (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={checked}
                        onChange={() => toggleSet(setSelCats, c)}
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            </Section>

            <Section title="Platform">
              <div className="flex flex-col gap-2">
                {allPlats.map(p => {
                  const checked = selPlats.has(p);
                  return (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={checked}
                        onChange={() => toggleSet(setSelPlats, p)}
                      />
                      {p}
                    </label>
                  );
                })}
              </div>
            </Section>

            <Section title="Price">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[10, 20, 25, 50, 100].map(n => (
                  <button
                    key={n}
                    onClick={() => setMaxPrice(n)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Under ${n}
                  </button>
                ))}
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Any
                </button>
              </div>
            </Section>
          </aside>

          {/* Results grid – renders only paged results */}
          <div>
            {total === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                No software matches your filters.
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {pageItems.map(p => <Card key={p.slug} p={p} q={query} />)}
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                  <nav className="mt-6 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, curPage - 1))}
                      disabled={curPage === 1}
                      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-50"
                    >
                      Prev
                    </button>

                    {pageList(curPage, pageCount).map((token, i) =>
                      token === '…' ? (
                        <span key={`dots-${i}`} className="px-2 text-white/50">…</span>
                      ) : (
                        <button
                          key={token}
                          onClick={() => setPage(token as number)}
                          className={`px-3 py-2 rounded-lg border ${
                            token === curPage
                              ? 'border-white/30 bg-white/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                          aria-current={token === curPage ? 'page' : undefined}
                        >
                          {token}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setPage(Math.min(pageCount, curPage + 1))}
                      disabled={curPage === pageCount}
                      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="font-semibold text-white">Only.Exchange</div>
          <p className="mt-6 text-xs text-white/60">© 2025 Only.Exchange</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Little components ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="px-4 py-3 text-sm font-semibold">{title}</div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

function highlightTitle(text: string, q: string) {
  if (!q) return text;
  const tNorm = norm(text);
  const i = tNorm.indexOf(q);
  if (i < 0) return text;
  const before = text.slice(0, i);
  const match = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <>
      {before}
      <mark className="rounded px-0.5 bg-yellow-400/20 text-yellow-200">{match}</mark>
      {after}
    </>
  );
}

function Card({ p, q }: { p: SoftwareProduct; q: string }) {
  const price = fromPrice(p);
  return (
    <div className={`rounded-2xl p-[1.5px] bg-gradient-to-r ${p.vibe.ring} ${p.vibe.glow}`}>
      <div className="rounded-[18px] bg-black/40 border border-white/10 p-5 h-full flex flex-col">
        <div className="w-full h-40 md:h-44 rounded-xl overflow-hidden bg-white/5 border border-white/10">
          <img
            src={imgFor(p)}
            alt={p.name}
            className="h-full w-full object-contain p-3"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (!el.src.endsWith(FALLBACK_IMG)) el.src = FALLBACK_IMG;
            }}
            loading="lazy"
          />
        </div>

        <div className="mt-4 min-w-0">
          <div className="font-semibold leading-snug line-clamp-2 break-words">
            {highlightTitle(p.name, q)}
          </div>
          <div className="text-xs text-white/60 mt-0.5">{p.vendor ?? p.category}</div>
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
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
}
