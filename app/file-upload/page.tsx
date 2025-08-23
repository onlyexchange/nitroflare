'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  ArrowLeftRight,
} from 'lucide-react';

/** File-Upload.org — White Glass + Orange buttons + Blue highlights */

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
  | 'ETH'
  | 'BASE'
  | 'ARBITRUM'
  | 'OPTIMISM'
  | 'POLYGON'
  | 'ZKSYNC'
  | 'LINEA'
  | 'SCROLL'
  | 'SOL'
  | 'BNB';

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

/** PLANS */
const PLANS = [
  { id: 'fu-7',   label: '7 Days',   days: 7,   priceUSD: 4.95,  wasUSD: 5.95 },
  { id: 'fu-30',  label: '30 Days',  days: 30,  priceUSD: 16.95, wasUSD: 19.95 },
  { id: 'fu-90',  label: '90 Days',  days: 90,  priceUSD: 24.95,  wasUSD: 29.95 },
  { id: 'fu-180', label: '180 Days', days: 180, priceUSD: 49.95,  wasUSD: 56.95 },
  { id: 'fu-365', label: '365 Days', days: 365, priceUSD: 89.95,  wasUSD: 99.95 },
  { id: 'fu-730', label: '730 Days', days: 730, priceUSD: 129.95,  wasUSD: 499.95 },
] as const;
type Plan = typeof PLANS[number];

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
  BTC:  undefined,
  SOL:  undefined,
  BNB:  undefined,
  LTC:  undefined,
};

export default function Page(){
  // Theme helpers
  const ORANGE = '#FE5722';
  const BLUE = '#2C82C9';

  const [selected, setSelected]       = useState<Plan>(PLANS[1]); // default 30 Days
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
    "Scanning blockchain network…",
    "Watching mempool for your tx…",
    "Matching recipient address…",
    "Waiting for broadcast…",
    "Verifying inputs…",
    "0/2 confirmations…",
    "Checking network fee…",
    "Still scanning…"
  ];

  // Hero cosmetic timer
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
  function stopPayCountdown(){
    if (payTicker.current) clearInterval(payTicker.current);
    payTicker.current = null;
  }
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
  function stopScanLoop(){
    if (scanTicker.current) clearInterval(scanTicker.current);
    scanTicker.current = null;
  }
  useEffect(()=>()=>{ stopPayCountdown(); stopScanLoop(); },[]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams?.get('plan');
    if (!q) return;
    const byId = PLANS.find(p => (p as any).id?.toLowerCase() === q.toLowerCase());
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
  function fmtSecs(s: number){
    const m = Math.floor(s/60);
    const ss = s % 60;
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }
  function paymentURI(){
    if (!address) return '';
    if (method === 'BTC') return `bitcoin:${address}${lockedAmount ? `?amount=${lockedAmount}` : ''}`;
    if (method === 'LTC') return `litecoin:${address}`;
    return address; // raw address for ETH/SOL/BNB/USDT/USDC
  }
  function qrURL(){
    const uri = paymentURI();
    if (!uri) return '';
    return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(uri)}`;
  }
  function copy(v: string){ if (v) navigator.clipboard?.writeText(v).catch(()=>{}); }
  function scrollToId(id: string){ document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  // endpoint + demo
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
    <div className="min-h-screen text-slate-900 bg-gradient-to-b from-white to-slate-100">
      <BG />

      {/* Header (white glass) */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Only.Exchange — Home"
            prefetch={false}
          >
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl
                             bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500
                             text-white ring-1 ring-white/40 shadow-sm
                             transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-slate-950">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700">
            <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="hover:text-slate-900">Plans</a>
            <a href="#features" onClick={e=>{e.preventDefault(); scrollToId('features')}} className="hover:text-slate-900">Features</a>
            <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="hover:text-slate-900">Checkout</a>
            <a href="#faq" onClick={e=>{e.preventDefault(); scrollToId('faq')}} className="hover:text-slate-900">FAQ</a>
          </nav>
          <a
            href="#checkout"
            onClick={e=>{e.preventDefault(); scrollToId('checkout')}}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: ORANGE }}
          >
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-22">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 ring-1 ring-slate-200 px-3 py-1 text-xs text-slate-700 mb-6">
              <Zap className="h-3.5 w-3.5 text-sky-500"/><span>Instant email delivery • Price lock • Unique address</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="text-slate-900">File-Upload.org </span>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${BLUE}, ${BLUE})`}}>
                Premium Keys
              </span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl">
              No waiting, unlimited speed, no ads. Pay with crypto and receive your Premium key
              <em> instantly</em> after confirmations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#plans"
                onClick={e=>{e.preventDefault(); scrollToId('plans')}}
                className="px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-white"
                style={{ backgroundColor: ORANGE }}
              >
                View Plans <ArrowRight className="h-4 w-4"/>
              </a>
              <a
                href="#checkout"
                onClick={e=>{e.preventDefault(); scrollToId('checkout')}}
                className="px-5 py-3 rounded-2xl border border-slate-200 inline-flex items-center gap-2 bg-white/60 hover:bg-white/80"
              >
                <Bitcoin className="h-5 w-5 text-slate-800"/> Pay with Crypto
              </a>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Plans (white glass cards) */}
      <section id="plans" className="py-14 border-t border-slate-200/60 bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose your plan</h2>
          <p className="text-slate-600 mt-2">Instant delivery after confirmations.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> handleSelectPlan(p)}
                whileHover={{scale:1.02}}
                className={`text-left rounded-2xl border p-5 backdrop-blur
                  ${selected.id===p.id
                    ? 'border-sky-300 ring-2 ring-sky-200'
                    : 'border-slate-200'}
                  bg-white/60`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-slate-900">{p.label}</div>
                  {selected.id===p.id && <CheckCircle2 className="h-5 w-5" style={{ color: BLUE }}/>}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-slate-900">${p.priceUSD.toFixed(2)}</div>
                  {p.wasUSD && <div className="text-slate-400 line-through">${p.wasUSD.toFixed(2)}</div>}
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  Best for: {p.days} day{p.days>1?'s':''} of premium access
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 text-sm text-slate-700">
            Selected: <span className="font-medium" style={{ color: BLUE }}>{selected.label}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
            💎 Premium Features
          </h3>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature title="Unlimited speed" text="No throttling—use your full connection." />
            <Feature title="No waiting & no ads" text="Skip queues and pop-ups entirely." />
            <Feature title="Parallel downloads" text="Grab multiple files at the same time." />
            <Feature title="Direct links" text="Instant start with direct download links." />
            <Feature title="HD streaming" text="Online video playback without plugins." />
            <Feature title="Manager support" text="Compatible with popular download managers." />
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-22 border-t border-slate-200/60 bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Checkout</h3>
                <p className="mt-2 text-slate-600">Buy File-Upload.org Premium Key direct to Email.</p>
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
                    className={`px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2 backdrop-blur
                      ${active
                        ? 'border-sky-300 bg-white/70'
                        : 'border-slate-200 bg-white/60 hover:bg-white/80'}`}
                  >
                    <Icon className="h-4 w-4 text-slate-800"/>{m.label}
                    {active && <span className="ml-1 text-xs text-slate-500">(selected)</span>}
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
                      className={`px-3 py-1.5 rounded-xl border text-sm backdrop-blur
                        ${active ? 'border-sky-300 bg-white/70'
                                 : 'border-slate-200 bg-white/60 hover:bg-white/80'}`}
                    >
                      {chainLabel(c)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Two-column switcher */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              {/* LEFT COL */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-600">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-lg backdrop-blur">
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }} className="text-xs px-3 py-2 rounded-xl bg-white/60 border border-slate-200 hover:bg-white/80 backdrop-blur">
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
                        className={`flex-1 px-4 py-3 rounded-xl bg-white/60 border outline-none text-lg backdrop-blur ${
                          email.length === 0
                            ? "border-slate-200"
                            : isEmailValid ? "border-emerald-400/70" : "border-rose-400/70"
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
                      style={{ backgroundColor: ORANGE }}
                    >
                      {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                      {generating ? 'Generating…' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ) : (
                // DURING PAYMENT
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold flex items-center gap-2 text-slate-900">
                    <QrCode className="h-5 w-5 text-slate-800"/> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input
                          readOnly
                          value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 font-mono text-lg backdrop-blur"
                        />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border border-slate-200 bg-white/60 hover:bg-white/80 backdrop-blur" title="Copy amount">
                          <Copy className="h-4 w-4 text-slate-800"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 font-mono text-sm backdrop-blur"/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-slate-200 bg-white/60 hover:bg-white/80 backdrop-blur" title="Copy address">
                          <Copy className="h-4 w-4 text-slate-800"/>
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-slate-600 mt-1">
                          Network: <span className="font-medium" style={{ color: BLUE }}>{chainLabel(chain)}</span>
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
                        className="mt-2 rounded-xl border border-slate-200 shadow-[0_0_35px_rgba(255,255,255,0.35)] bg-white/70 backdrop-blur"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-slate-200 grid place-items-center text-slate-400 bg-white/60 backdrop-blur">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-slate-700 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-700"/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT COL */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold text-slate-900">How it works</h4>
                  <ol className="space-y-3 text-slate-700 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center backdrop-blur">
                        <Bitcoin className="h-4 w-4 text-slate-800" />
                      </div>
                      <span>Select a File-Upload Premium plan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center backdrop-blur">
                        <Mail className="h-4 w-4 text-slate-800" />
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center backdrop-blur">
                        <ShieldCheck className="h-4 w-4 text-slate-800" />
                      </div>
                      <span>Choose coin (and network for ETH / USDT / USDC)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center backdrop-blur">
                        <QrCode className="h-4 w-4 text-slate-800" />
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center backdrop-blur">
                        <TimerIcon className="h-4 w-4 text-slate-800" />
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center backdrop-blur">
                        <Rocket className="h-4 w-4 text-slate-800" />
                      </div>
                      <span>Key emailed after <span className="font-semibold" style={{ color: BLUE }}>2 confirmations</span></span>
                    </li>
                  </ol>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-xs text-slate-600 backdrop-blur">
                    Payment details and QR will appear after you generate an address.
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-2xl font-semibold text-slate-900">Order Summary</h5>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <Summary label="Pack" value={selected.label}/>
                    <Summary label="USD Total" value={`$${selected.priceUSD.toFixed(2)}`} mono/>
                    <Summary label="Asset" value={method}/>
                    {METHOD_NEEDS_CHAIN[method] && chain && (
                      <Summary label="Network" value={chainLabel(chain)}/>
                    )}
                    <Summary label="Amount" value={lockedAmount} mono/>
                    <Summary label="Email" value={email}/>
                  </div>

                  <div className="mt-6 space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-slate-200 px-3 py-1 text-sm text-slate-800 backdrop-blur">
                      <TimerIcon className="h-4 w-4" />
                      <span>Time left</span>
                      <span className="font-mono text-slate-900">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
                        <ShieldCheck className="h-4 w-4" />
                        Buyer pays network fees
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
                        <ShieldCheck className="h-4 w-4" />
                        2 confirmations required
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
                        <Mail className="h-4 w-4" />
                        Instant Delivery
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button onClick={resetPayment} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/80 backdrop-blur">
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
      <section id="faq" className="py-16 border-t border-slate-200/60 bg-gradient-to-b from-white/50 to-white/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full"
                    style={{ backgroundImage: `linear-gradient(90deg, ${BLUE}, ${BLUE})` }} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: ORANGE }}
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-900 border border-slate-200 bg-white/60 hover:bg-white/80 backdrop-blur"
              >
                <Zap className="h-4 w-4" />
                Browse Plans
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4 text-slate-800" />How do I buy a key?</span>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a pack & enter your email.</li>
                      <li>Select coin (and network if using USDT/USDC or ETH L2).</li>
                      <li>Click <em>Generate</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                  </>
                }
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><Coins className="h-4 w-4 text-slate-800" />Which coins & networks?</span>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1">ETH supports L2 (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><TimerIcon className="h-4 w-4 text-slate-800" />When do I get my key?</span>}
                a="Instantly after required confirmations (usually minutes). The key is sent to the email you entered at checkout."
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-slate-800" />Wrong amount or network?</span>}
                a={
                  <>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                      <li><strong>Overpaid:</strong> <a href="/support" className="underline">Contact support</a> with your TX hash—we’ll reconcile.</li>
                      <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Not sure? <a href="/support" className="underline">Reach out</a>.</li>
                    </ul>
                  </>
                }
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 text-slate-800" />Change pack or email?</span>}
                a="During payment, email is temporarily locked. Hit Cancel / Start Over to edit details and generate again."
              />
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white/60 p-5 backdrop-blur">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Zap className="h-4 w-4 text-slate-800" />
                Quick help
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✔️ No waiting • No ads</li>
                <li>✔️ Unlimited speed & parallel downloads</li>
                <li>✔️ Instant email delivery</li>
              </ul>
              <div className="mt-5 rounded-xl border border-slate-200 bg-white/60 p-4">
                <div className="text-sm font-semibold text-slate-900">Still stuck?</div>
                <p className="text-slate-700 text-sm mt-1">
                  Our team can verify your transaction and resend keys if needed.
                </p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white"
                  style={{ backgroundColor: ORANGE }}
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
      <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
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

/* Presentational helpers (light theme) */
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 ${mono ? 'font-mono' : ''} text-lg backdrop-blur`}>
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
function Feature({ title, text }: { title: string; text: string }){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 backdrop-blur">
      <div className="inline-flex items-center gap-2 text-slate-900">
        <ShieldCheck className="h-5 w-5 text-slate-800"/><span className="font-semibold">{title}</span>
      </div>
      <p className="text-slate-700 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white/60 backdrop-blur hover:bg-white/70 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2 text-slate-900">{q}</div>
        <ArrowRight className="h-4 w-4 text-slate-700 opacity-70 transition-transform group-open:rotate-90" />
      </summary>
      <div className="h-px w-full bg-gradient-to-r from-sky-300/60 to-sky-300/60" />
      <div className="px-4 pb-4 pt-3 text-slate-700 text-sm">{a}</div>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft white glow */}
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-white/70 blur-3xl"/>
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-white/50 blur-3xl"/>
    </div>
  );
}
