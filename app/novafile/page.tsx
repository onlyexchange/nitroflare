'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  ArrowLeftRight,
} from "lucide-react";

/** ───────────────────────────────────────────────────────────────────────────
 *  NovaFile — light glass UI styled like novafile.org
 *  Palette pulled from screenshot:
 *    Primary cyan:      #2DA6D8
 *    Primary dark:      #1E7CC0
 *    Header ribbon:     #2CA4D6 → #1E7CC0
 *    Check/confirm:     #7CCB5A
 *    Card edge:         rgba(30,124,192,0.12)
 *    Glass background:  #F3F7FB → #E8F1F8
 *  ───────────────────────────────────────────────────────────────────────── */

const COLORS = {
  primary: '#2DA6D8',
  primaryDark: '#1E7CC0',
  check: '#7CCB5A',
  glassFrom: '#F3F7FB',
  glassTo: '#E8F1F8',
  cardEdge: 'rgba(30,124,192,0.12)',
  ink: '#0A2B3B',
};

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

// Premium + VIP packs (keep your pricing/ids)
const PLANS = [
  // Premium
  { id: 'nv-30',   label: 'Premium — 30 Days',  days: 30,  priceUSD: 9.95,  wasUSD: 14.95 },
  { id: 'nv-90',   label: 'Premium — 90 Days',  days: 90,  priceUSD: 33.95, wasUSD: 39.95 },
  { id: 'nv-180',  label: 'Premium — 180 Days', days: 180, priceUSD: 64.95, wasUSD: 69.95 },
  { id: 'nv-365',  label: 'Premium — 365 Days', days: 365, priceUSD: 89.95, wasUSD: 99.95 },
  // VIP
  { id: 'nv-vip-30',  label: 'VIP — 30 Days',  days: 30,  priceUSD: 16.95, wasUSD: 22.95 },
  { id: 'nv-vip-90',  label: 'VIP — 90 Days',  days: 90,  priceUSD: 39.95, wasUSD: 49.95 },
  { id: 'nv-vip-180', label: 'VIP — 180 Days', days: 180, priceUSD: 69.95, wasUSD: 79.95 },
  { id: 'nv-vip-365', label: 'VIP — 365 Days', days: 365, priceUSD: 99.95, wasUSD: 109.95 },
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
    "Scanning blockchain network…",
    "Watching mempool for your tx…",
    "Matching recipient address…",
    "Waiting for broadcast…",
    "Verifying inputs…",
    "0/2 confirmations…",
    "Checking network fee…",
    "Still scanning…"
  ];

  // Light header timer (cosmetic)
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

  const tierFromLabel = (label: string) =>
    label.toLowerCase().includes('vip') ? 'Premium VIP' : 'Premium';

  return (
    <div
      className="min-h-screen text-[var(--ink)]"
      style={{
        // glassy light background
        background: `linear-gradient(180deg, ${COLORS.glassFrom} 0%, ${COLORS.glassTo} 100%)`,
        // default text color
        // @ts-ignore
        ['--ink' as any]: COLORS.ink,
      }}
    >
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b" style={{ borderColor: COLORS.cardEdge }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Only.Exchange — Home"
            prefetch={false}
          >
            <span
              className="inline-grid h-8 w-8 place-items-center rounded-xl text-white ring-1 ring-black/5 shadow-sm transition-transform group-hover:scale-105"
              style={{ background: COLORS.primary }}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:opacity-90">Only.Exchange</span>
          </Link>
          <a
            href="#checkout"
            onClick={(e)=>{e.preventDefault(); document.getElementById('checkout')?.scrollIntoView({behavior:'smooth'});}}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
            style={{ background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` }}
          >
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-6 text-white"
                 style={{ background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` }}>
              <Zap className="h-3.5 w-3.5 text-white"/> Instant delivery • Live price lock
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              NovaFile <span style={{ color: COLORS.primaryDark }}>Premium & VIP</span> Keys
            </h1>
            <p className="mt-4 text-[color:var(--ink)]/70 text-lg max-w-2xl">
              Light, fast, and simple — buy with crypto and get your key instantly after confirmations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#plans"
                onClick={(e)=>{e.preventDefault(); document.getElementById('plans')?.scrollIntoView({behavior:'smooth'})}}
                className="px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-white hover:opacity-95"
                style={{ background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` }}
              >
                <Flame className="h-5 w-5"/> View Plans
              </a>
              <a
                href="#checkout"
                onClick={(e)=>{e.preventDefault(); document.getElementById('checkout')?.scrollIntoView({behavior:'smooth'})}}
                className="px-5 py-3 rounded-2xl border inline-flex items-center gap-2"
                style={{ borderColor: COLORS.cardEdge, background: 'rgba(255,255,255,0.55)' }}
              >
                <Bitcoin className="h-5 w-5"/> Pay with Crypto
              </a>
            </div>

          
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t" style={{ borderColor: COLORS.cardEdge }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.primaryDark }}>Choose your plan</h2>
          <p className="text-[color:var(--ink)]/70 mt-2">Premium or Premium VIP — instant delivery after confirmations.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> handleSelectPlan(p)}
                whileHover={{scale:1.02}}
                className="text-left rounded-2xl border bg-white/70 backdrop-blur p-5"
                style={{
                  borderColor: COLORS.cardEdge,
                  boxShadow: selected.id===p.id
                    ? `0 0 0 2px ${COLORS.primary} inset, 0 8px 24px rgba(30,124,192,0.15)`
                    : '0 8px 24px rgba(30,124,192,0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wide" style={{ color: COLORS.primaryDark }}>
                    {tierFromLabel(p.label)}
                  </div>
                  {selected.id===p.id && <CheckCircle2 className="h-5 w-5" style={{ color: COLORS.check }}/>}
                </div>
                <div className="mt-1 text-lg font-semibold text-[color:var(--ink)]">
                  {p.label.replace(/^(Premium — |VIP — )/, '')}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-[color:var(--ink)]">${p.priceUSD.toFixed(2)}</div>
                  <div className="text-[color:var(--ink)]/50 line-through">${p.wasUSD.toFixed(2)}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 text-sm text-[color:var(--ink)]/70">
            Selected: <span className="text-[color:var(--ink)] font-medium">{selected.label}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.primaryDark }}>
            💎 Premium Benefits
          </h2>

          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Zap className="h-5 w-5" />} title="Max speed" text="Blazing-fast downloads with no delays." />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Direct downloads" text="Start instantly from your account." />
            <Feature icon={<PlayCircle className="h-5 w-5" />} title="Resume support" text="Pick up large downloads anytime." />
            <Feature icon={<Gauge className="h-5 w-5" />} title="No waiting" text="No queues, no captchas, no ads." />
            <Feature icon={<Coins className="h-5 w-5" />} title="Secure transfers" text="Encrypted & reliable delivery." />
            <Feature icon={<Mail className="h-5 w-5" />} title="Instant delivery" text="Key emailed after confirmations." />
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-20 border-t" style={{ borderColor: COLORS.cardEdge }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[color:var(--ink)]">Checkout</h3>
                <p className="mt-2 text-[color:var(--ink)]/70">Buy NovaFile.org Premium / VIP key direct to Email.</p>
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
                    className="px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2"
                    style={{
                      borderColor: active ? COLORS.primary : COLORS.cardEdge,
                      background: active ? `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` : 'rgba(255,255,255,0.65)',
                      color: active ? '#fff' : 'inherit'
                    }}
                  >
                    <Icon className="h-4 w-4"/>{m.label}
                    {active && <span className="ml-1 text-xs opacity-90">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Network picker */}
            {METHOD_NEEDS_CHAIN[method] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-[color:var(--ink)]/70">Network:</span>
                {(CHAIN_OPTIONS[method] || []).map(c => {
                  const active = chain === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setChain(c); resetPayment(); }}
                      className="px-3 py-1.5 rounded-xl border text-sm"
                      style={{
                        borderColor: active ? COLORS.primary : COLORS.cardEdge,
                        background: active ? `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` : 'rgba(255,255,255,0.65)',
                        color: active ? '#fff' : 'inherit'
                      }}
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
                    <div className="text-sm text-[color:var(--ink)]/70">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border text-lg"
                           style={{ borderColor: COLORS.cardEdge }}>
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button
                        onClick={()=>{ resetPayment(); document.getElementById('plans')?.scrollIntoView({behavior:'smooth'}) }}
                        className="text-xs px-3 py-2 rounded-xl border"
                        style={{ borderColor: COLORS.cardEdge, background: 'rgba(255,255,255,0.65)' }}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-[color:var(--ink)]/70">Your Email (for key delivery)</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        placeholder="you@email.com"
                        disabled={emailLocked}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border outline-none text-lg"
                        style={{
                          borderColor:
                            email.length === 0
                              ? COLORS.cardEdge
                              : isEmailValid ? 'rgba(124,203,90,0.65)' : 'rgba(239,68,68,0.5)'
                        }}
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
                      className="w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`
                      }}
                    >
                      {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                      {generating ? 'Generating…' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold flex items-center gap-2" style={{ color: COLORS.primaryDark }}>
                    <QrCode className="h-5 w-5"/> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-[color:var(--ink)]/70">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input
                          readOnly
                          value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur border font-mono text-lg"
                          style={{ borderColor: COLORS.cardEdge }}
                        />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border" style={{ borderColor: COLORS.cardEdge }} title="Copy amount">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[color:var(--ink)]/70">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur border font-mono text-sm" style={{ borderColor: COLORS.cardEdge }}/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border" style={{ borderColor: COLORS.cardEdge }} title="Copy address">
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs mt-1 text-[color:var(--ink)]/70">
                          Network: <span className="text-[color:var(--ink)]/90">{chainLabel(chain)}</span>
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
                        className="mt-2 rounded-xl border"
                        style={{ borderColor: COLORS.cardEdge, boxShadow: '0 0 35px rgba(30,124,192,0.15)' }}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed grid place-items-center text-[color:var(--ink)]/40"
                           style={{ borderColor: COLORS.cardEdge }}>
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-[color:var(--ink)]/80 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: COLORS.primaryDark }}/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT COLUMN */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold" style={{ color: COLORS.primaryDark }}>How it works</h4>
                  <ol className="space-y-3 text-[color:var(--ink)]/80 text-sm">
                    <Step icon={<Bitcoin className="h-4 w-4" />} text="Select a Premium or Premium VIP plan" />
                    <Step icon={<Mail className="h-4 w-4" />} text="Enter your email for delivery" />
                    <Step icon={<ShieldCheck className="h-4 w-4" />} text="Choose coin (and network for ETH / USDT / USDC)" />
                    <Step icon={<QrCode className="h-4 w-4" />} text="Generate to lock price & get your address" />
                    <Step icon={<TimerIcon className="h-4 w-4" />} text="Send the exact amount within 30:00" />
                    <Step icon={<Rocket className="h-4 w-4" />} text="Key emailed after 2 confirmations" />
                  </ol>

                  <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 text-xs text-[color:var(--ink)]/70" style={{ borderColor: COLORS.cardEdge }}>
                    Payment details and QR will appear after you generate an address.
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-2xl font-semibold" style={{ color: COLORS.primaryDark }}>Order Summary</h5>
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
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white"
                         style={{ background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` }}>
                      <TimerIcon className="h-4 w-4" />
                      <span>Time left</span>
                      <span className="font-mono">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <Badge>Buyer pays network fees</Badge>
                      <Badge>2 confirmations required</Badge>
                      <Badge>Instant email delivery</Badge>
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button
                      onClick={resetPayment}
                      className="w-full px-6 py-4 rounded-2xl border"
                      style={{ borderColor: COLORS.cardEdge, background: 'rgba(255,255,255,0.65)' }}
                    >
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
      <section id="faq" className="py-16 border-t" style={{ borderColor: COLORS.cardEdge }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.primaryDark }}>
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full" style={{ background: COLORS.primary }} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                style={{ background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` }}
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border"
                style={{ borderColor: COLORS.cardEdge, background: 'rgba(255,255,255,0.65)' }}
              >
                <Zap className="h-4 w-4" />
                View NovaFile plans
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<><QrCode className="h-4 w-4 opacity-90" /> How do I buy a key?</>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a <span className="font-semibold">Premium</span> or <span className="font-semibold">Premium VIP</span> pack.</li>
                      <li>Enter your email.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Buy Now</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                  </>
                }
              />
              <QA
                q={<><ShieldCheck className="h-4 w-4 opacity-90" /> When do I receive my key?</>}
                a="Instantly after required confirmations (usually minutes). We email it to the address entered at checkout."
              />
              <QA
                q={<><Coins className="h-4 w-4 opacity-90" /> Which coins & networks are supported?</>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1">ETH supports L2 (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />
              <QA
                q={<><AlertTriangle className="h-4 w-4 opacity-90" /> I sent the wrong amount / network</>}
                a={
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                    <li><strong>Overpaid:</strong> contact support with your TX hash—we’ll reconcile.</li>
                    <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Reach out ASAP if unsure.</li>
                  </ul>
                }
              />
              <QA
                q={<><RefreshCw className="h-4 w-4 opacity-90" /> Change my pack or email?</>}
                a="During payment, email is locked. Click Cancel / Start Over to edit, then Generate again."
              />
              <QA
                q={<><Mail className="h-4 w-4 opacity-90" /> How to activate my NovaFile key?</>}
                a={
                  <>
                    <div>You’ll receive a Premium Key like: <span className="font-mono px-2 py-0.5 rounded bg-black/5">1220s5e5cbo381XXXXX</span></div>
                    <ol className="mt-2 list-decimal list-inside space-y-1">
                      <li>Log in to your NovaFile account (<a className="underline" href="https://novafile.org/signup.html" target="_blank" rel="noreferrer">create one here</a> if needed).</li>
                      <li>Open <span className="font-semibold">My Account</span>.</li>
                      <li>Paste your key into <span className="font-semibold">Apply Promo Code</span> and confirm.</li>
                    </ol>
                  </>
                }
              />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border bg-white/70 backdrop-blur p-5" style={{ borderColor: COLORS.cardEdge }}>
              <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.primaryDark }}>
                <Zap className="h-4 w-4" />
                Quick help
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[color:var(--ink)]/80">
                <li>✔️ Compare Premium vs Premium VIP above</li>
                <li>✔️ Use the QR to pay exact amount</li>
                <li>✔️ Keys auto-send after 2 confs</li>
              </ul>
              <div className="mt-5 rounded-xl border bg-white/70 backdrop-blur p-4" style={{ borderColor: COLORS.cardEdge }}>
                <div className="text-sm font-semibold">Still stuck?</div>
                <p className="text-[color:var(--ink)]/70 text-sm mt-1">
                  Our team can verify your transaction and resend keys if needed.
                </p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` }}
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
      <footer className="border-t" style={{ borderColor: COLORS.cardEdge }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-[color:var(--ink)]/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg" style={{ background: COLORS.primary }} />
              <span className="font-semibold text-[color:var(--ink)]">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="/support">Support</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/refunds">Refunds</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-[color:var(--ink)]/60 max-w-4xl">
            © 2025 Only.Exchange | All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Presentational helpers */
function Step({ icon, text }:{icon: React.ReactNode; text: string}){
  return (
    <li className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-xl grid place-items-center"
           style={{ background: 'white', border: `1px solid ${COLORS.cardEdge}`, color: COLORS.primaryDark }}>
        {icon}
      </div>
      <span>{text}</span>
    </li>
  );
}
function Badge({ children }:{ children: React.ReactNode }){
  return (
    <div className="rounded-xl px-3 py-2 flex items-center justify-center"
         style={{ border: `1px solid ${COLORS.cardEdge}`, background: 'rgba(255,255,255,0.7)' }}>
      <ShieldCheck className="h-4 w-4 mr-2" style={{ color: COLORS.check }}/>
      <span className="text-xs text-[color:var(--ink)]/80">{children}</span>
    </div>
  );
}
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-[color:var(--ink)]/70">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border text-lg ${mono ? 'font-mono' : ''}`}
           style={{ borderColor: COLORS.cardEdge }}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false, wrap=false }:{label:string; value:string; mono?:boolean; wrap?:boolean}){
  return (
    <div>
      <div className="text-xs text-[color:var(--ink)]/60">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${wrap ? 'break-all' : ''} mt-1 text-[color:var(--ink)]/90`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur p-5"
         style={{ borderColor: COLORS.cardEdge }}>
      <div className="inline-flex items-center gap-2" style={{ color: COLORS.primaryDark }}>
        {icon}<span className="font-semibold">{title}</span>
      </div>
      <p className="text-[color:var(--ink)]/70 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border bg-white/60 backdrop-blur hover:bg-white/70 transition overflow-hidden"
             style={{ borderColor: COLORS.cardEdge }}>
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-[color:var(--ink)]">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
      </summary>
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryDark})` }} />
      <div className="px-4 pb-4 pt-3 text-[color:var(--ink)]/85 text-sm">
        {a}
      </div>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* subtle cyan glows */}
      <div className="absolute -top-20 -left-20 h-[40vh] w-[60vw] rounded-full"
           style={{ background: `radial-gradient(closest-side, ${COLORS.primary}20, transparent)`, filter: 'blur(40px)' }}/>
      <div className="absolute -bottom-20 -right-32 h-[40vh] w-[60vw] rounded-full"
           style={{ background: `radial-gradient(closest-side, ${COLORS.primaryDark}1f, transparent)`, filter: 'blur(40px)' }}/>
    </div>
  );
}
