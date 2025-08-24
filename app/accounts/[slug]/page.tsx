// app/accounts/[slug]/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight, Search, Flame, Rocket, ShieldCheck, Coins, Mail,
  QrCode, Copy, Loader2, Timer as TimerIcon, ArrowRight, AlertTriangle, Gauge, Zap
} from 'lucide-react';
import { ACCOUNTS } from '../../../data/accounts';

/** ───────────────────────────────────────────────────────────────────────────
 *  Shared crypto checkout bits (same pattern as filehost pages)
 *  ───────────────────────────────────────────────────────────────────────── */
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

const METHOD_NEEDS_CHAIN: Record<Method, boolean> = {
  BTC: false, ETH: true, SOL: false, BNB: false, LTC: false, USDT: true, USDC: true,
};
const CHAIN_OPTIONS: Record<Method, Chain[] | undefined> = {
  ETH:  ['ETH', 'BASE', 'ARBITRUM', 'OPTIMISM', 'POLYGON', 'ZKSYNC', 'LINEA', 'SCROLL'],
  USDT: ['ETH', 'SOL', 'BNB'],
  USDC: ['ETH', 'SOL', 'BNB'],
  BTC:  undefined, SOL: undefined, BNB: undefined, LTC: undefined,
};
const PRICE_URL = `/api/price?ids=${Object.values(COINGECKO_IDS).join(',')}`;

type Sku = { id: string; label: string; priceUSD: number; wasUSD?: number };
type Product = {
  slug: string;
  name: string;
  blurb?: string;
  monogram?: string;
  vibe?: { ring: string; chip: string; mono: string; glow: string };
  features?: string[];
  skus: Sku[];
};

export default function AccountProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const product: Product | undefined = useMemo(
    () => ACCOUNTS.find(a => a.slug.toLowerCase() === String(slug).toLowerCase()),
    [slug]
  );

  // Fallback if no product
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0b12] text-white">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-3xl font-bold mb-1">Not found</h1>
          <p className="text-white/70">We couldn’t find that account product.</p>
          <div className="mt-6">
            <Link href="/accounts" className="underline">Back to Accounts</Link>
          </div>
        </main>
      </div>
    );
  }

  // Colors (dark theme + product accent if you added vibe.mono)
  const ACCENT = '#8b5cf6';           // violet-500
  const ACCENT_DARK = '#6366f1';      // indigo-500
  const EDGE = 'rgba(255,255,255,0.10)';

  // UI state
  const [selected, setSelected]       = useState<Sku>(product.skus[0]);
  const [email, setEmail]             = useState('');
  const [emailLocked, setEmailLocked] = useState(false);

  const [method, setMethod] = useState<Method>('BTC');
  const [chain, setChain]   = useState<Chain | null>(null);

  const [pricesUSD, setPricesUSD] = useState<Record<Method, number | null>>({
    BTC: null, ETH: null, SOL: null, BNB: null, LTC: null, USDT: null, USDC: null
  });

  // Payment session
  const WINDOW_SECS = 30 * 60;
  const [address, setAddress]           = useState('');
  const [lockedAmount, setLockedAmount] = useState('');
  const [status, setStatus]             = useState('');
  const [step, setStep]                 = useState<'select'|'pay'|'done'>('select');
  const [generating, setGenerating]     = useState(false);

  // Timers
  const [paySecs, setPaySecs] = useState(WINDOW_SECS);
  const payTicker  = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Amount preview (stablecoins use USD direct)
  const amountPreview = useMemo(()=>{
    const usd = pricesUSD[method];
    if (method === 'USDT' || method === 'USDC') return selected.priceUSD.toFixed(2);
    if (!usd) return '';
    const amt = selected.priceUSD / usd;
    const truncated = Math.trunc(amt * 1e8) / 1e8;
    return truncated.toFixed(8);
  }, [pricesUSD, method, selected]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const methodNeedsLivePrice = (m: Method) => !(m === 'USDT' || m === 'USDC');

  // Deep link ?plan= (by sku.id or label)
  useEffect(() => {
    const q = searchParams?.get('plan');
    if (!q) return;
    const byId = product.skus.find(s => s.id.toLowerCase() === q.toLowerCase());
    const byLabel = product.skus.find(s => s.label.toLowerCase() === decodeURIComponent(q).toLowerCase());
    if (byId || byLabel) {
      resetPayment();
      setSelected(byId || byLabel!);
      setTimeout(() => {
        document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, product.slug]);

  // Countdown + scan loops
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

  // Start payment
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
      const addr = data?.address || demoAddress(method);

      setAddress(addr);
      setLockedAmount(amountPreview || '');
      setStep('pay');
      setEmailLocked(true);
      startPayCountdown();
      startScanLoop();
    }catch(e){
      console.error(e);
      setAddress(demoAddress(method));
      setLockedAmount(amountPreview || '');
      setStep('pay');
      setEmailLocked(true);
      startPayCountdown();
      startScanLoop();
    } finally{
      setGenerating(false);
    }
  }

  // Small helpers
  function fmtSecs(s: number){
    const m = Math.floor(s/60);
    const ss = s % 60;
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }
  function copy(v: string){ if (v) navigator.clipboard?.writeText(v).catch(()=>{}); }
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

  const METHODS: { id: Method; label: string; icon: JSX.Element }[] = [
    { id: 'BTC',  label: 'Bitcoin',  icon: <Coins className="h-4 w-4" /> },
    { id: 'ETH',  label: 'Ethereum', icon: <Zap className="h-4 w-4" /> },
    { id: 'SOL',  label: 'Solana',   icon: <Zap className="h-4 w-4" /> },
    { id: 'BNB',  label: 'BNB',      icon: <Zap className="h-4 w-4" /> },
    { id: 'LTC',  label: 'Litecoin', icon: <Zap className="h-4 w-4" /> },
    { id: 'USDT', label: 'USDT',     icon: <Zap className="h-4 w-4" /> },
    { id: 'USDC', label: 'USDC',     icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <Header />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs mb-6 text-white"
                 style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${EDGE}`, backdropFilter: 'blur(8px)' }}>
              Instant delivery • Live price lock
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {product.name}{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`}}>
                Accounts
              </span>
            </h1>
            {product.blurb && <p className="mt-4 text-white/70 text-lg max-w-2xl">{product.blurb}</p>}
          </motion.div>
        </div>
      </section>

      {/* SKUs */}
      <section id="plans" className="py-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold" style={{ color: 'white' }}>Choose your pack</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.skus.map((sku) => (
              <motion.button
                key={sku.id}
                onClick={()=>{ setSelected(sku); resetPayment(); document.getElementById('checkout')?.scrollIntoView({behavior:'smooth'}) }}
                whileHover={{scale:1.02}}
                className="text-left rounded-2xl border bg-white/5 p-5"
                style={{
                  borderColor: EDGE,
                  boxShadow: selected.id===sku.id
                    ? `0 0 0 2px ${ACCENT} inset, 0 8px 24px rgba(99,102,241,0.25)`
                    : '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div className="text-sm text-white/70">{product.name}</div>
                <div className="mt-1 text-lg font-semibold">{sku.label}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold">${sku.priceUSD.toFixed(2)}</div>
                  {sku.wasUSD && <div className="text-white/50 line-through">${sku.wasUSD.toFixed(2)}</div>}
                </div>
              </motion.button>
            ))}
          </div>
          <div className="mt-4 text-sm text-white/70">
            Selected: <span className="text-white font-medium">{selected.label}</span>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Left: form or payment */}
            {step !== 'pay' ? (
              <div className="flex-1 space-y-4">
                <h3 className="text-4xl font-extrabold">Checkout</h3>

                {/* Email */}
                <div>
                  <div className="text-sm text-white/70">Your Email (for delivery)</div>
                  <input
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="you@email.com"
                    disabled={emailLocked}
                    className="mt-1 w-full px-4 py-3 rounded-xl bg-white/10 border outline-none text-lg"
                    style={{
                      borderColor:
                        email.length === 0
                          ? EDGE
                          : isEmailValid ? 'rgba(124,203,90,0.65)' : 'rgba(239,68,68,0.5)'
                    }}
                  />
                </div>

                {/* Methods */}
                <div>
                  <div className="text-sm text-white/70 mb-2">Pay with</div>
                  <div className="flex flex-wrap gap-2">
                    {METHODS.map(m=>{
                      const active = method === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={()=>{
                            if (method!==m.id){
                              resetPayment();
                              setMethod(m.id);
                              setChain(null);
                            }
                          }}
                          className="px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2"
                          style={{
                            borderColor: active ? ACCENT : EDGE,
                            background: active ? `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)',
                            color: active ? '#fff' : 'inherit'
                          }}
                        >
                          {m.icon}{m.label}
                          {active && <span className="ml-1 text-xs opacity-90">(selected)</span>}
                        </button>
                      );
                    })}
                  </div>

                  {METHOD_NEEDS_CHAIN[method] && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-white/70">Network:</span>
                      {(CHAIN_OPTIONS[method] || []).map(c => {
                        const active = chain === c;
                        return (
                          <button
                            key={c}
                            onClick={() => { setChain(c); resetPayment(); }}
                            className="px-3 py-1.5 rounded-xl border text-sm"
                            style={{
                              borderColor: active ? ACCENT : EDGE,
                              background: active ? `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)',
                              color: active ? '#fff' : 'inherit'
                            }}
                          >
                            {chainLabel(c)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Stat label="Product" value={`${product.name} — ${selected.label}`} />
                  <Stat label="Total (USD)" value={`$${selected.priceUSD.toFixed(2)}`} mono />
                  <Stat label={`Amount (${method})`} value={amountPreview || '—'} mono />
                </div>

                <button
                  onClick={startPayment}
                  disabled={
                    !isEmailValid ||
                    (methodNeedsLivePrice(method) && !pricesUSD[method]) ||
                    (METHOD_NEEDS_CHAIN[method] && !chain) ||
                    generating
                  }
                  className="w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                  {generating ? 'Generating…' : 'Buy Now'}
                </button>

                {!!status && <p className="text-sm text-white/70">{status}</p>}
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                <h4 className="text-2xl font-semibold flex items-center gap-2">
                  <QrCode className="h-5 w-5"/> Payment Details
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/70">Amount ({method})</div>
                    <div className="mt-1 flex gap-2">
                      <input
                        readOnly
                        value={lockedAmount}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border font-mono text-lg"
                        style={{ borderColor: EDGE }}
                      />
                      <button onClick={()=>copy(lockedAmount)} className="px-3 rounded-xl border" style={{ borderColor: EDGE }} title="Copy amount">
                        <Copy className="h-4 w-4"/>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/70">Payment Address</div>
                    <div className="mt-1 flex gap-2">
                      <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/10 border font-mono text-sm" style={{ borderColor: EDGE }}/>
                      <button onClick={()=>copy(address)} className="px-3 rounded-xl border" style={{ borderColor: EDGE }} title="Copy address">
                        <Copy className="h-4 w-4"/>
                      </button>
                    </div>
                    {METHOD_NEEDS_CHAIN[method] && chain && (
                      <div className="text-xs mt-1 text-white/70">
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
                      className="mt-2 rounded-xl border"
                      style={{ borderColor: EDGE, boxShadow: '0 0 35px rgba(99,102,241,0.22)' }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const uri = paymentURI();
                        (e.currentTarget as HTMLImageElement).src =
                          `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                      }}
                    />
                  ) : (
                    <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed grid place-items-center text-white/40"
                         style={{ borderColor: EDGE }}>
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

                <div className="mt-6 space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white"
                       style={{ background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})` }}>
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
                    style={{ borderColor: EDGE, background: 'rgba(255,255,255,0.06)' }}
                  >
                    Cancel / Start Over
                  </button>
                </div>
              </div>
            )}

            {/* Right: How it works / FAQ */}
            <aside className="w-full md:w-[380px] space-y-5">
              <div className="rounded-2xl border bg-white/5 p-5" style={{ borderColor: EDGE }}>
                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  How it works
                </div>
                <ol className="mt-3 space-y-2 text-sm text-white/80">
                  <li>1) Pick a pack above.</li>
                  <li>2) Enter your email for delivery.</li>
                  <li>3) Choose coin (and network if needed).</li>
                  <li>4) Generate to lock price & get your address.</li>
                  <li>5) Send the exact amount within 30:00.</li>
                  <li>6) Key emailed after confirmations.</li>
                </ol>
              </div>

              <details className="group rounded-2xl border bg-white/5" style={{ borderColor: EDGE }}>
                <summary className="cursor-pointer list-none flex items-center justify-between p-4">
                  <span className="inline-flex items-center gap-2 text-sm"><Coins className="h-4 w-4"/> Coins & Networks</span>
                  <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-sm text-white/80">
                  BTC, ETH, SOL, BNB, LTC, USDT, USDC supported. USDT/USDC allow Ethereum, BNB, or Solana. ETH supports Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll.
                </div>
              </details>

              <details className="group rounded-2xl border bg-white/5" style={{ borderColor: EDGE }}>
                <summary className="cursor-pointer list-none flex items-center justify-between p-4">
                  <span className="inline-flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4"/> Common issues</span>
                  <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-sm text-white/80">
                  Underpaid? Send the difference before the timer ends. Overpaid? Contact support with your TX hash. Wrong network? For USDT/USDC, network must match.
                </div>
              </details>

              <div className="rounded-2xl border bg-white/5 p-5" style={{ borderColor: EDGE }}>
                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4" />
                  Need help?
                </div>
                <p className="text-sm text-white/80 mt-2">
                  We can verify your transaction and re-send keys if needed.
                </p>
                <Link
                  href="/support"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})` }}
                >
                  <Mail className="h-4 w-4" />
                  Contact support
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg" style={{ background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT_DARK})` }} />
              <span className="font-semibold text-white">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/accounts">Accounts</Link>
              <Link href="/filehost">Filehosts</Link>
              <Link href="/support">Support</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refunds">Refunds</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/60 max-w-4xl">
            © 2025 Only.Exchange • All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── small presentational helpers ───────────────────────────────────────── */
function Header(){
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
          <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
            <ArrowLeftRight className="h-4 w-4" />
          </span>
          <span className="font-semibold group-hover:text-white">Only.Exchange</span>
        </Link>
        <Link
          href="#checkout"
          onClick={(e)=>{e.preventDefault(); document.getElementById('checkout')?.scrollIntoView({behavior:'smooth'})}}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
          style={{ background: 'linear-gradient(180deg, #8b5cf6, #6366f1)' }}
        >
          <Coins className="h-4 w-4"/> Pay with Crypto
        </Link>
      </div>
    </header>
  );
}
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-white/70">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/10 border text-lg ${mono ? 'font-mono' : ''}`}
           style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
        {value}
      </div>
    </div>
  );
}
function Badge({ children }:{ children: React.ReactNode }){
  return (
    <div className="rounded-xl px-3 py-2 flex items-center justify-center border bg-white/10"
         style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
      <ShieldCheck className="h-4 w-4 mr-2" />
      <span className="text-xs text-white/80">{children}</span>
    </div>
  );
}
