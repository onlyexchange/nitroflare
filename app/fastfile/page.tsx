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
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ListChecks,
  Clock3,
  Ban,
  ArrowLeftRight,
  Star,
} from 'lucide-react';

/** ====== COINS / PRICES (shared shape) ====== */
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
const ALL_IDS = Object.values(COINGECKO_IDS);
const PRICE_URL = `/api/price?ids=${ALL_IDS.join(',')}`;

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
  ETH: ['ETH','BASE','ARBITRUM','OPTIMISM','POLYGON','ZKSYNC','LINEA','SCROLL'],
  USDT: ['ETH','SOL','BNB'],
  USDC: ['ETH','SOL','BNB'],
  BTC: undefined, SOL: undefined, BNB: undefined, LTC: undefined,
};

type Plan = {
  id: string;
  label: string;
  days: number;
  priceUSD: number;
  wasUSD?: number;
  bandwidth?: string;
};

const PLANS: Plan[] = [
  { id: 'ff-30',  label: '30 Days',  days: 30,  priceUSD: 11.95, wasUSD: 19.95, bandwidth: '150 GB/day' },
  { id: 'ff-90',  label: '90 Days',  days: 90,  priceUSD: 42.95,               bandwidth: '150 GB/day' },
  { id: 'ff-180', label: '180 Days', days: 180, priceUSD: 65.95,               bandwidth: '150 GB/day' },
  { id: 'ff-365', label: '365 Days', days: 365, priceUSD: 95.95,               bandwidth: '150 GB/day' },
];

export default function FastFilePage() {
  const [selected, setSelected] = useState<Plan>(PLANS[0]); 
  const [email, setEmail] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);

  const [method, setMethod] = useState<Method>('BTC');
  const [chain, setChain] = useState<Chain | null>(null);

  const [pricesUSD, setPricesUSD] = useState<Record<Method, number | null>>({
    BTC: null, ETH: null, SOL: null, BNB: null, LTC: null, USDT: null, USDC: null,
  });

  // Session
  const [address, setAddress] = useState('');
  const [lockedAmount, setLockedAmount] = useState('');
  const [status, setStatus] = useState('');
  const [step, setStep] = useState<'select' | 'pay' | 'done'>('select');

  // timers
  const WINDOW_SECS = 30 * 60;
  const [paySecs, setPaySecs] = useState(WINDOW_SECS);
  const payTicker = useRef<ReturnType<typeof setInterval> | null>(null);
  const [generating, setGenerating] = useState(false);

  const scanMessages = [
    'Generating your address…',
    'Watching mempool…',
    'Matching payment…',
    '0/2 confirmations…',
    'Still scanning…',
  ];
  const scanTicker = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scanIdx, setScanIdx] = useState(0);

  // deep link ?plan=
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams?.get('plan');
    if (!q) return;
    const byId = PLANS.find((p) => p.id.toLowerCase() === q.toLowerCase());
    const byLabel = PLANS.find((p) => p.label.toLowerCase() === decodeURIComponent(q).toLowerCase());
    const target = byId || byLabel;
    if (target) {
      resetPayment();
      setSelected(target);
      setTimeout(() => document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch prices
  useEffect(() => {
    let active = true;
    async function fetchPrices() {
      try {
        const res = await fetch(PRICE_URL, { cache: 'no-store' });
        const data = await res.json();
        const map: Record<Method, number | null> = {
          BTC: data?.bitcoin?.usd ?? null,
          ETH: data?.ethereum?.usd ?? null,
          SOL: data?.solana?.usd ?? null,
          BNB: data?.binancecoin?.usd ?? null,
          LTC: data?.litecoin?.usd ?? null,
          USDT: data?.tether?.usd ?? null,
          USDC: data?.['usd-coin']?.usd ?? null,
        };
        if (active) setPricesUSD(map);
      } catch (e) {
        console.error(e);
      }
    }
    fetchPrices();
    const i = setInterval(fetchPrices, 60_000);
    return () => { active = false; clearInterval(i); };
  }, []);

  const methodNeedsLivePrice = (m: Method) => !(m === 'USDT' || m === 'USDC');

  // amount preview
  const previewAmount = useMemo(() => {
    const usd = pricesUSD[method];
    if (method === 'USDT' || method === 'USDC') return selected.priceUSD.toFixed(2);
    if (!usd) return '';
    const amt = selected.priceUSD / usd;
    const truncated = Math.trunc(amt * 1e8) / 1e8;
    return truncated.toFixed(8);
  }, [pricesUSD, method, selected]);

  // helpers
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  function fmtSecs(s: number) {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }
  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // countdowns
  function startPayCountdown() {
    stopPayCountdown();
    setPaySecs(WINDOW_SECS);
    payTicker.current = setInterval(() => {
      setPaySecs((prev) => {
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
  function stopPayCountdown() {
    if (payTicker.current) clearInterval(payTicker.current);
    payTicker.current = null;
  }
  function startScanLoop() {
    stopScanLoop();
    setScanIdx(0);
    setStatus(scanMessages[0]);
    scanTicker.current = setInterval(() => {
      setScanIdx((prev) => {
        const next = (prev + 1) % scanMessages.length;
        setStatus(scanMessages[next]);
        return next;
      });
    }, 1600);
  }
  function stopScanLoop() {
    if (scanTicker.current) clearInterval(scanTicker.current);
    scanTicker.current = null;
  }
  useEffect(() => () => { stopPayCountdown(); stopScanLoop(); }, []);

  // payment uri + QR
  function paymentURI() {
    if (!address) return '';
    if (method === 'BTC') return `bitcoin:${address}${lockedAmount ? `?amount=${lockedAmount}` : ''}`;
    if (method === 'LTC') return `litecoin:${address}`;
    return address; // raw for ETH/SOL/BNB/USDT/USDC
  }
  function qrURL() {
    const uri = paymentURI();
    if (!uri) return '';
    return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(uri)}`;
  }
  function copy(v: string) { if (v) navigator.clipboard?.writeText(v).catch(() => {}); }

  // address endpoints + demo
  function computeEndpoint(m: Method, c: Chain | null) {
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
  function demoAddress(m: Method) {
    switch (m) {
      case 'BTC': return 'bc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      case 'ETH': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
      case 'SOL': return 'So11111111111111111111111111111111111111112';
      case 'BNB': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
      case 'LTC': return 'ltc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxx';
      case 'USDT':
      case 'USDC': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
    }
  }

  function resetPayment() {
    stopPayCountdown();
    stopScanLoop();
    setAddress('');
    setLockedAmount('');
    setStatus('');
    setStep('select');
    setPaySecs(WINDOW_SECS);
    setEmailLocked(false);
  }
  function handleSelectPlan(p: Plan) {
    setSelected(p);
    resetPayment();
    scrollToId('checkout');
  }
  async function startPayment() {
    if (!isEmailValid) { setStatus('Enter a valid email to continue.'); return; }
    if (METHOD_NEEDS_CHAIN[method] && !chain) { setStatus('Select a network to continue.'); return; }
    if (methodNeedsLivePrice(method) && !pricesUSD[method]) { setStatus('Could not fetch live price. Please try again.'); return; }

    setGenerating(true);
    setStatus('Generating your unique address…');
    try {
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
    } catch {
      setAddress(demoAddress(method));
      setLockedAmount(previewAmount || '');
      setStep('pay');
      setEmailLocked(true);
      startPayCountdown();
      startScanLoop();
    } finally {
      setGenerating(false);
    }
  }

  /** ====== BRAND STYLES (FastFile) ====== */
  const brandPrimary = '#4692C3'; // rgb(70,146,195)
  const brandChip = `bg-gradient-to-r from-[${brandPrimary}] via-sky-400 to-[${brandPrimary}]`;
  const brandAccentLine = `from-[${brandPrimary}]/40 via-sky-400/30 to-[${brandPrimary}]/40`;

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
            <span className={`inline-grid h-8 w-8 place-items-center rounded-xl text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105 ${brandChip}`}>
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#plans" onClick={(e)=>{e.preventDefault(); scrollToId('plans');}} className="hover:text-white">Plans</a>
            <a href="#features" onClick={(e)=>{e.preventDefault(); scrollToId('features');}} className="hover:text-white">Features</a>
            <a href="#checkout" onClick={(e)=>{e.preventDefault(); scrollToId('checkout');}} className="hover:text-white">Checkout</a>
            <a href="#faq" onClick={(e)=>{e.preventDefault(); scrollToId('faq');}} className="hover:text-white">FAQ</a>
          </nav>
          <a href="#checkout" onClick={(e)=>{e.preventDefault(); scrollToId('checkout');}} className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl ${brandChip}`}>
            <Bitcoin className="h-4 w-4" /> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-6">
              <Zap className="h-3.5 w-3.5" />
              Instant email delivery • Price lock • Unique address
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              FastFile <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4692C3] via-sky-400 to-[#4692C3]">Premium Keys</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-2xl">
              Buy with crypto and get your FastFile premium key right after confirmations.
              150&nbsp;GB/day • No delays • No captchas • No ads.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" onClick={(e)=>{e.preventDefault(); scrollToId('plans');}} className={`px-5 py-3 rounded-2xl inline-flex items-center gap-2 hover:opacity-95 ${brandChip}`}>
                <Download className="h-5 w-5" /> View Plans
              </a>
              <a href="#checkout" onClick={(e)=>{e.preventDefault(); scrollToId('checkout');}} className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2">
                <Bitcoin className="h-5 w-5" /> Pay with Crypto
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-white/70 mt-2">150 GB/day • Keys are sent instantly after 2 confirmations.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => {
              const isBest = p.id === 'ff-30';
              return (
                <motion.button
                  key={p.id}
                  onClick={() => handleSelectPlan(p)}
                  whileHover={{ scale: 1.02 }}
                  className={`relative text-left rounded-2xl border ${selected.id === p.id ? 'border-sky-400/70' : 'border-white/10'} bg-gradient-to-br from-white/10 to-transparent p-5`}
                >
                  {isBest && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold bg-[#4692C3] text-black">
                      <Star className="h-3 w-3" /> Best Value
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold">{p.label}</div>
                    {selected.id === p.id && <CheckCircle2 className="h-5 w-5 text-sky-400" />}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                    {typeof p.wasUSD === 'number' && (
                      <div className="text-white/50 line-through">${p.wasUSD.toFixed(2)}</div>
                    )}
                  </div>
                  {p.bandwidth && <div className="mt-3 text-xs text-white/70">{p.bandwidth}</div>}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 text-sm text-white/70">Selected: <span className="text-white font-medium">{selected.label}</span></div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">💎 Premium Features</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<Download className="h-5 w-5" />} title="150 GB/day" text="Generous daily volume for heavy downloads." />
            <Feature icon={<ListChecks className="h-5 w-5" />} title="Accelerators supported" text="Use your favorite download manager at full tilt." />
            <Feature icon={<Clock3 className="h-5 w-5" />} title="Resume support" text="Pause and pick up right where you left off." />
            <Feature icon={<Ban className="h-5 w-5" />} title="No delays or captchas" text="Skip queues and captchas entirely." />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="No ads" text="A clean, distraction-free experience." />
            <Feature icon={<Mail className="h-5 w-5" />} title="Instant delivery" text="Key is emailed right after confirmations." />
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-24 border-t border-white/10 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">Checkout</h3>
                <p className="mt-2 text-white/70">Buy FastFile.cc Premium Key — instant email delivery.</p>
              </div>
            </div>

            {/* Method selector */}
            <div className="mt-8 flex flex-wrap gap-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === (m.id as Method);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (method !== m.id) {
                        resetPayment();
                        setMethod(m.id as Method);
                        setChain(null);
                      }
                    }}
                    className={`px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2 ${
                      active ? 'border-sky-400/70 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />{m.label}
                    {active && <span className="ml-1 text-xs text-white/60">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Network picker */}
            {METHOD_NEEDS_CHAIN[method] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-white/70">Network:</span>
                {(CHAIN_OPTIONS[method] || []).map((c) => {
                  const active = chain === c;
                  return (
                    <button
                      key={c}
                      onClick={() => { setChain(c); resetPayment(); }}
                      className={`px-3 py-1.5 rounded-xl border text-sm ${
                        active ? 'border-sky-400/70 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                      }`}
                    >
                      {chainLabel(c)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Two columns */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              {/* LEFT: before payment */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/70">Selected Plan</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-lg">
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }} className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/15 hover:border-white/30">
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/70">Your Email (for key delivery)</div>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        placeholder="you@email.com"
                        disabled={emailLocked}
                        className={`flex-1 px-4 py-3 rounded-xl bg-white/5 border outline-none text-lg ${
                          email.length === 0 ? 'border-white/10' : isEmailValid ? 'border-sky-400/70' : 'border-red-400/60'
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
                      className={`w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg ${
                        (!isEmailValid || (methodNeedsLivePrice(method) && !pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method] && !chain) || generating)
                          ? 'bg-white/10 text-white/50 cursor-not-allowed'
                          : `shadow-[0_0_25px_rgba(70,146,195,0.35)] ${brandChip}`
                      }`}
                    >
                      {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                      {generating ? 'Generating…' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              ) : (
                // LEFT: during payment
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold flex items-center gap-2">
                    <QrCode className="h-5 w-5" /> Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/70">Amount ({method})</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={lockedAmount} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-lg" />
                        <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border border-white/10 hover:border-white/20" title="Copy amount">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/70">Payment Address</div>
                      <div className="mt-1 flex gap-2">
                        <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm" />
                        <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-white/10 hover:border-white/20" title="Copy address">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-white/60 mt-1">
                          Network: <span className="text-white/80">{chainLabel(chain)}</span>
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
                        className="mt-2 rounded-xl border border-white/10 shadow-[0_0_35px_rgba(70,146,195,0.25)]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-white/10 grid place-items-center text-white/40">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-white/80 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT */}
              {step !== 'pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold">How it works</h4>
                  <ol className="space-y-3 text-white/80 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                        <Coins className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Select a FastFile Premium plan</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                        <Mail className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Enter your email for delivery</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                        <ShieldCheck className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Choose coin (and network for ETH / USDT / USDC)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                        <QrCode className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Generate to lock price &amp; get your address</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                        <TimerIcon className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Send the exact amount within 30:00</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                        <Rocket className="h-4 w-4 opacity-80" />
                      </div>
                      <span>Key emailed after <span className="text-white/90">2 confirmations</span></span>
                    </li>
                  </ol>

                  {/* Activation help */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="font-semibold">Activate your FastFile Key</div>
                    <div className="mt-2 text-white/80">
                      You’ll receive a key like: <span className="font-mono bg-black/30 px-2 py-0.5 rounded-md">3XD3-GUEL-XUPJ-H61G</span>
                    </div>
                    <ol className="mt-2 list-decimal list-inside text-white/70 space-y-1">
                      <li>Log in at <a href="https://fastfile.cc" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20">fastfile.cc</a></li>
                      <li>Open <a href="https://fastfile.cc/?op=my_account" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20">My Account</a></li>
                      <li>Paste your Premium Key into <em>Premium Key</em> and click <strong>Apply</strong></li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-2xl font-semibold">Order Summary</h5>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <Summary label="Pack" value={selected.label} />
                    <Summary label="USD Total" value={`$${selected.priceUSD.toFixed(2)}`} mono />
                    <Summary label="Asset" value={method} />
                    {METHOD_NEEDS_CHAIN[method] && chain && <Summary label="Network" value={chainLabel(chain)} />}
                    <Summary label="Amount" value={lockedAmount} mono />
                    <Summary label="Email" value={email} />
                  </div>

                  <div className="mt-6 space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-white/80">
                      <TimerIcon className="h-4 w-4" />
                      <span>Time left</span>
                      <span className="font-mono text-white">{fmtSecs(paySecs)}</span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-center gap-2 text-white/70">
                        <ShieldCheck className="h-4 w-4 opacity-80" />
                        Buyer pays network fees
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-center gap-2 text-white/70">
                        <ShieldCheck className="h-4 w-4 opacity-80" />
                        2 confirmations required
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-center gap-2 text-white/70">
                        <Mail className="h-4 w-4 opacity-80" />
                        Instant Delivery
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button onClick={resetPayment} className="w-full px-6 py-4 rounded-2xl border border-white/15 hover:border-white/30">
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
      <section id="faq" className="py-16 border-t border-white/10 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              FAQ
              <span className={`ml-3 inline-block align-middle h-2 w-24 rounded-full bg-gradient-to-r from-[${brandPrimary}]/70 via-sky-400/60 to-[${brandPrimary}]/70`} />
            </h2>

            <div className="flex flex-wrap gap-2">
              <a href="/support" className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white ${brandChip} hover:opacity-95`}>
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a href="#plans" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:border-white/30">
                <Zap className="h-4 w-4" />
                View FastFile plans
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA
                q={<span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4 opacity-90" />How do I buy a FastFile key?</span>}
                a={
                  <>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Choose a pack & enter your email.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Generate</em> to lock price & get your address.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>
                    <p className="mt-2 text-white/70 text-xs">Need a hand? <a href="/support" className="underline decoration-white/20">Contact support</a>.</p>
                  </>
                }
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><Coins className="h-4 w-4 opacity-90" />Which coins & networks are supported?</span>}
                a={
                  <>
                    <div>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC.</div>
                    <div className="mt-1">USDT/USDC networks: Ethereum, Solana, BNB Smart Chain.</div>
                    <div className="mt-1 text-white/80">ETH supports L2 (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</div>
                  </>
                }
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><TimerIcon className="h-4 w-4 opacity-90" />When do I get my key?</span>}
                a="Instantly after required confirmations (usually minutes). Your key is sent to the email you entered at checkout."
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 opacity-90" />Can I change my pack or email?</span>}
                a="During payment, email is temporarily locked. Click Cancel / Start Over to update details, then Generate again."
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 opacity-90" />Sent wrong amount or network?</span>}
                a={
                  <>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Underpaid:</strong> send the difference to the same address before the timer expires.</li>
                      <li><strong>Overpaid:</strong> <a href="/support" className="underline decoration-white/20">Contact support</a> with your TX hash — we’ll reconcile.</li>
                      <li><strong>Wrong network:</strong> For USDT/USDC, network must match. Unsure? <a href="/support" className="underline decoration-white/20">Reach out</a> ASAP.</li>
                    </ul>
                  </>
                }
              />
              <QA
                q={<span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 opacity-90" />Didn’t receive my key?</span>}
                a={
                  <>
                    <div>Check spam/junk first.</div>
                    <div className="mt-1">Still missing? <a href="/support" className="underline decoration-white/20">Open a ticket</a> with your order email and TX hash.</div>
                  </>
                }
              />
            </div>

            {/* Activation quick steps */}
            <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 opacity-90" />
                Activate FastFile
              </div>
              <div className="mt-3 text-sm">
                You’ll receive a key like: <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">3XD3-GUEL-XUPJ-H61G</span>
              </div>
              <ol className="mt-3 space-y-2 text-sm list-decimal list-inside text-white/80">
                <li>
                  Log in to <a href="https://fastfile.cc" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20">fastfile.cc</a>
                </li>
                <li>
                  Open <a href="https://fastfile.cc/?op=my_account" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20">My Account</a>
                </li>
                <li>Paste your Premium Key and click <strong>Apply</strong></li>
              </ol>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-6 w-6 rounded-lg ${brandChip}`} />
              <span className="font-semibold text-white">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="/support">Support</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/refunds">Refunds</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/60 max-w-4xl">
            © 2025 Only.Exchange | All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ====== PRESENTATIONAL HELPERS ====== */
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}) {
  return (
    <div>
      <div className="text-sm text-white/70">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 ${mono ? 'font-mono' : ''} text-lg`}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false }:{label:string; value:string; mono?:boolean}) {
  return (
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} mt-1 text-white/90`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="inline-flex items-center gap-2 text-white">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-white/70 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm hover:border-white/20 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
      </summary>
      <div className="h-px w-full bg-gradient-to-r from-[#4692C3]/40 via-sky-400/30 to-[#4692C3]/40" />
      <div className="px-4 pb-4 pt-3 text-white/80 text-sm">{a}</div>
    </details>
  );
}
function BG() {
  // blue swirls for FastFile
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-gradient-to-br from-[#4692C3]/25 via-sky-400/15 to-[#4692C3]/25 blur-3xl" />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-sky-400/15 via-[#4692C3]/10 to-sky-500/15 blur-3xl" />
    </div>
  );
}
