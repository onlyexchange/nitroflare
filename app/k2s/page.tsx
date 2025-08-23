'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Bitcoin,
  Zap,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  Copy,
  QrCode,
  ArrowRight,
  Timer as TimerIcon,
  Loader2,
  Mail,
  Coins,
  AlertTriangle,
  RefreshCw,
  Gauge,
  PlayCircle,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';

/* =========================================================
   Accent & theme (white glass + K2S blue)
   ========================================================= */
const ACCENT = {
  solid: '#0092D6',              // primary brand blue
  solidHover: '#00A6F0',
  from: '#00A6F0',
  to:   '#0092D6',
};

/* =========================================================
   Pricing / assets
   ========================================================= */
const COINGECKO_IDS = {
  BTC:  'bitcoin',
  ETH:  'ethereum',
  SOL:  'solana',
  BNB:  'binancecoin',
  LTC:  'litecoin',
  USDT: 'tether',
  USDC: 'usd-coin',
} as const;
type Method = keyof typeof COINGECKO_IDS;

type Chain =
  | 'ETH' | 'BASE' | 'ARBITRUM' | 'OPTIMISM' | 'POLYGON' | 'ZKSYNC' | 'LINEA' | 'SCROLL'
  | 'SOL' | 'BNB';

const chainLabel = (c: Chain) =>
  c === 'ETH' ? 'Ethereum'
: c === 'BASE' ? 'Base'
: c === 'ARBITRUM' ? 'Arbitrum'
: c === 'OPTIMISM' ? 'Optimism'
: c === 'POLYGON' ? 'Polygon'
: c === 'ZKSYNC' ? 'zkSync'
: c === 'LINEA' ? 'Linea'
: c === 'SCROLL' ? 'Scroll'
: c === 'SOL' ? 'Solana'
: 'BNB Smart Chain';

const ALL_IDS = Object.values(COINGECKO_IDS);
const PRICE_URL = `/api/price?ids=${ALL_IDS.join(',')}`;

/** K2S Plans (Premium / Pro / Max) */
type Plan = {
  id: string;
  tier: 'Premium' | 'Pro' | 'Max';
  label: string;
  days: number;
  priceUSD: number;
  wasUSD?: number;
  bandwidth: string;
  best?: boolean;
};

const PLANS: readonly Plan[] = [
  // Premium — 10 GB/day
  { id: 'k2s-prem-30',  tier: 'Premium', label: '30 Days',  days: 30,  priceUSD: 16.95, wasUSD: 23.94, bandwidth: '10 GB / Day' },
  { id: 'k2s-prem-90',  tier: 'Premium', label: '90 Days',  days: 90,  priceUSD: 28.95, wasUSD: 59.94, bandwidth: '10 GB / Day' },
  { id: 'k2s-prem-365', tier: 'Premium', label: '365 Days', days: 365, priceUSD: 119.95, wasUSD: 199.95, bandwidth: '10 GB / Day' },

  // PRO — 50 GB/day
  { id: 'k2s-pro-30',  tier: 'Pro', label: '30 Days PRO',  days: 30,  priceUSD: 18.95, wasUSD: 29.94, bandwidth: '50 GB / Day', best: true },
  { id: 'k2s-pro-90',  tier: 'Pro', label: '90 Days PRO',  days: 90,  priceUSD: 24.95, wasUSD: 71.94, bandwidth: '50 GB / Day' },
  { id: 'k2s-pro-365', tier: 'Pro', label: '365 Days PRO', days: 365, priceUSD: 129.95, wasUSD: 249.95, bandwidth: '50 GB / Day' },

  // MAX — 100 GB/day
  { id: 'k2s-max-30',  tier: 'Max', label: '30 Days MAX',  days: 30,  priceUSD: 19.99, wasUSD: 39.99, bandwidth: '100 GB / Day' },
  { id: 'k2s-max-90',  tier: 'Max', label: '90 Days MAX',  days: 90,  priceUSD: 39.99, wasUSD: 89.99, bandwidth: '100 GB / Day' },
  { id: 'k2s-max-365', tier: 'Max', label: '365 Days MAX', days: 365, priceUSD: 149.99, wasUSD: 299.99, bandwidth: '100 GB / Day' },
];

const METHODS = [
  { id: 'BTC',  label: 'Bitcoin',  icon: Bitcoin },
  { id: 'ETH',  label: 'Ethereum', icon: Zap },
  { id: 'SOL',  label: 'Solana',   icon: Zap },
  { id: 'BNB',  label: 'BNB',      icon: Zap },
  { id: 'LTC',  label: 'Litecoin', icon: Zap },
  { id: 'USDT', label: 'USDT',     icon: Zap },
  { id: 'USDC', label: 'USDC',     icon: Zap },
] as const;

const METHOD_NEEDS_CHAIN: Record<Method, boolean> = {
  BTC: false,
  ETH: true,
  SOL: false,
  BNB: false,
  LTC: false,
  USDT: true,
  USDC: true,
};
const CHAIN_OPTIONS: Record<Method, Chain[] | undefined> = {
  ETH:  ['ETH', 'BASE', 'ARBITRUM', 'OPTIMISM', 'POLYGON', 'ZKSYNC', 'LINEA', 'SCROLL'],
  USDT: ['ETH', 'SOL', 'BNB'],
  USDC: ['ETH', 'SOL', 'BNB'],
  BTC:  undefined, SOL: undefined, BNB: undefined, LTC: undefined,
};

/* =========================================================
   Page
   ========================================================= */
export default function Page() {
  const [selected, setSelected]       = useState<Plan>(PLANS[3]); // default to PRO 30 (best)
  const [email, setEmail]             = useState('');
  const [emailLocked, setEmailLocked] = useState(false);

  const [method, setMethod] = useState<Method>('BTC');
  const [chain, setChain]   = useState<Chain | null>(null);

  const [pricesUSD, setPricesUSD] = useState<Record<Method, number | null>>({
    BTC: null, ETH: null, SOL: null, BNB: null, LTC: null, USDT: null, USDC: null
  });

  // Session
  const [address, setAddress]           = useState('');
  const [lockedAmount, setLockedAmount] = useState('');
  const [status, setStatus]             = useState('');
  const [step, setStep]                 = useState<'select'|'pay'|'done'>('select');

  const WINDOW_SECS = 30 * 60;
  const [paySecs, setPaySecs] = useState(WINDOW_SECS);
  const payTicker  = useRef<ReturnType<typeof setInterval> | null>(null);
  const [generating, setGenerating] = useState(false);

  const [scanIdx, setScanIdx] = useState(0);
  const scanTicker = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanMessages = [
    'Scanning blockchain network…',
    'Watching mempool for your tx…',
    'Matching recipient address…',
    'Waiting for broadcast…',
    'Verifying inputs…',
    '0/2 confirmations…',
    'Checking network fee…',
    'Still scanning…',
  ];

  // Cosmetic hero timer
  const [heroTimer, setHeroTimer] = useState(29 * 60 + 59);
  useEffect(()=>{
    const t = setInterval(()=> setHeroTimer(v => (v>0? v-1 : 0)), 1000);
    return ()=> clearInterval(t);
  },[]);
  const heroTimeLeft = `${String(Math.floor(heroTimer/60)).padStart(2,'0')}:${String(heroTimer%60).padStart(2,'0')}`;

  // Prices
  useEffect(()=>{
    let active = true;
    async function fetchPrices(){
      try{
        const res = await fetch(PRICE_URL, { cache: 'no-store' });
        const data = await res.json();
        const map: Record<Method, number | null> = {
          BTC:  data?.bitcoin?.usd ?? null,
          ETH:  data?.ethereum?.usd ?? null,
          SOL:  data?.solana?.usd ?? null,
          BNB:  data?.binancecoin?.usd ?? null,
          LTC:  data?.litecoin?.usd ?? null,
          USDT: data?.tether?.usd ?? null,
          USDC: data?.['usd-coin']?.usd ?? null,
        };
        if (active) setPricesUSD(map);
      }catch(e){ console.error(e); }
    }
    fetchPrices();
    const i = setInterval(fetchPrices, 60000);
    return ()=>{ active=false; clearInterval(i); };
  },[]);

  // amount preview
  const previewAmount = useMemo(()=>{
    const usd = pricesUSD[method];
    if (method === 'USDT' || method === 'USDC') return selected.priceUSD.toFixed(2);
    if (!usd) return '';
    const amt = selected.priceUSD / usd;
    const truncated = Math.trunc(amt * 1e8) / 1e8;
    return truncated.toFixed(8);
  }, [pricesUSD, method, selected]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const methodNeedsLivePrice = (m: Method) => !(m === 'USDT' || m === 'USDC');

  // timers
  function startPayCountdown() {
    stopPayCountdown();
    setPaySecs(WINDOW_SECS);
    payTicker.current = setInterval(() => {
      setPaySecs(prev => {
        if (prev <= 1) {
          stopPayCountdown();
          stopScanLoop();
          setStatus('Payment window expired. Generate a new address to continue.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  function stopPayCountdown(){ if (payTicker.current) clearInterval(payTicker.current); payTicker.current = null; }
  function startScanLoop(){
    stopScanLoop();
    setScanIdx(0);
    setStatus(scanMessages[0]);
    scanTicker.current = setInterval(()=>{
      setScanIdx(prev=>{
        const next = (prev + 1) % scanMessages.length;
        setStatus(scanMessages[next]);
        return next;
      });
    }, 1600);
  }
  function stopScanLoop(){ if (scanTicker.current) clearInterval(scanTicker.current); scanTicker.current = null; }
  useEffect(()=>()=>{ stopPayCountdown(); stopScanLoop(); },[]);

  // deep-link plan select
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams?.get('plan');
    if (!q) return;
    const byId    = PLANS.find(p => p.id.toLowerCase() === q.toLowerCase());
    const byLabel = PLANS.find(p => p.label.toLowerCase() === decodeURIComponent(q).toLowerCase());
    const target = byId || byLabel;
    if (!target) return;
    resetPayment();
    setSelected(target);
    setTimeout(() => {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // reset helpers
  function resetPayment(){
    stopPayCountdown();
    stopScanLoop();
    setAddress('');
    setLockedAmount('');
    setStatus('');
    setStep('select');
    setPaySecs(WINDOW_SECS);
    setEmailLocked(false);
  }
  function handleSelectPlan(p: Plan){
    setSelected(p);
    resetPayment();
    scrollToId('checkout');
  }

  // actions
  async function startPayment(){
    if (!isEmailValid) { setStatus('Enter a valid email to continue.'); return; }
    if (METHOD_NEEDS_CHAIN[method] && !chain) { setStatus('Select a network to continue.'); return; }
    if (methodNeedsLivePrice(method) && !pricesUSD[method]) { setStatus('Could not fetch live price. Please try again.'); return; }

    setGenerating(true);
    setStatus('Generating your unique address…');
    try{
      const endpoint = computeEndpoint(method, chain);
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      const addr = data?.address || '';

      setAddress(addr || demoAddress(method));
      setLockedAmount(previewAmount || '');
      setStep('pay');
      setEmailLocked(true);
      startPayCountdown();
      startScanLoop();
    }catch(e){
      console.error(e);
      setAddress(demoAddress(method));
      setLockedAmount(previewAmount || '');
      setStep('pay');
      setEmailLocked(true);
      startPayCountdown();
      startScanLoop();
    } finally{
      setGenerating(false);
    }
  }

  // UI helpers
  function fmtSecs(s: number){ const m = Math.floor(s/60); const ss = s % 60; return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
  function paymentURI(){
    if (!address) return '';
    if (method === 'BTC') return `bitcoin:${address}${lockedAmount ? `?amount=${lockedAmount}` : ''}`;
    if (method === 'LTC') return `litecoin:${address}`;
    return address;
  }
  function qrURL(){ const uri = paymentURI(); if (!uri) return ''; return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(uri)}`; }
  function copy(v: string){ if (v) navigator.clipboard?.writeText(v).catch(()=>{}); }
  function scrollToId(id: string){ document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  // endpoints + demo
  function computeEndpoint(m: Method, c: Chain | null){
    if (m === 'BTC') return '/api/next-btc-address';
    if (m === 'ETH') return '/api/next-eth-address';
    if (m === 'SOL') return '/api/next-sol-address';
    if (m === 'BNB') return '/api/next-bnb-address';
    if (m === 'LTC') return '/api/next-ltc-address';
    if (m === 'USDT') {
      if (c === 'ETH') return '/api/next-usdt-eth-address';
      if (c === 'SOL') return '/api/next-usdt-sol-address';
      return '/api/next-usdt-bnb-address';
    }
    if (m === 'USDC') {
      if (c === 'ETH') return '/api/next-usdc-eth-address';
      if (c === 'SOL') return '/api/next-usdc-sol-address';
      return '/api/next-usdc-bnb-address';
    }
    return '/api/next-btc-address';
  }
  function demoAddress(m: Method){
    switch (m){
      case 'BTC': return 'bc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      case 'ETH': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
      case 'SOL': return 'So11111111111111111111111111111111111111112';
      case 'BNB': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
      case 'LTC': return 'ltc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxx';
      case 'USDT':
      case 'USDC': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <BGWhite />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl text-white ring-1 ring-black/5 shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: ACCENT.solid }}>
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-slate-950">Only.Exchange</span>
          </Link>
          <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout');}}
             className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
             style={{ background: ACCENT.solid }}>
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{opacity:0, y:18}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 ring-1 ring-slate-900/10 px-3 py-1 text-xs text-slate-600 mb-6">
              <Zap className="h-3.5 w-3.5 text-[color:var(--accent)]" style={{ ['--accent' as any]: ACCENT.solid }} />
              Best pricing • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              K2S.cc{' '}
              <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }}>
                Premium Keys
              </span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl">
              Pay with crypto and get your K2S premium key <em>instantly</em> after confirmations. No waiting, no ads, full-speed downloads.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans');}}
                 className="px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-white"
                 style={{ background: ACCENT.solid }}>
                <Layers className="h-5 w-5"/> View Plans
              </a>
              <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout');}}
                 className="px-5 py-3 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/80 inline-flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-[color:var(--accent)]" style={{ ['--accent' as any]: ACCENT.solid }}/>
                Pay with Crypto
              </a>
            </div>

            
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-slate-200 bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose your plan</h2>
          <p className="text-slate-600 mt-2">Premium • Pro • Max — different daily bandwidth for every budget.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => {
              const active = selected.id === p.id;
              return (
                <motion.button
                  key={p.id}
                  onClick={()=> handleSelectPlan(p)}
                  whileHover={{scale:1.02}}
                  className={`text-left rounded-2xl border p-5 bg-white/70 backdrop-blur
                    ${active ? 'border-[color:var(--accent)] ring-1 ring-[color:var(--accent)]' : 'border-slate-200'}
                  `}
                  style={{ ['--accent' as any]: ACCENT.solid }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold">{p.label}</div>
                    {p.best && (
                      <span className="text-[10px] uppercase px-2 py-1 rounded-md text-white" style={{ background: ACCENT.solid }}>
                        Best Seller
                      </span>
                    )}
                    {active && <CheckCircle2 className="h-5 w-5" style={{ color: ACCENT.solid }}/>}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                    {p.wasUSD && <div className="text-slate-400 line-through">${p.wasUSD.toFixed(2)}</div>}
                  </div>
                  <div className="mt-3 text-sm text-slate-600">{p.bandwidth}</div>
                  <div className="mt-1 text-xs text-slate-500">{p.tier}</div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 text-sm text-slate-600">
            Selected: <span className="text-slate-900 font-medium">{selected.label} — {selected.tier} • {selected.bandwidth}</span>
          </div>
        </div>
      </section>

      {/* Features — K2S highlights */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">💎 Premium Plan Highlights</h2>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Gauge className="h-5 w-5"/>} title="Daily bandwidth" text="10 GB • 50 GB • 100 GB per day by tier."/>
            <Feature icon={<Zap className="h-5 w-5"/>} title="Max speed" text="Unlimited speeds. No throttling."/>
            <Feature icon={<PlayCircle className="h-5 w-5"/>} title="Streaming" text="Watch videos online (Pro/Max)."/>
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="No interruptions" text="No ads, no timers, no captchas."/>
            <Feature icon={<Layers className="h-5 w-5"/>} title="Accelerators" text="Parallel downloads + download managers."/>
            <Feature icon={<Mail className="h-5 w-5"/>} title="Instant delivery" text="Key emailed after 2 confirmations."/>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-24 border-t border-slate-200 bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Checkout</h3>
                <p className="mt-2 text-slate-600">Buy K2S.cc Premium Key direct to Email.</p>
              </div>
            </div>

            {/* Method selector */}
            <div className="mt-8 flex flex-wrap gap-2">
              {METHODS.map(m=>{
                const Icon = m.icon;
                const active = method === (m.id as Method);
                return (
                  <button
                    key={m.id}
                    onClick={()=>{
                      if (method!==m.id){
                        resetPayment();
                        setMethod(m.id as Method);
                        setChain(null);
                      }
                    }}
                    className={`px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2
                      ${active
                        ? 'border-[color:var(--accent)] bg-white/70'
                        : 'border-slate-200 hover:border-slate-300 bg-white/60'}`}
                    style={{ ['--accent' as any]: ACCENT.solid }}
                  >
                    <Icon className="h-4 w-4"/>{m.label}
                    {active && <span className="ml-1 text-xs text-slate-600">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Network picker */}
            {METHOD_NEEDS_CHAIN[method] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">Network:</span>
                {(CHAIN_OPTIONS[method] || []).map(c => {
                  const active = chain === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setChain(c); resetPayment(); }}
                      className={`px-3 py-1.5 rounded-xl border text-sm
                        ${active ? 'border-[color:var(--accent)] bg-white/70'
                                 : 'border-slate-200 hover:border-slate-300 bg-white/60'}`}
                      style={{ ['--accent' as any]: ACCENT.solid }}
                    >
                      {chainLabel(c)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Two-column switcher */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              {/* LEFT COLUMN */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-600">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-slate-200 text-lg">
                        {selected.label} — {selected.tier} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }}
                              className="text-xs px-3 py-2 rounded-xl bg-white/60 border border-slate-200 hover:border-slate-300">
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-600">Your Email (for key delivery)</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        placeholder="you@email.com"
                        disabled={emailLocked}
                        className={`flex-1 px-4 py-3 rounded-xl bg-white/60 backdrop-blur border outline-none text-lg ${
                          email.length === 0
                            ? 'border-slate-200'
                            : isEmailValid ? 'border-emerald-400/70' : 'border-rose-400/70'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Stat label="Total Price (USD)" value={`$${selected.priceUSD.toFixed(2)}`} mono />
                    <Stat label={`Amount (${method})`} value={previewAmount || '—'} mono />
                  </div>

                  <div className="grid sm:grid-cols-1 gap-3">
                    <button
                      onClick={startPayment}
                      disabled={
                        !isEmailValid ||
                        (methodNeedsLivePrice(method) && !pricesUSD[method]) ||
                        (METHOD_NEEDS_CHAIN[method] && !chain) ||
                        generating
                      }
                      className="w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg text-white disabled:opacity-60"
                      style={{ background: (!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating) ? '#99d7f0' : ACCENT.solid }}
                    >
                      {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                      {generating ? 'Generating…' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ) : (
                // ====== DURING PAYMENT ======
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
                    <QrCode className="h-5 w-5"/> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input
                          readOnly
                          value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-slate-200 font-mono text-lg"
                        />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/60" title="Copy amount">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-slate-200 font-mono text-sm"/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/60" title="Copy address">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-slate-600 mt-1">
                          Network: <span className="text-slate-900">{chainLabel(chain)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center">
                    {qrURL() ? (
                      <img
                        src={qrURL()}
                        alt="Payment QR"
                        width={260}
                        height={260}
                        className="mt-2 rounded-xl border border-slate-200 shadow-[0_0_35px_rgba(0,146,214,0.15)] bg-white/70"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-slate-200 grid place-items-center text-slate/40 bg-white/50">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-slate-700 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin"/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT COLUMN */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold text-slate-900">How it works</h4>
                  <ol className="space-y-3 text-slate-700 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Bitcoin className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Select a K2S plan (Premium / Pro / Max)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Mail className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <ShieldCheck className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Choose coin (and network for ETH / USDT / USDC)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <QrCode className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <TimerIcon className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Rocket className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Key emailed after <span className="text-slate-900">2 confirmations</span></span>
                    </li>
                  </ol>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-xs text-slate-600">
                    Payment details and QR will appear after you generate an address.
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-2xl font-semibold text-slate-900">Order Summary</h5>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <Summary label="Pack" value={`${selected.label} — ${selected.tier}`}/>
                    <Summary label="USD Total" value={`$${selected.priceUSD.toFixed(2)}`} mono/>
                    <Summary label="Asset" value={method}/>
                    {METHOD_NEEDS_CHAIN[method] && chain && (
                      <Summary label="Network" value={chainLabel(chain)}/>
                    )}
                    <Summary label="Amount" value={lockedAmount} mono/>
                    <Summary label="Email" value={email}/>
                  </div>

                  <div className="mt-6 space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-slate-200 px-3 py-1 text-sm text-slate-800">
                      <TimerIcon className="h-4 w-4" />
                      <span>Time left</span>
                      <span className="font-mono">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700">
                        <ShieldCheck className="h-4 w-4 opacity-80" />
                        Buyer pays network fees
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700">
                        <ShieldCheck className="h-4 w-4 opacity-80" />
                        2 confirmations required
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700">
                        <Mail className="h-4 w-4 opacity-80" />
                        Instant Delivery
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button onClick={resetPayment} className="w-full px-6 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white/60">
                      Cancel / Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 border-t border-slate-200 bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full"
                    style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}, ${ACCENT.to})` }} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                style={{ background: ACCENT.solid }}
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-900 border border-slate-200 bg-white/60 hover:bg-white/80"
              >
                <Zap className="h-4 w-4" />
                View K2S packs
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Main Q&A */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<><QrCode className="h-4 w-4 opacity-90"/><span>How do I buy a K2S key?</span></>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a pack & enter your email.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Generate</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<><ShieldCheck className="h-4 w-4 opacity-90"/><span>Which plan is right for me?</span></>}
                a={
                  <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                      <div className="text-slate-600">Premium</div><div>10 GB/day • everyday use</div>
                      <div className="text-slate-600">Pro</div><div>50 GB/day • heavy use</div>
                      <div className="text-slate-600">Max</div><div>100 GB/day • power users</div>
                    </div>
                  </div>
                }
              />

              <QA
                q={<><Mail className="h-4 w-4 opacity-90"/><span>When do I receive my key?</span></>}
                a={<>Instantly after required confirmations (usually minutes). We email the key to the address you entered at checkout.</>}
              />

              {/* Activation steps moved into FAQ */}
              <QA
                q={<><ShieldCheck className="h-4 w-4 opacity-90"/><span>How do I activate my K2S premium key?</span></>}
                a={
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
                      <div className="text-sm font-semibold text-slate-900">You’ll receive a Premium Key like:</div>
                      <div className="mt-1 inline-block rounded-md border border-slate-200 bg-white/80 px-2 py-1 font-mono text-sm text-slate-900">
                        1220s5e5cbo381XXXXX
                      </div>
                    </div>
                    <ol className="mt-3 list-decimal list-inside space-y-1">
                      <li>Log in to your K2S.cc account. <a href="https://k2s.cc/auth/register" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: ACCENT.solid }}>Register here</a> if needed.</li>
                      <li>Open the <a href="https://k2s.cc/premium" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: ACCENT.solid }}>Premium</a> page.</li>
                      <li>Find “Apply Promo Code”, paste your Premium Key, and click Apply.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<><Coins className="h-4 w-4 opacity-90"/><span>Which coins & networks are supported?</span></>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1">ETH supports L2s (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />

              <QA
                q={<><AlertTriangle className="h-4 w-4 opacity-90"/><span>I sent the wrong amount / network</span></>}
                a={
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                    <li><strong>Overpaid:</strong> <a href="/support" className="underline" style={{ color: ACCENT.solid }}>Contact support</a> with your TX hash—we’ll reconcile.</li>
                    <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Not sure? <a href="/support" className="underline" style={{ color: ACCENT.solid }}>Reach out</a> ASAP.</li>
                  </ul>
                }
              />

              <QA
                q={<><RefreshCw className="h-4 w-4 opacity-90"/><span>Can I change my pack or email?</span></>}
                a={<>During payment, email is temporarily locked. Hit <em>Cancel / Start Over</em>, update details, then click <em>Generate</em> again.</>}
              />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border border-slate-200 bg-white/60 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Zap className="h-4 w-4 opacity-90" />
                Quick help
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✔️ <a href="#plans" className="underline" style={{ color: ACCENT.solid }}>K2S packs & bandwidth</a></li>
                <li>✔️ <a href="/support" className="underline" style={{ color: ACCENT.solid }}>Payment issues (over/underpaid)</a></li>
                <li>✔️ <a href="/support" className="underline" style={{ color: ACCENT.solid }}>Key not received / not working</a></li>
              </ul>
              <div className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">Still stuck?</div>
                <p className="text-slate-700 text-sm mt-1">Our team can verify your transaction and resend keys if needed.</p>
                <a href="/support" className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white"
                   style={{ background: ACCENT.solid }}>
                  <Mail className="h-4 w-4" />
                  Contact support
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg" style={{ background: `linear-gradient(to br, ${ACCENT.from}, ${ACCENT.to})` }} />
              <span className="font-semibold text-slate-900">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/support">Support</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refunds">Refunds</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500 max-w-4xl">
            © 2025 Only.Exchange | All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ===================== Helpers ===================== */
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-slate-200 ${mono ? 'font-mono' : ''} text-lg`}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false, wrap=false }:{label:string; value:string; mono?:boolean; wrap?:boolean}){
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${wrap ? 'break-all' : ''} mt-1 text-slate-900`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur p-5">
      <div className="inline-flex items-center gap-2 text-slate-900">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-slate-700 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: ReactNode; a: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white/60 backdrop-blur hover:border-slate-300 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-slate-900">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
      </summary>
      <div className="h-px w-full"
           style={{ backgroundImage: `linear-gradient(to right, ${ACCENT.from}66, ${ACCENT.to}66)` }} />
      <div className="px-4 pb-4 pt-3 text-slate-700 text-sm">
        {a}
      </div>
    </details>
  );
}
function BGWhite(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full"
           style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,146,214,0.10) 0%, rgba(255,255,255,0) 60%)' }} />
    </div>
  );
}
