'use client';

import Link from 'next/link';
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
  PlayCircle,
  Ban,
  Gauge,
  RotateCcw,
} from 'lucide-react';

/** KatFile — white glass vibe, blue accents (#3074B5) **/

const KAT_BLUE = '#3074B5';

const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  LTC: 'litecoin',
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

// Plans from your brief
const PLANS = [
  // 100 GB/day tier
  { id: 'kf-30-100',  label: '30 Days — 100 GB/day',  days: 30,   priceUSD: 6.95 },
  { id: 'kf-60-100',  label: '60 Days — 100 GB/day',  days: 60,   priceUSD: 19.95 },
  { id: 'kf-365-100', label: '365 Days — 100 GB/day', days: 365,  priceUSD: 29.95 },
  { id: 'kf-life-100',label: 'Lifetime — 100 GB/day', days: 9999, priceUSD: 49.95 },

  // 200 GB/day tier
  { id: 'kf-30-200',  label: '30 Days — 200 GB/day',  days: 30,   priceUSD: 9.95 },
  { id: 'kf-60-200',  label: '60 Days — 200 GB/day',  days: 60,   priceUSD: 24.95 },
  { id: 'kf-365-200', label: '365 Days — 200 GB/day', days: 365,  priceUSD: 49.95 },
  { id: 'kf-life-200',label: 'Lifetime — 200 GB/day', days: 9999, priceUSD: 69.95 },

  // Pro
  { id: 'kf-life-pro', label: 'Lifetime — PRO', days: 9999, priceUSD: 149.99 },
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
  ETH: true,   // ETH shows L2s; we still serve ETH mainnet addresses
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
  const [selected, setSelected]       = useState<Plan>(PLANS[0]);
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

  // Hero timer (cosmetic)
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
    const i = setInterval(fetchPrices, 60_000);
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
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setStep('pay');              // switch UI to Payment Details
      setEmailLocked(true);        // lock email
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

  // endpoint + demo
  function computeEndpoint(m: Method, c: Chain | null){
    if (m === 'BTC') return '/api/next-btc-address';
    if (m === 'ETH') return '/api/next-eth-address'; // always mainnet address
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Only.Exchange — Home"
            prefetch={false}
          >
            <span
              className="inline-grid h-8 w-8 place-items-center rounded-xl text-white ring-1 ring-black/5 shadow-sm transition-transform group-hover:scale-105"
              style={{ background: KAT_BLUE }}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:opacity-100">Only.Exchange</span>
          </Link>
          <a
            href="#checkout"
            onClick={(e)=>{e.preventDefault(); document.getElementById('checkout')?.scrollIntoView({behavior:'smooth',block:'start'});}}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
            style={{ background: KAT_BLUE }}
          >
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-22">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 ring-1 ring-slate-200 px-3 py-1 text-xs text-slate-700 mb-6">
              <Zap className="h-3.5 w-3.5" style={{ color: KAT_BLUE }}/>
              Best pricing • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              KatFile <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${KAT_BLUE}, #66A6E8)` }}>Premium Keys</span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl">
              Pay with crypto and get your KatFile premium key <em>instantly</em> after confirmation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#plans"
                onClick={(e)=>{e.preventDefault(); document.getElementById('plans')?.scrollIntoView({behavior:'smooth',block:'start'});}}
                className="px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-white"
                style={{ background: KAT_BLUE }}
              >
                View Plans <ArrowRight className="h-4 w-4"/>
              </a>
              <a
                href="#checkout"
                onClick={(e)=>{e.preventDefault(); document.getElementById('checkout')?.scrollIntoView({behavior:'smooth',block:'start'});}}
                className="px-5 py-3 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur inline-flex items-center gap-2"
              >
                <Bitcoin className="h-5 w-5" style={{ color: KAT_BLUE }}/> Pay with Crypto
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-slate-200/80 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-slate-600 mt-2">Big savings today. Instant delivery after confirmations.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> handleSelectPlan(p)}
                whileHover={{scale:1.02}}
                className={`text-left rounded-2xl border ${selected.id===p.id? 'border-sky-400/80' : 'border-slate-200'} bg-white/60 backdrop-blur p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">{p.label}</div>
                  {selected.id===p.id && <CheckCircle2 className="h-5 w-5" style={{ color: KAT_BLUE }}/>}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                </div>
                <div className="mt-3 text-xs text-slate-600">Best for fast downloads and no waiting.</div>
              </motion.button>
            ))}
          </div>
          <div className="mt-6 text-sm text-slate-700">Selected: <span className="font-medium">{selected.label}</span></div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">💎 Premium Benefits</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Gauge className="h-5 w-5" style={{ color: KAT_BLUE }}/>} title="Full speed" text="Maximum download speed with no throttling."/>
            <Feature icon={<PlayCircle className="h-5 w-5" style={{ color: KAT_BLUE }}/>} title="Direct downloads" text="Enable direct links for instant starts."/>
            <Feature icon={<Ban className="h-5 w-5" style={{ color: KAT_BLUE }}/>} title="No interruptions" text="Skip queues, captchas, and ads."/>
            <Feature icon={<RotateCcw className="h-5 w-5" style={{ color: KAT_BLUE }}/>} title="Resume support" text="Download managers and parallel downloads supported."/>
            <Feature icon={<ShieldCheck className="h-5 w-5" style={{ color: KAT_BLUE }}/>} title="Secure" text="Encrypted HTTPS access and safe delivery."/>
            <Feature icon={<Mail className="h-5 w-5" style={{ color: KAT_BLUE }}/>} title="Instant delivery" text="Premium key emailed after confirmations."/>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-24 border-t border-slate-200/80 bg-gradient-to-b from-white/40 via-white/60 to-white/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">Checkout</h3>
                <p className="mt-2 text-slate-700">Buy KatFile.com Premium Key direct to Email.</p>
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
                        ? 'border-sky-400/80 bg-white/70'
                        : 'border-slate-200 hover:border-slate-300 bg-white/60'}`}
                  >
                    <Icon className="h-4 w-4" style={{ color: KAT_BLUE }}/> {m.label}
                    {active && <span className="ml-1 text-xs text-slate-600">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Network picker */}
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
                        ${active ? 'border-sky-400/80 bg-white/70'
                                 : 'border-slate-200 hover:border-slate-300 bg-white/60'}`}
                    >
                      {chainLabel(c)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Two-column switcher */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              {/* LEFT */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-600">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-lg backdrop-blur">
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); document.getElementById('plans')?.scrollIntoView({behavior:'smooth',block:'start'}); }} className="text-xs px-3 py-2 rounded-xl bg-white/60 border border-slate-200 hover:border-slate-300">
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
                            : isEmailValid ? "border-emerald-400/60" : "border-rose-400/60"
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
                      className={`w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg text-white ${
                        (!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                          ? "bg-slate-300 cursor-not-allowed"
                          : ""
                      }`}
                      style={(!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                        ? {}
                        : { background: KAT_BLUE }}
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
                    <QrCode className="h-5 w-5" style={{ color: KAT_BLUE }}/> Payment Details
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
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/60" title="Copy amount">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 font-mono text-sm backdrop-blur"/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/60" title="Copy address">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-slate-600 mt-1">
                          Network: <span className="text-slate-800">{chainLabel(chain)}</span>
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
                        className="mt-2 rounded-xl border border-slate-200 shadow-[0_0_35px_rgba(51,117,181,0.18)] bg-white"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-slate-200 grid place-items-center text-slate-400 bg-white/50">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-slate-800 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: KAT_BLUE }}/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold">How it works</h4>
                  <ol className="space-y-3 text-slate-700 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Bitcoin className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                      </div>
                      <span>Select a KatFile Premium plan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Mail className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <ShieldCheck className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                      </div>
                      <span>Choose coin (and network for ETH / USDT / USDC)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <QrCode className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <TimerIcon className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Rocket className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                      </div>
                      <span>Key emailed after <span className="font-semibold">2 confirmations</span></span>
                    </li>
                  </ol>

                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-xs text-slate-700 backdrop-blur">
                    Payment details and QR will appear after you generate an address.
                  </div>
                </div>
              ) : (
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-slate-200 px-3 py-1 text-sm text-slate-800">
                      <TimerIcon className="h-4 w-4" style={{ color: KAT_BLUE }} />
                      <span>Time left</span>
                      <span className="font-mono">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700">
                        <ShieldCheck className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                        Buyer pays network fees
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700">
                        <ShieldCheck className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                        2 confirmations required
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-700">
                        <Mail className="h-4 w-4" style={{ color: KAT_BLUE }}/>
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
      <section id="faq" className="py-16 border-t border-slate-200/80 bg-gradient-to-b from-white/30 via-white/50 to-white/30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading + quick actions */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${KAT_BLUE}, #66A6E8)` }} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                style={{ background: KAT_BLUE }}
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-slate-200 bg-white/60 hover:border-slate-300"
              >
                <Zap className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                View KatFile plans
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Main Q&A (2 cols) */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4" style={{ color: KAT_BLUE }}/>How do I buy a key?</span>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a pack & enter your email above.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Buy Now</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: KAT_BLUE }}/>Which coins & networks are supported?</span>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1">ETH supports L2 (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" style={{ color: KAT_BLUE }}/>When do I receive my key?</span>}
                a={
                  <>
                    <div>Instantly after required confirmations (usually minutes).</div>
                    <div className="mt-1 text-sm text-slate-700">We send the key to the email you entered at checkout.</div>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4" style={{ color: KAT_BLUE }}/>How do I activate my KatFile key?</span>}
                a={
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
                      <div className="text-sm font-semibold">You’ll receive a Premium Key like:</div>
                      <div className="mt-1 inline-block rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-sm">
                        1220s5e5cbo381XXXXX
                      </div>
                    </div>
                    <ol className="mt-3 list-decimal list-inside space-y-1">
                      <li>Log in to your KatFile account (<a href="https://katfile.com/?op=registration" target="_blank" rel="noreferrer" className="underline" style={{ color: KAT_BLUE }}>register here</a> if needed).</li>
                      <li>Go to <strong>My Account</strong>.</li>
                      <li>Find the <em>Apply Promo Code</em> field.</li>
                      <li>Paste your Premium Key and click <strong>Apply</strong>.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" style={{ color: KAT_BLUE }}/>I sent the wrong amount / network</span>}
                a={
                  <>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                      <li><strong>Overpaid:</strong> <a href="/support" className="underline" style={{ color: KAT_BLUE }}>Contact support</a> with your TX hash—we’ll reconcile.</li>
                      <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Not sure? <a href="/support" className="underline" style={{ color: KAT_BLUE }}>Reach out</a> ASAP.</li>
                    </ul>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Coins className="h-4 w-4" style={{ color: KAT_BLUE }}/>Where do your prices come from?</span>}
                a="Live crypto market pricing. Your amount is locked for 30 minutes when you click Buy Now."
              />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border border-slate-200 bg-white/60 p-5 backdrop-blur">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4" style={{ color: KAT_BLUE }}/>
                Quick help
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>✔️ 30–365 days and Lifetime options</li>
                <li>✔️ 100 GB/day or 200 GB/day tiers</li>
                <li>✔️ Instant delivery after confirmations</li>
              </ul>

              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Still stuck?</div>
                <p className="text-slate-700 text-sm mt-1">
                  Our team can verify your transaction and resend keys if needed.
                </p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: KAT_BLUE }}
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
      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg" style={{ background: KAT_BLUE }} />
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

/* Helpers */
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
      <div className="text-xs text-slate-600">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${wrap ? 'break-all' : ''} mt-1 text-slate-900`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 backdrop-blur">
      <div className="inline-flex items-center gap-2 text-slate-900">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-slate-700 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white/60 backdrop-blur hover:border-slate-300 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" style={{ color: KAT_BLUE }}/>
      </summary>
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${KAT_BLUE}33, #66A6E833)` }} />
      <div className="px-4 pb-4 pt-3 text-slate-800 text-sm">
        {a}
      </div>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full blur-3xl" style={{ background: `${KAT_BLUE}22` }}/>
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full blur-3xl" style={{ background: '#66A6E822' }}/>
    </div>
  );
}
