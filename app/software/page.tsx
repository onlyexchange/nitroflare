// app/software/page.tsx
'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ArrowLeftRight,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  Rows,
  Star,
  Sparkles,
} from 'lucide-react';

import { SOFTWARE, type SoftwareProduct } from '../../data/software';

type Cat = SoftwareProduct['category'];
type Platform = 'Windows' | 'macOS' | 'Linux' | 'Cross-platform';
type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';
type ViewMode = 'grid' | 'list';

function fromPrice(p: SoftwareProduct) {
  if (!p.skus?.length) return null;
  const min = Math.min(...p.skus.map(s => s.priceUSD));
  return Number.isFinite(min) ? min : null;
}

// Simple image resolver; customize paths as you like
const FALLBACK_IMG = '/images/software/_placeholder.png';
function imgFor(p: SoftwareProduct) {
  // Try product image first; you can also add vendor-based fallbacks if you want:
  // e.g. `/images/vendors/${(p.vendor ?? '').toLowerCase().replace(/\s+/g,'-')}.png`
  return `/images/software/${p.slug}.png`;
}

// safe normalize (no ES2018 regex flags)
function norm(s: string) {
  try {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip combining marks (diacritics)
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return s.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}

function fuzzyIncludes(hay: string, needle: string) {
  if (!needle) return true;
  if (hay.includes(needle)) return true;
  if (needle.length < 4) return false;
  for (let i = 0; i < needle.length; i++) {
    const n = needle.slice(0, i) + needle.slice(i + 1);
    if (hay.includes(n)) return true;
  }
  return false;
}

type ParsedQuery = {
  terms: string[];
  minusTerms: string[];
  fields: {
    vendor?: string[];
    cat?: string[];
    platform?: string[];
    license?: string[];
    min?: number;
    max?: number;
  };
};

function parseQuery(q: string): ParsedQuery {
  const res: ParsedQuery = { terms: [], minusTerms: [], fields: {} };
  if (!q.trim()) return res;

  const parts: string[] = [];
  q.replace(/"([^"]+)"|(\S+)/g, (_m, quoted, bare) => {
    parts.push(quoted ?? bare);
    return '';
  });

  for (const raw of parts) {
    const t = raw.trim();
    if (!t) continue;

    const fm = t.match(/^([a-z]+):(.*)$/i);
    if (fm) {
      const key = fm[1].toLowerCase();
      const val = fm[2].trim();
      if (!val) continue;

      if (key === 'vendor') (res.fields.vendor ??= []).push(val);
      else if (key === 'cat' || key === 'category') (res.fields.cat ??= []).push(val);
      else if (key === 'platform' || key === 'plat') (res.fields.platform ??= []).push(val);
      else if (key === 'license' || key === 'lic') (res.fields.license ??= []).push(val);
      else if (key === 'min') res.fields.min = Number(val);
      else if (key === 'max') res.fields.max = Number(val);
      else res.terms.push(t);
      continue;
    }

    const pm = t.match(/^(?:price)?\s*([<>]=?)\s*(\d+(?:\.\d+)?)/i);
    if (pm) {
      const op = pm[1];
      const num = Number(pm[2]);
      if (op === '<' || op === '<=') res.fields.max = Math.min(num, res.fields.max ?? Infinity);
      if (op === '>' || op === '>=') res.fields.min = Math.max(num, res.fields.min ?? 0);
      continue;
    }

    if (t.startsWith('-')) res.minusTerms.push(t.slice(1));
    else res.terms.push(t);
  }

  const syn: Record<string, string[]> = {
    av: ['antivirus', 'security', 'internet security'],
    m365: ['microsoft 365', 'office 365'],
    vs: ['visual studio'],
    ltsc: ['long term servicing', 'enterprise ltsc'],
  };
  const extra: string[] = [];
  for (const term of res.terms) {
    const e = syn[term.toLowerCase()];
    if (e) extra.push(...e);
  }
  res.terms.push(...extra);
  return res;
}

function tokenScore(hay: string, token: string, weight: { start?: number; inword?: number; fuzzy?: number }) {
  if (!token) return 0;
  if (hay.startsWith(token)) return weight.start ?? 0;
  if (hay.includes(token)) return weight.inword ?? 0;
  if (fuzzyIncludes(hay, token)) return weight.fuzzy ?? 0;
  return 0;
}

function highlight(text: string, terms: string[]) {
  if (!terms.length) return text as unknown as any;
  const safe = terms
    .map(norm)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!safe.length) return text as unknown as any;
  const regex = new RegExp(`(${safe.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded px-0.5 bg-yellow-400/20 text-yellow-200">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// ---------- facet counts type + helper (no ReturnType<> usage) ----------
type FacetCounts = {
  byCat: Map<string, number>;
  byVendor: Map<string, number>;
  byPlat: Map<Platform, number>;
  byLic: Map<string, number>;
};

function countFrom(pool: SoftwareProduct[]): FacetCounts {
  const byCat = new Map<string, number>();
  const byVendor = new Map<string, number>();
  const byPlat = new Map<Platform, number>();
  const byLic = new Map<string, number>();
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);
    const v = p.vendor ?? '';
    if (v) byVendor.set(v, (byVendor.get(v) ?? 0) + 1);
    const skus = p.skus ?? [];
    for (let j = 0; j < skus.length; j++) {
      const s = skus[j];
      byLic.set(s.license, (byLic.get(s.license) ?? 0) + 1);
      byPlat.set(s.platform as Platform, (byPlat.get(s.platform as Platform) ?? 0) + 1);
    }
  }
  return { byCat, byVendor, byPlat, byLic };
}

export default function SoftwareIndexPage() {
  const ALL = useMemo(() => SOFTWARE, []);
  const LIVE = useMemo(() => ALL.filter(p => p.status === 'live'), [ALL]);

  // Search / query input
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const parsed = useMemo(() => parseQuery(dq), [dq]);

  // UI filters (facets)
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [selVendors, setSelVendors] = useState<Set<string>>(new Set());
  const [selPlatforms, setSelPlatforms] = useState<Set<Platform>>(new Set());
  const [selLicenses, setSelLicenses] = useState<Set<string>>(new Set());
  const [minPriceUI, setMinPriceUI] = useState<number | ''>('');
  const [maxPriceUI, setMaxPriceUI] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [view, setView] = useState<ViewMode>('grid');

  // mobile filter panel
  const [openFilters, setOpenFilters] = useState(false);

  // keyboard UX
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as any)?.tagName || '';
      if (e.key === '/' && !/input|textarea/i.test(tag)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setQ('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Build index for scoring + normalized haystacks
  const INDEX = useMemo(() => {
    return LIVE.map(p => {
      const skuLabels = p.skus?.map(s => `${s.label} ${s.license} ${s.platform}`) ?? [];
      const skuPlatforms = (p.skus?.map(s => s.platform) ?? []) as Platform[];
      const hayName = norm(p.name);
      const hayVendor = norm(p.vendor ?? '');
      const hayBlurb = norm(p.blurb ?? '');
      const haySlug = norm(p.slug);
      const hayFeat = norm((p.features ?? []).join(' • '));
      const haySku = norm(skuLabels.join(' • '));
      const price = fromPrice(p);
      return {
        p,
        price,
        hay: { hayName, hayVendor, hayBlurb, haySlug, hayFeat, haySku },
        platforms: skuPlatforms,
      };
    });
  }, [LIVE]);

  // Helpers to toggle sets
  function toggleSet<T>(setter: (fn: (prev: Set<T>) => Set<T>) => void, value: T) {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }
  function clearAllFilters() {
    setSelCats(new Set());
    setSelVendors(new Set());
    setSelPlatforms(new Set());
    setSelLicenses(new Set());
    setMinPriceUI('');
    setMaxPriceUI('');
    setQ('');
    setSortBy('relevance');
  }

  // Core filtering + scoring
  const resultsScored = useMemo(() => {
    const fieldMin = parsed.fields.min ?? 0;
    const fieldMax = parsed.fields.max ?? Infinity;
    const uiMin = typeof minPriceUI === 'number' ? minPriceUI : 0;
    const uiMax = typeof maxPriceUI === 'number' ? maxPriceUI : Infinity;
    const effMin = Math.max(fieldMin, uiMin, 0);
    const effMax = Math.min(fieldMax, uiMax);

    const terms = parsed.terms.map(norm).filter(Boolean);
    const minus = parsed.minusTerms.map(norm).filter(Boolean);

    const filtered = INDEX
      .filter(({ p, price, hay, platforms }) => {
        if (selCats.size && !selCats.has(p.category)) return false;
        if (selVendors.size) {
          const v = (p.vendor ?? '');
          if (!(selVendors.has(v) || selVendors.has(v.toLowerCase()))) return false;
        }
        if (selPlatforms.size && !platforms.some(pl => selPlatforms.has(pl))) return false;
        if (selLicenses.size && !(p.skus ?? []).some(s => selLicenses.has(s.license))) return false;

        if (price != null && (price < effMin || price > effMax)) return false;

        if (parsed.fields.vendor?.length) {
          const ok = parsed.fields.vendor.some(v => hay.hayVendor.includes(norm(v)));
          if (!ok) return false;
        }
        if (parsed.fields.cat?.length) {
          const ok = parsed.fields.cat.some(v => norm(p.category).includes(norm(v)));
          if (!ok) return false;
        }
        if (parsed.fields.platform?.length) {
          const ok = parsed.fields.platform.some(v => platforms.map(norm).some(pp => pp.includes(norm(v))));
          if (!ok) return false;
        }
        if (parsed.fields.license?.length) {
          const ok = parsed.fields.license.some(v =>
            (p.skus ?? []).some(s => norm(s.license).includes(norm(v))),
          );
          if (!ok) return false;
        }
        if (!(price == null || (price >= (parsed.fields.min ?? 0) && price <= (parsed.fields.max ?? Infinity))))
          return false;

        if (minus.length) {
          const big = `${hay.hayName} • ${hay.hayVendor} • ${hay.hayFeat} • ${hay.haySku} • ${hay.hayBlurb} • ${hay.haySlug}`;
          for (let i = 0; i < minus.length; i++) if (big.includes(minus[i])) return false;
        }

        if (terms.length) {
          const big = `${hay.hayName} • ${hay.hayVendor} • ${hay.hayFeat} • ${hay.haySku} • ${hay.hayBlurb} • ${hay.haySlug}`;
          for (let i = 0; i < terms.length; i++) {
            const t = terms[i];
            if (!(big.includes(t) || fuzzyIncludes(big, t))) return false;
          }
        }
        return true;
      })
      .map(({ p, price, hay }) => {
        let score = 0;
        for (let i = 0; i < terms.length; i++) {
          const t = terms[i];
          score += tokenScore(hay.hayName, t, { start: 20, inword: 12, fuzzy: 8 });
          score += tokenScore(hay.hayVendor, t, { start: 10, inword: 8, fuzzy: 5 });
          score += tokenScore(hay.hayFeat, t, { start: 6, inword: 5, fuzzy: 3 });
          score += tokenScore(hay.haySku, t, { start: 6, inword: 5, fuzzy: 3 });
          score += tokenScore(hay.hayBlurb, t, { start: 4, inword: 3, fuzzy: 2 });
          score += tokenScore(hay.haySlug, t, { start: 2, inword: 2, fuzzy: 1 });
        }
        if (selCats.size && selCats.has(p.category)) score += 4;
        return { p, price, score };
      });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'relevance') {
        if (b.score !== a.score) return b.score - a.score;
        if ((a.price ?? Infinity) !== (b.price ?? Infinity)) return (a.price ?? Infinity) - (b.price ?? Infinity);
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

    return sorted;
  }, [INDEX, parsed, selCats, selVendors, selPlatforms, selLicenses, minPriceUI, maxPriceUI, sortBy]);

  const results = resultsScored.map(x => x.p);

  // helper to recompute pools with one facet ignored (for live counts)
  function resultsOf(opts: { ignore?: 'cat' | 'vendor' | 'platform' | 'license' }) {
    const fieldMin = parsed.fields.min ?? 0;
    const fieldMax = parsed.fields.max ?? Infinity;
    const uiMin = typeof minPriceUI === 'number' ? minPriceUI : 0;
    const uiMax = typeof maxPriceUI === 'number' ? maxPriceUI : Infinity;
    const effMin = Math.max(fieldMin, uiMin, 0);
    const effMax = Math.min(fieldMax, uiMax);
    const terms = parsed.terms.map(norm).filter(Boolean);
    const minus = parsed.minusTerms.map(norm).filter(Boolean);

    return INDEX.filter(({ p, price, hay, platforms }) => {
      if (opts.ignore !== 'cat' && selCats.size && !selCats.has(p.category)) return false;
      if (opts.ignore !== 'vendor' && selVendors.size) {
        const v = p.vendor ?? '';
        if (!(selVendors.has(v) || selVendors.has(v.toLowerCase()))) return false;
      }
      if (opts.ignore !== 'platform' && selPlatforms.size && !platforms.some(pl => selPlatforms.has(pl))) return false;
      if (opts.ignore !== 'license' && selLicenses.size && !(p.skus ?? []).some(s => selLicenses.has(s.license))) return false;
      if (price != null && (price < effMin || price > effMax)) return false;

      if (parsed.fields.vendor?.length) {
        let ok = false;
        for (let i = 0; i < parsed.fields.vendor.length; i++) if (hay.hayVendor.includes(norm(parsed.fields.vendor[i]!))) { ok = true; break; }
        if (!ok) return false;
      }
      if (parsed.fields.cat?.length) {
        let ok = false;
        for (let i = 0; i < parsed.fields.cat.length; i++) if (norm(p.category).includes(norm(parsed.fields.cat[i]!))) { ok = true; break; }
        if (!ok) return false;
      }
      if (parsed.fields.platform?.length) {
        const platsNorm = platforms.map(norm);
        let ok = false;
        for (let i = 0; i < parsed.fields.platform.length; i++) {
          const pv = norm(parsed.fields.platform[i]!);
          for (let j = 0; j < platsNorm.length; j++) if (platsNorm[j].includes(pv)) { ok = true; break; }
          if (ok) break;
        }
        if (!ok) return false;
      }
      if (parsed.fields.license?.length) {
        let ok = false;
        const skus = p.skus ?? [];
        for (let i = 0; i < parsed.fields.license.length; i++) {
          const lv = norm(parsed.fields.license[i]!);
          for (let j = 0; j < skus.length; j++) if (norm(skus[j].license).includes(lv)) { ok = true; break; }
          if (ok) break;
        }
        if (!ok) return false;
      }
      if (!(price == null || (price >= (parsed.fields.min ?? 0) && price <= (parsed.fields.max ?? Infinity))))
        return false;

      if (minus.length) {
        const big = `${hay.hayName} • ${hay.hayVendor} • ${hay.hayFeat} • ${hay.haySku} • ${hay.hayBlurb} • ${hay.haySlug}`;
        for (let i = 0; i < minus.length; i++) if (big.includes(minus[i])) return false;
      }
      if (terms.length) {
        const big = `${hay.hayName} • ${hay.hayVendor} • ${hay.hayFeat} • ${hay.haySku} • ${hay.hayBlurb} • ${hay.haySlug}`;
        for (let i = 0; i < terms.length; i++) if (!(big.includes(terms[i]) || fuzzyIncludes(big, terms[i]!))) return false;
      }
      return true;
    }).map(x => x.p);
  }

  const poolForCats = useMemo(() => resultsOf({ ignore: 'cat' }), [parsed, selVendors, selPlatforms, selLicenses, minPriceUI, maxPriceUI, sortBy, INDEX]);
  const poolForVendors = useMemo(() => resultsOf({ ignore: 'vendor' }), [parsed, selCats, selPlatforms, selLicenses, minPriceUI, maxPriceUI, sortBy, INDEX]);
  const poolForPlatforms = useMemo(() => resultsOf({ ignore: 'platform' }), [parsed, selCats, selVendors, selLicenses, minPriceUI, maxPriceUI, sortBy, INDEX]);
  const poolForLicenses = useMemo(() => resultsOf({ ignore: 'license' }), [parsed, selCats, selVendors, selPlatforms, minPriceUI, maxPriceUI, sortBy, INDEX]);

  const catsCounts = useMemo(() => countFrom(poolForCats), [poolForCats]);
  const vendorsCounts = useMemo(() => countFrom(poolForVendors), [poolForVendors]);
  const platsCounts = useMemo(() => countFrom(poolForPlatforms), [poolForPlatforms]);
  const licCounts = useMemo(() => countFrom(poolForLicenses), [poolForLicenses]);

  // Source-of-truth enumerations (dynamic from data)
  const allCategories = useMemo(
    () => Array.from(new Set(LIVE.map(p => p.category))).sort(),
    [LIVE],
  );
  const allVendors = useMemo(() => {
    const map = vendorsCounts.byVendor;
    const uniques = Array.from(new Set(LIVE.map(p => p.vendor ?? ''))).filter(Boolean) as string[];
    return uniques.sort((a, b) => (map.get(b) ?? 0) - (map.get(a) ?? 0) || a.localeCompare(b)).slice(0, 18);
  }, [LIVE, vendorsCounts]);
  const allPlatforms: Platform[] = useMemo(
    () => ['Windows', 'macOS', 'Linux', 'Cross-platform'],
    [],
  );
  const allLicenses = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < LIVE.length; i++) {
      const skus = LIVE[i].skus ?? [];
      for (let j = 0; j < skus.length; j++) set.add(skus[j].license);
    }
    return Array.from(set).sort();
  }, [LIVE]);

  // Featured picks
  const featuredSlugs = [
    'windows-11-pro', 'office-2021-pro-plus', 'bitdefender-total-security',
    'windows-server-2022-standard', 'visual-studio-2022-pro', 'filmora-12-lifetime',
  ];
  const featured = useMemo(() => {
    const map = new Map(ALL.map(p => [p.slug, p]));
    const picks: SoftwareProduct[] = [];
    for (let i = 0; i < featuredSlugs.length; i++) {
      const hit = map.get(featuredSlugs[i]!);
      if (hit) picks.push(hit);
    }
    if (picks.length < 6) {
      const cheap = [...LIVE]
        .map(p => ({ p, price: fromPrice(p) ?? Infinity }))
        .sort((a, b) => a.price - b.price)
        .slice(0, 8)
        .map(x => x.p);
      for (let i = 0; i < cheap.length && picks.length < 6; i++) {
        if (!picks.find(pp => pp.slug === cheap[i]!.slug)) picks.push(cheap[i]!);
      }
    }
    return picks.slice(0, 6);
  }, [ALL, LIVE]);

  const highlightTerms = useMemo(() => parsed.terms, [parsed.terms]);
  const totalLive = LIVE.length;

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/35 border-b border-white/10">
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

      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-600/10 via-fuchsia-600/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-start md:items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-white/60">
                <Sparkles className="h-4 w-4" />
                Curated, instant-delivery software keys
              </div>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">Software Marketplace</h1>
              <p className="mt-2 text-white/70 max-w-2xl">
                Search, facet-filter, and check out in seconds. {totalLive} products live.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setOpenFilters(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => setView('grid')} className={`p-2 rounded-lg border ${view==='grid'?'border-white/30 bg-white/10':'border-white/10 bg-white/5'} hover:bg-white/10`}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2 rounded-lg border ${view==='list'?'border-white/30 bg-white/10':'border-white/10 bg-white/5'} hover:bg-white/10`}>
                  <Rows className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Big Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={`Try: vendor:microsoft cat:Office max:25 "windows 11" -home`}
              className="w-full pl-11 pr-3 py-3.5 rounded-2xl bg-white/5 border border-white/10 outline-none text-base"
            />
            {/* Quick chips */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
              {[
                { label: 'Under $25', action: () => setMaxPriceUI(25) },
                { label: 'Microsoft', action: () => toggleSet(setSelVendors, 'Microsoft') },
                { label: 'Office', action: () => toggleSet(setSelCats, 'Office' as Cat) },
                { label: 'Security', action: () => toggleSet(setSelCats, 'Security' as Cat) },
                { label: 'macOS', action: () => toggleSet(setSelPlatforms, 'macOS') },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-300" />
              <h2 className="text-sm font-semibold tracking-wide uppercase">Featured Picks</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
              Smartly selected by price & popularity
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {featured.map(p => <Card key={`feat-${p.slug}`} p={p} terms={highlightTerms} view="grid" />)}
          </div>
        </div>
      </section>

      {/* Body: sidebar + results */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <FacetPanel
              allCategories={allCategories}
              allVendors={allVendors}
              allPlatforms={allPlatforms}
              allLicenses={allLicenses}
              catsCounts={catsCounts}
              vendorsCounts={vendorsCounts}
              platsCounts={platsCounts}
              licCounts={licCounts}
              selCats={selCats}
              selVendors={selVendors}
              selPlatforms={selPlatforms}
              selLicenses={selLicenses}
              setSelCats={setSelCats}
              setSelVendors={setSelVendors}
              setSelPlatforms={setSelPlatforms}
              setSelLicenses={setSelLicenses}
              minPriceUI={minPriceUI}
              maxPriceUI={maxPriceUI}
              setMinPriceUI={setMinPriceUI}
              setMaxPriceUI={setMaxPriceUI}
              clearAllFilters={clearAllFilters}
            />
          </aside>

          {/* Results + toolbar */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm"
                  onClick={() => setOpenFilters(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <div className="text-sm text-white/70">
                  Showing <span className="text-white font-medium">{results.length}</span> of{' '}
                  <span className="text-white font-medium">{totalLive}</span> products
                </div>
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
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => setView('grid')} className={`p-2 rounded-lg border ${view==='grid'?'border-white/30 bg-white/10':'border-white/10 bg-white/5'} hover:bg-white/10`}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setView('list')} className={`p-2 rounded-lg border ${view==='list'?'border-white/30 bg-white/10':'border-white/10 bg-white/5'} hover:bg-white/10`}>
                    <Rows className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            <ActivePills
              q={q}
              setQ={setQ}
              selCats={selCats}
              selVendors={selVendors}
              selPlatforms={selPlatforms}
              selLicenses={selLicenses}
              minPriceUI={minPriceUI}
              maxPriceUI={maxPriceUI}
              clearAllFilters={clearAllFilters}
              remove={(type, value) => {
                if (type === 'cat') toggleSet(setSelCats, value);
                if (type === 'vendor') toggleSet(setSelVendors, value);
                if (type === 'platform') toggleSet(setSelPlatforms, value);
                if (type === 'license') toggleSet(setSelLicenses, value);
                if (type === 'min') setMinPriceUI('');
                if (type === 'max') setMaxPriceUI('');
              }}
            />

            {/* Results */}
            {results.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                No software matches your filters.
                <div className="mt-3 text-xs text-white/60">
                  Tips: use quotes (<code>"windows 11"</code>), negate (<code>-home</code>), and fields like{' '}
                  <code>vendor:microsoft</code>, <code>cat:Security</code>, <code>platform:macOS</code>, <code>max:25</code>.
                </div>
              </div>
            ) : view === 'grid' ? (
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {results.map(p => <Card key={p.slug} p={p} terms={highlightTerms} view="grid" />)}
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {results.map(p => <Card key={`list-${p.slug}`} p={p} terms={highlightTerms} view="list" />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter slide-over */}
      <AnimatePresence>
        {openFilters && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpenFilters(false)} />
            <motion.div
              className="absolute right-0 top-0 h-full w-[85%] max-w-md bg-[#0b0b12] border-l border-white/10 p-5 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <div className="font-semibold">Filters</div>
                </div>
                <button
                  onClick={() => setOpenFilters(false)}
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <FacetPanel
                  allCategories={allCategories}
                  allVendors={allVendors}
                  allPlatforms={allPlatforms}
                  allLicenses={allLicenses}
                  catsCounts={catsCounts}
                  vendorsCounts={vendorsCounts}
                  platsCounts={platsCounts}
                  licCounts={licCounts}
                  selCats={selCats}
                  selVendors={selVendors}
                  selPlatforms={selPlatforms}
                  selLicenses={selLicenses}
                  setSelCats={setSelCats}
                  setSelVendors={setSelVendors}
                  setSelPlatforms={setSelPlatforms}
                  setSelLicenses={setSelLicenses}
                  minPriceUI={minPriceUI}
                  maxPriceUI={maxPriceUI}
                  setMinPriceUI={setMinPriceUI}
                  setMaxPriceUI={setMaxPriceUI}
                  clearAllFilters={() => { clearAllFilters(); }}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setOpenFilters(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sm"
                >
                  Apply
                </button>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

// ---------- Components ----------

function Card({ p, terms, view }: { p: SoftwareProduct; terms: string[]; view: ViewMode }) {
  const price = fromPrice(p);
  const twoFeatures = (p.features ?? []).slice(0, 2);

  const imageBlock = (
    <div className="w-full h-40 md:h-44 rounded-xl overflow-hidden bg-white/5 border border-white/10">
      {/* Use object-contain so logos/box art don’t crop; p-3 adds breathing room */}
      <img
        src={imgFor(p)}
        alt={p.name}
        className="h-full w-full object-contain p-3"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (el.src !== location.origin + FALLBACK_IMG && !el.src.endsWith(FALLBACK_IMG)) {
            el.src = FALLBACK_IMG;
          }
        }}
        loading="lazy"
      />
    </div>
  );

  const content = (
    <div className="rounded-[18px] bg-black/40 border border-white/10 p-5 h-full flex flex-col">
      {/* Image at the top */}
      {imageBlock}

      {/* Title + vendor */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold leading-snug line-clamp-2 break-words">
            {highlight(p.name, terms)}
          </div>
          <div className="text-xs text-white/60 mt-0.5">{p.vendor ?? p.category}</div>
        </div>
        {/* Removed the "Live" / status chip */}
      </div>

      {/* Blurb */}
      <p className="mt-2 text-sm text-white/70 line-clamp-2">{highlight(p.blurb ?? '', terms)}</p>

      {/* A couple quick features */}
      {!!twoFeatures.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {twoFeatures.map(f => (
            <span key={f} className="text-[10px] px-2 py-1 rounded-md border border-white/10 bg-white/5">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Price + CTA */}
      <div className="mt-4 flex items-center justify-between">
        {price != null ? (
          <div className="text-sm">
            <div className="text-[10px] uppercase tracking-wide text-white/50">from</div>
            <div className="font-semibold">${price.toFixed(2)}</div>
          </div>
        ) : (
          <span />
        )}

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
  );

  // Frame with ring/glow stays the same
  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25 }}
        className={`rounded-2xl p-[1.5px] bg-gradient-to-r ${p.vibe.ring} ${p.vibe.glow}`}
      >
        <div className="rounded-[18px] bg-black/40 border border-white/10">
          <div className="p-[1px]">{content}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl p-[1.5px] bg-gradient-to-r ${p.vibe.ring} ${p.vibe.glow}`}
    >
      {content}
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FacetPanel(props: {
  allCategories: string[];
  allVendors: string[];
  allPlatforms: Platform[];
  allLicenses: string[];
  catsCounts: FacetCounts;
  vendorsCounts: FacetCounts;
  platsCounts: FacetCounts;
  licCounts: FacetCounts;
  selCats: Set<string>;
  selVendors: Set<string>;
  selPlatforms: Set<Platform>;
  selLicenses: Set<string>;
  setSelCats: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelVendors: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelPlatforms: React.Dispatch<React.SetStateAction<Set<Platform>>>;
  setSelLicenses: React.Dispatch<React.SetStateAction<Set<string>>>;
  minPriceUI: number | '';
  maxPriceUI: number | '';
  setMinPriceUI: (n: number | '') => void;
  setMaxPriceUI: (n: number | '') => void;
  clearAllFilters: () => void;
}) {
  const {
    allCategories, allVendors, allPlatforms, allLicenses,
    catsCounts, vendorsCounts, platsCounts, licCounts,
    selCats, selVendors, selPlatforms, selLicenses,
    setSelCats, setSelVendors, setSelPlatforms, setSelLicenses,
    minPriceUI, maxPriceUI, setMinPriceUI, setMaxPriceUI, clearAllFilters,
  } = props;

  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div className="space-y-4 sticky top-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <div className="font-semibold">Filters</div>
        </div>
        <button onClick={clearAllFilters} className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
          Reset
        </button>
      </div>

      <Section title="Category">
        <div className="flex flex-col gap-2">
          {allCategories.map(cat => {
            const count = catsCounts.byCat.get(cat) ?? 0;
            const checked = selCats.has(cat);
            const disabled = count === 0 && !checked;
            return (
              <label key={cat} className={`flex items-center justify-between gap-3 text-sm ${disabled ? 'opacity-50' : ''}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleSet(setSelCats, cat)}
                  />
                  {cat}
                </span>
                <span className="text-xs text-white/50">{count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Vendor">
        <div className="flex flex-col gap-2">
          {allVendors.map(v => {
            const count = vendorsCounts.byVendor.get(v) ?? 0;
            const checked = selVendors.has(v) || selVendors.has(v.toLowerCase());
            const disabled = count === 0 && !checked;
            return (
              <label key={v} className={`flex items-center justify-between gap-3 text-sm ${disabled ? 'opacity-50' : ''}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleSet(setSelVendors, v)}
                  />
                  {v}
                </span>
                <span className="text-xs text-white/50">{count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Platform">
        <div className="flex flex-col gap-2">
          {allPlatforms.map(p => {
            const count = platsCounts.byPlat.get(p) ?? 0;
            const checked = selPlatforms.has(p);
            const disabled = count === 0 && !checked;
            return (
              <label key={p} className={`flex items-center justify-between gap-3 text-sm ${disabled ? 'opacity-50' : ''}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleSet(setSelPlatforms, p)}
                  />
                  {p}
                </span>
                <span className="text-xs text-white/50">{count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="License">
        <div className="flex flex-col gap-2">
          {allLicenses.map(l => {
            const count = licCounts.byLic.get(l) ?? 0;
            const checked = selLicenses.has(l);
            const disabled = count === 0 && !checked;
            return (
              <label key={l} className={`flex items-center justify-between gap-3 text-sm ${disabled ? 'opacity-50' : ''}`}>
                <span className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleSet(setSelLicenses, l)}
                  />
                  {l}
                </span>
                <span className="text-xs text-white/50">{count}</span>
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
            value={minPriceUI}
            onChange={e => setMinPriceUI(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm"
            value={maxPriceUI}
            onChange={e => setMaxPriceUI(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[10, 20, 25, 50, 100].map(n => (
            <button
              key={n}
              onClick={() => setMaxPriceUI(n)}
              className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
            >
              Under ${n}
            </button>
          ))}
          <button
            onClick={() => { setMinPriceUI(''); setMaxPriceUI(''); }}
            className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            Any
          </button>
        </div>
      </Section>
    </div>
  );
}

function ActivePills(props: {
  q: string;
  setQ: (s: string) => void;
  selCats: Set<string>;
  selVendors: Set<string>;
  selPlatforms: Set<Platform>;
  selLicenses: Set<string>;
  minPriceUI: number | '';
  maxPriceUI: number | '';
  clearAllFilters: () => void;
  remove: (type: 'cat' | 'vendor' | 'platform' | 'license' | 'min' | 'max', value: any) => void;
}) {
  const { q, setQ, selCats, selVendors, selPlatforms, selLicenses, minPriceUI, maxPriceUI, clearAllFilters, remove } = props;

  const pills: { key: string; label: string; onRemove: () => void }[] = [];
  if (q.trim()) pills.push({ key: `q`, label: `“${q.trim()}”`, onRemove: () => setQ('') });
  Array.from(selCats).forEach(c => pills.push({ key: `cat:${c}`, label: `Category: ${c}`, onRemove: () => remove('cat', c) }));
  Array.from(selVendors).forEach(v => pills.push({ key: `vendor:${v}`, label: `Vendor: ${v}`, onRemove: () => remove('vendor', v) }));
  Array.from(selPlatforms).forEach(p => pills.push({ key: `platform:${p}`, label: `Platform: ${p}`, onRemove: () => remove('platform', p) }));
  Array.from(selLicenses).forEach(l => pills.push({ key: `license:${l}`, label: `License: ${l}`, onRemove: () => remove('license', l) }));
  if (minPriceUI !== '') pills.push({ key: `min:${minPriceUI}`, label: `Min $${minPriceUI}`, onRemove: () => remove('min', null) });
  if (maxPriceUI !== '') pills.push({ key: `max:${maxPriceUI}`, label: `Max $${maxPriceUI}`, onRemove: () => remove('max', null) });

  if (pills.length === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
      <div className="flex flex-wrap gap-2">
        {pills.map(p => (
          <span key={p.key} className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5">
            {p.label}
            <button onClick={p.onRemove} className="rounded-md p-0.5 hover:bg-white/10">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <button onClick={clearAllFilters} className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">
        Clear all
      </button>
    </div>
  );
}
