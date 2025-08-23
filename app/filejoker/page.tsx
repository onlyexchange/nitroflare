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

/** FILEJOKER — Premium + Premium VIP with tier-colored UI
 *  Background: #457299
 *  Premium color:   #1EB4AA
 *  Premium VIP:     #5C98CA
 */

const BG_BASE = '#457299';
const PREMIUM = '#1EB4AA';
const VIP = '#5C98CA';

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

type Tier = 'premium' | 'vip';
type Plan = {
  id: string;
  label: string;
  days: number;
  priceUSD: number;
  wasUSD?: number;
  tier: Tier;
};

const PLANS: readonly Plan[] = [
  // Premium
  { id: 'fj-prem-30',  label: 'Premium — 30 Days',  days: 30,  priceUSD: 18.95, wasUSD: 22.95, tier: 'premium' },
  { id: 'fj-prem-90',  label: 'Premium — 90 Days',  days: 90,  priceUSD: 44.95,                 tier: 'premium' },
  { id: 'fj-prem-180', label: 'Premium — 180 Days', days: 180, priceUSD: 89.95,                 tier: 'premium' },
  { id: 'fj-prem-365', label: 'Premium — 365 Days', days: 365, priceUSD: 134.95,                tier: 'premium' },

  // VIP
  { id: 'fj-vip-30',   label: 'Premium VIP — 30 Days',  days: 30,  priceUSD: 29.95, wasUSD: 33.95, tier: 'vip' },
  { id: 'fj-vip-90',   label: 'Premium VIP — 90 Days',  days: 90,  priceUSD: 73.95,                 tier: 'vip' },
  { id: 'fj-vip-180',  label: 'Premium VIP — 180 Days', days: 180, priceUSD: 109.95,                tier: 'vip' },
  { id: 'fj-vip-365',  label: 'Premium VIP — 365 Days', days: 365, priceUSD: 169.95,                tier: 'vip' },
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

  // tier color helpers
  const tierColor = selected.tier === 'premium' ? PREMIUM : VIP;
  const tierChipText = selected.tier === 'premium' ? 'Premium' : 'Premium VIP';

  return (
    <div className="min-h-screen text-white" style={{
      backgroundImage: `linear-gradient(180deg, ${BG_BASE} 0%, #2f5272 45%, #1f3b55 100%)`
    }}>
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Only.Exchange — Home"
            prefetch={false}
          >
            <span
              className="inline-grid h-8 w-8 place-items-center rounded-xl
                        bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500
                        text-white ring-1 ring-white/20 shadow-sm
                        transition-transform group-hover:scale-105"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="hover:text-white">Plans</a>
            <a href="#features" onClick={e=>{e.preventDefault(); scrollToId('features')}} className="hover:text-white">Features</a>
            <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="hover:text-white">Checkout</a>
            <a href="#faq" onClick={e=>{e.preventDefault(); scrollToId('faq')}} className="hover:text-white">FAQ</a>
          </nav>
          <a
            href="#checkout"
            onClick={e=>{e.preventDefault(); scrollToId('checkout')}}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: tierColor, color: '#0a0f14' }}
          >
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 rounded-full ring-1 px-3 py-1 text-xs mb-6"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <Zap className="h-3.5 w-3.5"/> Best pricing • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              FileJoker <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${PREMIUM}, ${VIP})`}}>Premium Keys</span>
            </h1>
            <p className="mt-4 text-white/85 text-lg max-w-2xl">
              Buy <strong>Premium</strong> or <strong>Premium VIP</strong> with crypto and get your key <em>instantly</em> after confirmations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="px-5 py-3 rounded-2xl inline-flex items-center gap-2" style={{ backgroundColor: tierColor, color: '#0b1217' }}>
                View Plans
                <ArrowRight className="h-4 w-4"/>
              </a>
              <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Bitcoin className="h-5 w-5"/> Pay with Crypto
              </a>
            </div>

            
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-white/10" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-white/80 mt-2">Pick a tier — <span style={{ color: PREMIUM }}>Premium</span> or <span style={{ color: VIP }}>Premium VIP</span>. Instant delivery after confirmations.</p>

          {/* Tier legend */}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PREMIUM }} />
              Premium
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: VIP }} />
              Premium VIP
            </span>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => {
              const isPremium = p.tier === 'premium';
              const tint = isPremium ? PREMIUM : VIP;
              const active = selected.id === p.id;
              return (
                <motion.button
                  key={p.id}
                  onClick={()=> handleSelectPlan(p)}
                  whileHover={{scale:1.02}}
                  className={`text-left rounded-2xl border p-5 transition-colors`}
                  style={{
                    borderColor: active ? tint : 'rgba(255,255,255,0.12)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold" style={{ color: tint }}>{p.label}</div>
                    {active && <CheckCircle2 className="h-5 w-5" style={{ color: tint }}/>}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                    {p.wasUSD && <div className="text-white/60 line-through">${p.wasUSD.toFixed(2)}</div>}
                  </div>
                  <div className="mt-3 text-xs text-white/75">
                    {p.days} days of premium access
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 text-sm text-white/75">
            Selected: <span className="text-white font-medium">{selected.label}</span>
            <span className="ml-3 inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Tier:
              <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: tierColor, color: '#0b1217' }}>{tierChipText}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Features — FileJoker highlights */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">💎 Premium Plan Highlights</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Gauge className="h-5 w-5" />} title="Full-speed downloads" text="No throttling—premium bandwidth any time." />
            <Feature icon={<PlayCircle className="h-5 w-5" />} title="Direct links" text="Skip queues and redirections—start instantly." />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Ad-free" text="No ads or captchas while downloading." />
            <Feature icon={<Zap className="h-5 w-5" />} title="Parallel downloads" text="Download multiple files at the same time." />
            <Feature icon={<RefreshCw className="h-5 w-5" />} title="Resume support" text="Pause and resume large downloads anytime." />
            <Feature icon={<Mail className="h-5 w-5" />} title="Instant delivery" text="Key is emailed automatically after confirmations." />
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-24 border-t border-white/10" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">Checkout</h3>
                <p className="mt-2 text-white/80">Buy FileJoker.net {tierChipText} key direct to Email.</p>
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
                    className={`px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2`}
                    style={{
                      borderColor: active ? tierColor : 'rgba(255,255,255,0.12)',
                      background: active ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)'
                    }}
                  >
                    <Icon className="h-4 w-4"/>{m.label}
                    {active && <span className="ml-1 text-xs text-white/80">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Network picker */}
            {METHOD_NEEDS_CHAIN[method] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-white/80">Network:</span>
                {(CHAIN_OPTIONS[method] || []).map(c => {
                  const active = chain === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setChain(c); resetPayment(); }}
                      className="px-3 py-1.5 rounded-xl border text-sm"
                      style={{
                        borderColor: active ? tierColor : 'rgba(255,255,255,0.12)',
                        background: active ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)'
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
              {step !== 'pay' ? (
                // ====== PRE-GENERATE ======
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/80">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <div className="text-lg">{selected.label} — ${selected.priceUSD.toFixed(2)}</div>
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }} className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/80">Your Email (for key delivery)</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        placeholder="you@email.com"
                        disabled={emailLocked}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border outline-none text-lg"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          borderColor:
                            email.length === 0 ? 'rgba(255,255,255,0.12)'
                            : isEmailValid ? 'rgba(52,211,153,0.7)'
                            : 'rgba(248,113,113,0.7)'
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
                      className="w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg"
                      style={{
                        backgroundColor: (!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                          ? 'rgba(255,255,255,0.08)'
                          : tierColor,
                        color: (!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                          ? 'rgba(255,255,255,0.6)'
                          : '#0b1217',
                        cursor: (!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                          ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                      {generating ? 'Generating…' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ) : (
                // ====== DURING PAYMENT ======
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold flex items-center gap-2">
                    <QrCode className="h-5 w-5"/> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/80">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input
                          readOnly
                          value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl font-mono text-lg"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                        />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl" title="Copy amount" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/80">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl font-mono text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}/>
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl" title="Copy address" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
                          <Copy className="h-4 w-4"/>
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-white/80 mt-1">
                          Network: <span className="text-white">{chainLabel(chain)}</span>
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
                        className="mt-2 rounded-xl"
                        style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 35px rgba(94, 168, 220, 0.25)' }}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed grid place-items-center text-white/60" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-white/85 text-center">
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
                  <h4 className="text-2xl font-semibold">How it works</h4>
                  <ol className="space-y-3 text-white/85 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl grid place-items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Bitcoin className="h-4 w-4 opacity-90" />
                      </div>
                      <span>Select a FileJoker plan (Premium or VIP)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl grid place-items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Mail className="h-4 w-4 opacity-90" />
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl grid place-items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <ShieldCheck className="h-4 w-4 opacity-90" />
                      </div>
                      <span>Choose coin (and network for stables / ETH)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl grid place-items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <QrCode className="h-4 w-4 opacity-90" />
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl grid place-items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <TimerIcon className="h-4 w-4 opacity-90" />
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl grid place-items-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Rocket className="h-4 w-4 opacity-90" />
                      </div>
                      <span>Key emailed after <span className="text-white">2 confirmations</span></span>
                    </li>
                  </ol>

                  <div className="rounded-2xl p-4 text-xs text-white/80" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
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
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white/90"
                         style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <TimerIcon className="h-4 w-4" />
                      <span>Time left</span>
                      <span className="font-mono text-white">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <Badge>Buyer pays network fees</Badge>
                      <Badge>2 confirmations required</Badge>
                      <Badge>Instant Delivery</Badge>
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button onClick={resetPayment} className="w-full px-6 py-4 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}>
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
      <section id="faq" className="py-16 border-t border-white/10" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full" style={{ backgroundImage: `linear-gradient(90deg, ${PREMIUM}, ${VIP})` }} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: VIP, color: '#0b1217' }}
              >
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }}
              >
                <Zap className="h-4 w-4" />
                View FileJoker plans
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Main Q&A */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4 opacity-90" />How do I buy a FileJoker key?</span>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a <span style={{ color: PREMIUM }}>Premium</span> or <span style={{ color: VIP }}>Premium VIP</span> pack above.</li>
                      <li>Enter your email and select your coin/network.</li>
                      <li>Click <em>Generate</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 opacity-90" />What’s the difference between Premium & VIP?</span>}
                a={
                  <>
                    <div>Both are ad-free and full-speed. VIP is FileJoker’s higher tier with expanded allowances and priority. Choose based on your usage.</div>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 opacity-90" />When do I receive my key?</span>}
                a={
                  <>
                    <div>Instantly after required confirmations (usually minutes). Your key is sent to the email you enter at checkout.</div>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Coins className="h-4 w-4 opacity-90" />Which coins & networks are supported?</span>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain. ETH supports L2s (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 opacity-90" />I sent the wrong amount / network</span>}
                a={
                  <>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Underpaid:</strong> send the difference before the timer expires.</li>
                      <li><strong>Overpaid:</strong> <a href="/support" className="underline">Contact support</a> with your TX hash—we’ll reconcile.</li>
                      <li><strong>Wrong network:</strong> For USDT/USDC, the network must match. Not sure? <a href="/support" className="underline">Reach out</a> ASAP.</li>
                    </ul>
                  </>
                }
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 opacity-90" />Fees & confirmations</span>}
                a="Sender pays miner/validator fees. Keys are released after 2 confirmations."
              />

              <QA
                q={<span className="inline-flex items-center gap-2"><Rocket className="h-4 w-4 opacity-90" />How do I activate my FileJoker key?</span>}
                a={
                  <>
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <div className="text-sm font-semibold text-white/90">You’ll receive a Premium Key like:</div>
                      <div className="mt-1 inline-block rounded-md px-2 py-1 font-mono text-sm text-white/90" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        1220s5e5cbo381XXXXX
                      </div>
                    </div>

                    <ol className="mt-3 list-decimal list-inside space-y-1">
                      <li>Log in to your FileJoker account. <a href="https://filejoker.net/register" target="_blank" rel="noreferrer" className="underline">Register here</a> if needed.</li>
                      <li>Open the <a href="https://filejoker.net/premium" target="_blank" rel="noreferrer" className="underline">My Premium</a> page.</li>
                      <li>Find the <em>Apply Promo Code</em> field, paste your key, and activate.</li>
                    </ol>
                  </>
                }
              />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 opacity-90" />
                Quick links
              </div>

              <ul className="mt-3 space-y-2 text-sm">
                <li>✔️ <a href="#plans" className="underline">Compare Premium vs VIP</a></li>
                <li>✔️ <a href="#checkout" className="underline">Go to Checkout</a></li>
                <li>✔️ <a href="/support" className="underline">Payment issues (over/underpaid)</a></li>
                <li>✔️ <a href="/support" className="underline">Key not received / not working</a></li>
              </ul>

              <div className="mt-5 rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(30,180,170,0.12), rgba(92,152,202,0.12))', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="text-sm font-semibold">Still stuck?</div>
                <p className="text-white/75 text-sm mt-1">We can verify your transaction and resend keys if needed.</p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: PREMIUM, color: '#0b1217' }}
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
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg" style={{ backgroundImage: `linear-gradient(135deg, ${PREMIUM}, ${VIP})` }} />
              <span className="font-semibold text-white">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="/support">Support</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/refunds">Refunds</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/70 max-w-4xl">
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
      <div className="text-sm text-white/80">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl ${mono ? 'font-mono' : ''} text-lg`} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false, wrap=false }:{label:string; value:string; mono?:boolean; wrap?:boolean}){
  return (
    <div>
      <div className="text-xs text-white/75">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${wrap ? 'break-all' : ''} mt-1 text-white`}>{value}</div>
    </div>
  );
}
function Badge({ children }:{children: React.ReactNode}){
  return (
    <div className="rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-white/85"
         style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
      {children}
    </div>
  );
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="inline-flex items-center gap-2 text-white">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-white/80 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-open:rotate-90" />
      </summary>
      <div className="h-px w-full" style={{ backgroundImage: `linear-gradient(90deg, ${PREMIUM}66, ${VIP}4D, transparent)` }} />
      <div className="px-4 pb-4 pt-3 text-white/85 text-sm">
        {a}
      </div>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full"
           style={{ backgroundImage: `radial-gradient(800px 320px at 50% 10%, rgba(255,255,255,0.14), transparent)` }} />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full"
           style={{ backgroundImage: `radial-gradient(600px 260px at 70% 80%, ${VIP}22, transparent)` }} />
    </div>
  );
}
