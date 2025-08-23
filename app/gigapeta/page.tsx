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
  Gauge,
  PlayCircle,
  ArrowLeftRight,
} from 'lucide-react';

/** GigaPeta — white glass vibe + green accents (#66CC66) */

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

// GigaPeta packs
const PLANS = [
  { id: 'gp-3',   label: '3 Days',     days: 3,   priceUSD: 4.00 },
  { id: 'gp-7',   label: '1 Week',     days: 7,   priceUSD: 5.00 },
  { id: 'gp-14',  label: '2 Weeks',    days: 14,  priceUSD: 8.00 },
  { id: 'gp-30',  label: '1 Month',    days: 30,  priceUSD: 13.00 },
  { id: 'gp-90',  label: '3 Months',   days: 90,  priceUSD: 30.00 },
  { id: 'gp-180', label: '6 Months',   days: 180, priceUSD: 55.00 },
  { id: 'gp-365', label: '1 Year',     days: 365, priceUSD: 90.00 },
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
  BTC: false, ETH: true, SOL: false, BNB: false, LTC: false, USDT: true, USDC: true,
};

const CHAIN_OPTIONS: Record<Method, Chain[] | undefined> = {
  ETH:  ['ETH','BASE','ARBITRUM','OPTIMISM','POLYGON','ZKSYNC','LINEA','SCROLL'],
  USDT: ['ETH','SOL','BNB'],
  USDC: ['ETH','SOL','BNB'],
  BTC:  undefined, SOL: undefined, BNB: undefined, LTC: undefined,
};

export default function Page() {
  // Selection
  const [selected, setSelected]       = useState<Plan>(PLANS[3]); // default 1 Month
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

  // Cosmetic hero countdown
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

  // Amount preview
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

  // Timers
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

  // Reset helpers
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

  // Actions
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

  // Endpoint + demo
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
    <div className="min-h-screen bg-gradient-to-b from-[#f7f8fb] via-[#f3f5f9] to-[#eef2f7] text-slate-900">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/50 border-b border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Only.Exchange — Home"
            prefetch={false}
          >
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white ring-1 ring-black/5 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-black">Only.Exchange</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="hover:text-slate-900">Plans</a>
            <a href="#features" onClick={e=>{e.preventDefault(); scrollToId('features')}} className="hover:text-slate-900">Features</a>
            <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="hover:text-slate-900">Checkout</a>
            <a href="#faq" onClick={e=>{e.preventDefault(); scrollToId('faq')}} className="hover:text-slate-900">FAQ</a>
          </nav>

          <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#66CC66] text-white hover:opacity-95">
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{opacity:0, y:18}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 ring-1 ring-black/5 px-3 py-1 text-xs text-slate-700 mb-6 backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-[#66CC66]" />
              Best pricing • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              GigaPeta <span className="text-[#66CC66]">Premium Keys</span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl">
              Pay with crypto and get your GigaPeta premium key <em>instantly</em> after confirmation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="px-5 py-3 rounded-2xl bg-[#66CC66] text-white inline-flex items-center gap-2 hover:opacity-95">
                <span className="font-semibold">View Plans</span>
                <ArrowRight className="h-4 w-4"/>
              </a>
              <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="px-5 py-3 rounded-2xl border border-black/10 inline-flex items-center gap-2 bg-white/60 backdrop-blur hover:bg-white/80">
                <Bitcoin className="h-5 w-5 text-[#66CC66]"/> <span className="font-semibold">Pay with Crypto</span>
              </a>
            </div>

          
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-slate-600 mt-2">Unlimited speed and threads, direct links, and 90GB per 72h traffic policy.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> handleSelectPlan(p)}
                whileHover={{scale:1.02}}
                className={`text-left rounded-2xl border ${selected.id===p.id? 'border-[#66CC66]/50' : 'border-black/10'} bg-white/60 backdrop-blur p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">{p.label}</div>
                  {selected.id===p.id && <CheckCircle2 className="h-5 w-5 text-[#66CC66]"/>}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  Best for: {p.days} day{p.days>1?'s':''} of premium access
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 text-sm text-slate-700">
            Selected: <span className="font-medium">{selected.label}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">💎 Premium Features</h2>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Gauge className="h-5 w-5 text-[#66CC66]" />} title="Maximum speed" text="Unlimited speed with parallel threads." />
            <Feature icon={<Zap className="h-5 w-5 text-[#66CC66]" />} title="Unlimited threads" text="No limits on simultaneous connections." />
            <Feature icon={<PlayCircle className="h-5 w-5 text-[#66CC66]" />} title="Direct links" text="Start downloads instantly—no queues." />
            <Feature icon={<ShieldCheck className="h-5 w-5 text-[#66CC66]" />} title="Manager support" text="Works with popular download managers." />
            <Feature icon={<Coins className="h-5 w-5 text-[#66CC66]" />} title="Traffic policy" text="90 GB each 72 hours rolling window." />
            <Feature icon={<Mail className="h-5 w-5 text-[#66CC66]" />} title="Instant delivery" text="Key emailed after 2 confirmations." />
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-24 border-t border-black/5 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  Checkout <span className="text-[#66CC66]">GigaPeta</span>
                </h3>
                <p className="mt-2 text-slate-600">Buy GigaPeta.com Premium Key direct to Email.</p>
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
                        ? "border-[#66CC66]/60 bg-white/70"
                        : "border-black/10 hover:border-black/20 bg-white/50"}`}
                  >
                    <Icon className="h-4 w-4 text-[#66CC66]"/>{m.label}
                    {active && <span className="ml-1 text-xs text-slate-600">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Network picker (ETH + stables) */}
            {METHOD_NEEDS_CHAIN[method] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-700">Network:</span>
                {(CHAIN_OPTIONS[method] || []).map(c => {
                  const active = chain === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setChain(c); resetPayment(); }}
                      className={`px-3 py-1.5 rounded-xl border text-sm
                        ${active ? 'border-[#66CC66]/60 bg-white/70'
                                 : 'border-black/10 hover:border-black/20 bg-white/50'}`}
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
                // PRE-GENERATE
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-700">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-black/10 text-lg backdrop-blur">
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }} className="text-xs px-3 py-2 rounded-xl bg-white/50 border border-black/10 hover:border-black/20">
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-700">Your Email (for key delivery)</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        placeholder="you@email.com"
                        disabled={emailLocked}
                        className={`flex-1 px-4 py-3 rounded-xl bg-white/60 border outline-none text-lg backdrop-blur ${
                          email.length === 0
                            ? "border-black/10"
                            : isEmailValid ? "border-emerald-500/60" : "border-red-400/60"
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
                      className={`w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg
                        ${(!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                          ? "bg-white/50 text-slate-400 cursor-not-allowed border border-black/10"
                          : "bg-[#66CC66] text-white hover:opacity-95"}`}
                    >
                      {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                      {generating ? 'Generating…' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ) : (
                // DURING PAYMENT
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-[#66CC66]"/> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-700">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input
                          readOnly
                          value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-black/10 font-mono text-lg backdrop-blur"
                        />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border border-black/10 hover:border-black/20 bg-white/60" title="Copy amount">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-700">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-black/10 font-mono text-sm backdrop-blur"/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-black/10 hover:border-black/20 bg-white/60" title="Copy address">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-slate-700 mt-1">
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
                        className="mt-2 rounded-xl border border-black/10 shadow-[0_0_35px_rgba(102,204,102,0.25)] bg-white/60 backdrop-blur"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-black/10 grid place-items-center text-slate-400 bg-white/50 backdrop-blur">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-slate-800 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#66CC66]"/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT COLUMN */}
              {step !== 'pay' ? (
                // Pre-generate: guidance
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold">How it works</h4>
                  <ol className="space-y-3 text-slate-700 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/70 border border-black/10 grid place-items-center">
                        <Bitcoin className="h-4 w-4 text-[#66CC66]" />
                      </div>
                      <span>Select a GigaPeta Premium plan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/70 border border-black/10 grid place-items-center">
                        <Mail className="h-4 w-4 text-[#66CC66]" />
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/70 border border-black/10 grid place-items-center">
                        <ShieldCheck className="h-4 w-4 text-[#66CC66]" />
                      </div>
                      <span>Choose coin (and network for ETH / USDT / USDC)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/70 border border-black/10 grid place-items-center">
                        <QrCode className="h-4 w-4 text-[#66CC66]" />
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/70 border border-black/10 grid place-items-center">
                        <TimerIcon className="h-4 w-4 text-[#66CC66]" />
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/70 border border-black/10 grid place-items-center">
                        <Rocket className="h-4 w-4 text-[#66CC66]" />
                      </div>
                      <span>Key emailed after <span className="text-slate-900">2 confirmations</span></span>
                    </li>
                  </ol>

                  <div className="rounded-2xl border border-black/10 bg-white/60 p-4 text-xs text-slate-700 backdrop-blur">
                    Payment details and QR will appear after you generate an address.
                  </div>
                </div>
              ) : (
                // During payment: summary
                <div>
                  <h5 className="text-2xl font-semibold">Order Summary</h5>
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/10 px-3 py-1 text-sm text-slate-800">
                      <TimerIcon className="h-4 w-4 text-[#66CC66]" />
                      <span>Time left</span>
                      <span className="font-mono text-slate-900">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
                        <ShieldCheck className="h-4 w-4 text-[#66CC66]" />
                        Buyer pays network fees
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
                        <ShieldCheck className="h-4 w-4 text-[#66CC66]" />
                        2 confirmations required
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
                        <Mail className="h-4 w-4 text-[#66CC66]" />
                        Instant Delivery
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button onClick={resetPayment} className="w-full px-6 py-4 rounded-2xl border border-black/10 bg-white/60 hover:bg-white/80">
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
      <section id="faq" className="py-16 border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full" style={{backgroundColor:'#66CC66'}} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           text-sm font-semibold text-white"
                style={{ backgroundColor: '#66CC66' }}
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                           border border-black/10 bg-white/60 hover:bg-white/80"
              >
                <Zap className="h-4 w-4 text-[#66CC66]" />
                View Plans
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Main Q&A */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4 text-[#66CC66]" />How do I buy a GigaPeta key?</span>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a pack & enter your email.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Buy Now</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                    <p className="mt-2 text-slate-600 text-xs">
                      Stuck? <a href="/support" className="underline">Contact support</a>.
                    </p>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#66CC66]" />Which coins & networks do you support?</span>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1">ETH supports L2s (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[#66CC66]" />When will I receive my key?</span>}
                a={<>Instantly after required confirmations (usually minutes). We email the key to the address you enter at checkout.</>}
              />

              {/* Activation moved here */}
              <QA
                q={<span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#66CC66]" />How do I activate my GigaPeta key?</span>}
                a={
                  <>
                    <div className="rounded-xl border border-black/10 bg-white/60 p-3 backdrop-blur">
                      <div className="text-sm font-semibold text-slate-900">You’ll receive a Premium Key like:</div>
                      <div className="mt-1 inline-block rounded-md border border-black/10 bg-white/70 px-2 py-1 font-mono text-sm text-slate-900">
                        1220s5e5cbo381XXXXX
                      </div>
                    </div>
                    <ol className="mt-3 list-decimal list-inside space-y-1">
                      <li>Log in to your GigaPeta account (or register at <a href="http://gigapeta.com" target="_blank" rel="noreferrer" className="underline">gigapeta.com</a>).</li>
                      <li>Open <em>My Account</em>.</li>
                      <li>Find the <strong>Apply Promo Code</strong> field, paste your key, and submit.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#66CC66]" />I sent the wrong amount / network</span>}
                a={
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                    <li><strong>Overpaid:</strong> <a href="/support" className="underline">Contact support</a> with your TX hash—we’ll reconcile.</li>
                    <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Not sure? <a href="/support" className="underline">Reach out</a> ASAP.</li>
                  </ul>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Coins className="h-4 w-4 text-[#66CC66]" />Where do your prices come from?</span>}
                a="Live market pricing via our /api/price (CoinGecko source). Your amount is locked for 30 minutes when you click Buy Now."
              />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-[#66CC66]" />
                Quick help
              </div>

              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✔️ Unlimited speed & threads</li>
                <li>✔️ 90 GB traffic per 72h</li>
                <li>✔️ Direct links + manager support</li>
                <li>✔️ Instant email delivery</li>
              </ul>

              <div className="mt-5 rounded-xl border border-black/10 bg-white/70 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Need assistance?</div>
                <p className="text-slate-700 text-sm mt-1">
                  Our team can verify your transaction and resend keys if needed.
                </p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: '#66CC66' }}
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
      <footer className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-600">
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

/* Presentational helpers (white glass theme) */
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-slate-700">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/60 border border-black/10 ${mono ? 'font-mono' : ''} text-lg backdrop-blur`}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false, wrap=false }:{label:string; value:string; mono?:boolean; wrap?:boolean}){
  return (
    <div>
      <div className="text-xs text-slate-600">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${wrap ? 'break-all' : ''} mt-1 text-slate-900`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur">
      <div className="inline-flex items-center gap-2 text-slate-900">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-slate-700 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white/60 backdrop-blur hover:bg-white/70 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 text-slate-500 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="h-px w-full" style={{backgroundColor:'#66CC66', opacity:0.35}} />
      <div className="px-4 pb-4 pt-3 text-slate-800 text-sm">
        {a}
      </div>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft white blobs */}
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[70vh] w-[110vw] rounded-full bg-white/60 blur-3xl" />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[55vh] w-[55vw] rounded-full bg-white/50 blur-3xl" />
    </div>
  );
}
