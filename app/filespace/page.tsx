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
  Flame,
  Loader2,
  Mail,
  Coins,
  AlertTriangle,
  RefreshCw,
  Gauge,
  PlayCircle,
  RotateCcw,
  ArrowLeftRight,
} from 'lucide-react';

/** Filespace — light/glass theme + full checkout */

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

/** FILESPACE PLANS */
const PLANS = [
  { id: 'fs-30',  label: '30 Days',  days: 30,  priceUSD: 9.95,  wasUSD: 15.95 },
  { id: 'fs-90',  label: '90 Days',  days: 90,  priceUSD: 14.95, wasUSD: 39.95 }, // great deal
  { id: 'fs-330', label: '330 Days', days: 330, priceUSD: 79.95, wasUSD: 117.95 },
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
    return address;
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <BG />

      {/* Header (light glass) */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl
               bg-gradient-to-br from-[#52AEE0] via-sky-400 to-blue-600
               text-white ring-1 ring-black/5 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-slate-900">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="hover:text-slate-900">Plans</a>
            <a href="#features" onClick={e=>{e.preventDefault(); scrollToId('features')}} className="hover:text-slate-900">Features</a>
            <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="hover:text-slate-900">Checkout</a>
            <a href="#faq" onClick={e=>{e.preventDefault(); scrollToId('faq')}} className="hover:text-slate-900">FAQ</a>
          </nav>
          <a
            href="#checkout"
            onClick={e=>{e.preventDefault(); scrollToId('checkout')}}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8ABD3F] text-white hover:brightness-110"
          >
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 ring-1 ring-slate-200 px-3 py-1 text-xs text-slate-600 mb-6">
              <Zap className="h-3.5 w-3.5 text-[#52AEE0]"/> Best pricing • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#52AEE0]">Filespace</span>{' '}
              <span className="text-slate-900">Premium Keys</span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl">
              Pay with crypto and get your Filespace premium key <em>instantly</em> after confirmation.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="px-5 py-3 rounded-2xl bg-[#8ABD3F] text-white inline-flex items-center gap-2 hover:brightness-110">
                <Flame className="h-5 w-5"/> View Plans
              </a>
              <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="px-5 py-3 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/80 inline-flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-[#52AEE0]"/> Pay with Crypto
              </a>
            </div>

            
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-slate-200 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose your plan</h2>
          <p className="text-slate-600 mt-2">Instant delivery after confirmations.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> handleSelectPlan(p)}
                whileHover={{scale:1.02}}
                className={`text-left rounded-2xl border ${selected.id===p.id? 'border-[#52AEE0]/60' : 'border-slate-200'} bg-white/70 p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-slate-900">{p.label}</div>
                  {selected.id===p.id && <CheckCircle2 className="h-5 w-5 text-[#52AEE0]"/>}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-slate-900">${p.priceUSD.toFixed(2)}</div>
                  <div className="text-slate-400 line-through">${p.wasUSD.toFixed(2)}</div>
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  {p.label === '30 Days' ? '500 GB storage • Instant start' :
                   p.label === '90 Days' ? 'Best deal • 500 GB storage' :
                   'Long-term • 500 GB storage'}
                </div>
              </motion.button>
            ))}
          </div>
          <div className="mt-6 text-sm text-slate-600">Selected: <span className="text-slate-900 font-medium">{selected.label}</span></div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            <span className="text-[#52AEE0]">Premium</span> Features
          </h2>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Gauge className="h-5 w-5 text-[#52AEE0]" />} title="Download speed" text="Unlimited — no throttling." />
            <Feature icon={<Zap className="h-5 w-5 text-[#52AEE0]" />} title="Instant start" text="Next download starts immediately." />
            <Feature icon={<PlayCircle className="h-5 w-5 text-[#52AEE0]" />} title="Direct links" text="Skip queues and redirections." />
            <Feature icon={<ShieldCheck className="h-5 w-5 text-[#52AEE0]" />} title="Simultaneous downloads" text="Multiple files at once." />
            <Feature icon={<Mail className="h-5 w-5 text-[#52AEE0]" />} title="Instant delivery" text="Premium key emailed on confirmations." />
            <Feature icon={<Coins className="h-5 w-5 text-[#52AEE0]" />} title="Storage" text="500 GB secure storage included." />
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-24 border-t border-slate-200 bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Checkout</h3>
                <p className="mt-2 text-slate-600">Buy Filespace Premium Key direct to Email.</p>
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
                        ? 'border-[#52AEE0]/60 bg-white/80'
                        : 'border-slate-200 hover:border-slate-300 bg-white/60'}`}
                  >
                    <Icon className="h-4 w-4 text-[#52AEE0]"/>{m.label}
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
                        ${active ? 'border-[#52AEE0]/60 bg-white/80'
                                 : 'border-slate-200 hover:border-slate-300 bg-white/60'}`}
                    >
                      {chainLabel(c)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Two-column switch */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              {/* LEFT */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-600">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 text-lg text-slate-900">
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }} className="text-xs px-3 py-2 rounded-xl bg-white/60 border border-slate-200 hover:border-slate-300">
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
                        className={`flex-1 px-4 py-3 rounded-xl bg-white/60 border outline-none text-lg text-slate-900 ${
                          email.length === 0
                            ? 'border-slate-200'
                            : isEmailValid ? 'border-emerald-400/60' : 'border-rose-400/60'
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
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-[#8ABD3F] text-white hover:brightness-110 shadow-[0_0_25px_rgba(255,255,255,0.45)]'}`}
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
                    <QrCode className="h-5 w-5 text-[#52AEE0]"/> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input
                          readOnly
                          value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 font-mono text-lg text-slate-900"
                        />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/60" title="Copy amount">
                          <Copy className="h-4 w-4 text-slate-700"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 font-mono text-sm text-slate-900"/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/60" title="Copy address">
                          <Copy className="h-4 w-4 text-slate-700"/>
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
                        className="mt-2 rounded-xl border border-slate-200 shadow-[0_0_35px_rgba(255,255,255,0.5)]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-slate-200 grid place-items-center text-slate-400">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-slate-700 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#52AEE0]"/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold text-slate-900">How it works</h4>
                  <ol className="space-y-3 text-slate-700 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Bitcoin className="h-4 w-4 text-[#52AEE0]" />
                      </div>
                      <span>Select a Filespace Premium plan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Mail className="h-4 w-4 text-[#52AEE0]" />
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <ShieldCheck className="h-4 w-4 text-[#52AEE0]" />
                      </div>
                      <span>Choose coin (and network for ETH / USDT / USDC)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <QrCode className="h-4 w-4 text-[#52AEE0]" />
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <TimerIcon className="h-4 w-4 text-[#52AEE0]" />
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/60 border border-slate-200 grid place-items-center">
                        <Rocket className="h-4 w-4 text-[#52AEE0]" />
                      </div>
                      <span>Key emailed after <span className="text-slate-900 font-medium">2 confirmations</span></span>
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-slate-200 px-3 py-1 text-sm text-slate-700">
                      <TimerIcon className="h-4 w-4 text-[#52AEE0]" />
                      <span>Time left</span>
                      <span className="font-mono text-slate-900">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-[#52AEE0]" />
                        Buyer pays network fees
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-[#52AEE0]" />
                        2 confirmations required
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 flex items-center justify-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-[#52AEE0]" />
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
      <section id="faq" className="py-16 border-t border-slate-200 bg-gradient-to-b from-white/70 to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full bg-gradient-to-r from-[#52AEE0]/70 via-sky-500/60 to-blue-600/70" />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           text-sm font-semibold text-white
                           bg-[#8ABD3F] hover:brightness-110
                           shadow-[0_0_18px_rgba(255,255,255,0.45)]"
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                           border border-slate-200 bg-white/60 hover:bg-white/80"
              >
                <Zap className="h-4 w-4 text-[#52AEE0]" />
                Buy Filespace keys
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Q&A left */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<><QrCode className="h-4 w-4 text-[#52AEE0]" /> How do I buy a Filespace key?</>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1 text-slate-800">
                      <li>Choose a pack & enter your email.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Generate</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                    <p className="mt-2 text-slate-600 text-xs">
                      Stuck? <a href="/support" className="font-semibold text-[#52AEE0] underline underline-offset-4 decoration-slate-300">Contact support</a>.
                    </p>
                  </>
                }
              />

              <QA
                q={<><ShieldCheck className="h-4 w-4 text-[#52AEE0]" /> Which coins & networks are supported?</>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1">ETH supports L2s: Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll.</div>
                  </>
                }
              />

              <QA
                q={<><Mail className="h-4 w-4 text-[#52AEE0]" /> When do I receive my key?</>}
                a={
                  <>
                    <div>Instantly after required confirmations (usually minutes).</div>
                    <div className="mt-1 text-slate-600 text-sm">We send the key to the email you entered at checkout.</div>
                  </>
                }
              />

              <QA
                q={<><ShieldCheck className="h-4 w-4 text-[#52AEE0]" /> How do I activate my key?</>}
                a={
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
                      <div className="text-sm font-semibold text-slate-900">You’ll receive a Premium Key like:</div>
                      <div className="mt-1 inline-block rounded-md border border-slate-200 bg-white/80 px-2 py-1 font-mono text-sm text-slate-900">
                        1220s5e5cbo381XXXXX
                      </div>
                    </div>
                    <ol className="mt-3 list-decimal list-inside space-y-1 text-slate-800">
                      <li>Log in to your Filespace account (<a href="https://filespace.com/?op=registration" target="_blank" rel="noreferrer" className="text-[#52AEE0] underline">register here</a> if needed).</li>
                      <li>Open <span className="font-medium">My Account</span>.</li>
                      <li>Paste your Premium Key into <span className="font-medium">Apply Promo Code</span> and submit.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<><AlertTriangle className="h-4 w-4 text-[#52AEE0]" /> I sent the wrong amount / network</>}
                a={
                  <ul className="list-disc list-inside space-y-1 text-slate-800">
                    <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                    <li><strong>Overpaid:</strong> <a href="/support" className="text-[#52AEE0] underline">Contact support</a> with your TX hash—we’ll reconcile.</li>
                    <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Reach out ASAP if unsure.</li>
                  </ul>
                }
              />

              <QA
                q={<><Coins className="h-4 w-4 text-[#52AEE0]" /> Where do your prices come from?</>}
                a="Live crypto market pricing (via /api/price). Your amount is locked for 30 minutes when you click Buy Now."
              />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border border-slate-200 bg-white/60 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Zap className="h-4 w-4 text-[#52AEE0]" />
                Quick help
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✔️ <a href="#plans" className="underline decoration-slate-300 hover:decoration-slate-500">Filespace packs</a></li>
                <li>✔️ <a href="#checkout" className="underline decoration-slate-300 hover:decoration-slate-500">Checkout flow</a></li>
                <li>✔️ <a href="/support" className="underline decoration-slate-300 hover:decoration-slate-500">Payment issues</a></li>
                <li>✔️ <a href="/support" className="underline decoration-slate-300 hover:decoration-slate-500">Key not received</a></li>
              </ul>

              <div className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-[0_0_24px_rgba(255,255,255,0.45)]">
                <div className="text-sm font-semibold text-slate-900">Still stuck?</div>
                <p className="text-slate-700 text-sm mt-1">
                  Our team can verify your transaction and resend keys if needed.
                </p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg
                             text-sm font-semibold text-white
                             bg-[#8ABD3F] hover:brightness-110"
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
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-[#52AEE0] via-sky-400 to-blue-600" />
              <span className="font-semibold text-slate-900">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/support" className="hover:text-slate-900">Support</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/refunds" className="hover:text-slate-900">Refunds</Link>
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

/* Presentational helpers */
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 ${mono ? 'font-mono' : ''} text-lg text-slate-900`}>
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
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-5">
      <div className="inline-flex items-center gap-2 text-slate-900">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-slate-700 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm hover:border-slate-300 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2 text-slate-900">{q}</div>
        <ArrowRight className="h-4 w-4 text-slate-500 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="h-px w-full bg-gradient-to-r from-[#52AEE0]/40 via-sky-500/30 to-blue-600/40" />
      <div className="px-4 pb-4 pt-3 text-slate-700 text-sm">
        {a}
      </div>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft white glow blobs */}
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[70vh] w-[120vw] rounded-full bg-white/70 blur-3xl"/>
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-white/60 blur-3xl"/>
    </div>
  );
}
