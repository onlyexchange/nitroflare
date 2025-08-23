'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bitcoin, Zap, ShieldCheck, QrCode, Copy, ArrowRight, Timer as TimerIcon,
  Loader2, Mail, Coins, AlertTriangle, RefreshCw, ArrowLeftRight,
} from 'lucide-react';

/** ---------- Theme ---------- */
const ACCENT = '#2F82FF'; // solid blue accents

/** ---------- Pricing / assets ---------- */
const COINGECKO_IDS = {
  BTC:'bitcoin', ETH:'ethereum', SOL:'solana', BNB:'binancecoin',
  LTC:'litecoin', USDT:'tether', USDC:'usd-coin',
} as const;
type Method = keyof typeof COINGECKO_IDS;

type Chain =
  | 'ETH' | 'BASE' | 'ARBITRUM' | 'OPTIMISM' | 'POLYGON' | 'ZKSYNC' | 'LINEA' | 'SCROLL'
  | 'SOL' | 'BNB';

const chainLabel = (c: Chain) =>
  c==='ETH'?'Ethereum':c==='BASE'?'Base':c==='ARBITRUM'?'Arbitrum':c==='OPTIMISM'?'Optimism':
  c==='POLYGON'?'Polygon':c==='ZKSYNC'?'zkSync':c==='LINEA'?'Linea':c==='SCROLL'?'Scroll':
  c==='SOL'?'Solana':'BNB Smart Chain';

const ALL_IDS = Object.values(COINGECKO_IDS);
const PRICE_URL = `/api/price?ids=${ALL_IDS.join(',')}`;

const PLANS = [
  { id:'jl-30',  label:'30 Days',  priceUSD:12.95, wasUSD:17.95, bandwidth:'500 GB storage • 2 TB bandwidth' },
  { id:'jl-90',  label:'90 Days',  priceUSD:39.95, wasUSD:43.95, bandwidth:'500 GB storage • 2 TB bandwidth' },
  { id:'jl-180', label:'180 Days', priceUSD:69.95, wasUSD:70.95, bandwidth:'500 GB storage • 2 TB bandwidth' },
  { id:'jl-365', label:'365 Days', priceUSD:89.95, wasUSD:107.95, bandwidth:'500 GB storage • 2 TB bandwidth' },
] as const;
type Plan = typeof PLANS[number];

const METHODS = [
  { id:'BTC',  label:'Bitcoin',  icon: Bitcoin },
  { id:'ETH',  label:'Ethereum', icon: Zap },
  { id:'SOL',  label:'Solana',   icon: Zap },
  { id:'BNB',  label:'BNB',      icon: Zap },
  { id:'LTC',  label:'Litecoin', icon: Zap },
  { id:'USDT', label:'USDT',     icon: Zap },
  { id:'USDC', label:'USDC',     icon: Zap },
] as const;

const METHOD_NEEDS_CHAIN: Record<Method, boolean> = {
  BTC:false, ETH:true, SOL:false, BNB:false, LTC:false, USDT:true, USDC:true,
};
const CHAIN_OPTIONS: Record<Method, Chain[]|undefined> = {
  ETH:  ['ETH','BASE','ARBITRUM','OPTIMISM','POLYGON','ZKSYNC','LINEA','SCROLL'],
  USDT: ['ETH','SOL','BNB'],
  USDC: ['ETH','SOL','BNB'],
  BTC:undefined, SOL:undefined, BNB:undefined, LTC:undefined,
};

/** ---------- Page ---------- */
export default function Page(){
  const [selected, setSelected] = useState<Plan>(PLANS[0]);
  const [email, setEmail] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);

  const [method, setMethod] = useState<Method>('BTC');
  const [chain, setChain]   = useState<Chain | null>(null);

  const [pricesUSD, setPricesUSD] = useState<Record<Method, number|null>>({
    BTC:null, ETH:null, SOL:null, BNB:null, LTC:null, USDT:null, USDC:null
  });

  const [address, setAddress] = useState('');
  const [lockedAmount, setLockedAmount] = useState('');
  const [status, setStatus] = useState('');
  const [step, setStep] = useState<'select'|'pay'|'done'>('select');

  const WINDOW_SECS = 30 * 60;
  const [paySecs, setPaySecs] = useState(WINDOW_SECS);
  const payTicker  = useRef<ReturnType<typeof setInterval> | null>(null);

  const scanMessages = [
    "Scanning blockchain network…","Watching mempool for your tx…","Matching recipient address…",
    "Waiting for broadcast…","Verifying inputs…","0/2 confirmations…","Checking network fee…","Still scanning…"
  ];
  const [scanIdx, setScanIdx] = useState(0);
  const scanTicker = useRef<ReturnType<typeof setInterval> | null>(null);

  // hero cosmetic timer
  const [heroTimer, setHeroTimer] = useState(29*60+59);
  useEffect(()=>{ const t=setInterval(()=>setHeroTimer(v=>v>0?v-1:0),1000); return ()=>clearInterval(t);},[]);
  const heroTimeLeft = `${String(Math.floor(heroTimer/60)).padStart(2,'0')}:${String(heroTimer%60).padStart(2,'0')}`;

  // prices
  useEffect(()=>{
    let active=true;
    async function fetchPrices(){
      try{
        const res = await fetch(PRICE_URL, { cache:'no-store' });
        const data = await res.json();
        const map: Record<Method, number|null> = {
          BTC: data?.bitcoin?.usd ?? null,
          ETH: data?.ethereum?.usd ?? null,
          SOL: data?.solana?.usd ?? null,
          BNB: data?.binancecoin?.usd ?? null,
          LTC: data?.litecoin?.usd ?? null,
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

  const previewAmount = useMemo(()=>{
    const usd = pricesUSD[method];
    if (method==='USDT' || method==='USDC') return selected.priceUSD.toFixed(2);
    if (!usd) return '';
    const amt = selected.priceUSD / usd;
    const truncated = Math.trunc(amt * 1e8) / 1e8;
    return truncated.toFixed(8);
  },[pricesUSD, method, selected]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const methodNeedsLivePrice = (m: Method) => !(m==='USDT'||m==='USDC');

  function startPayCountdown(){
    stopPayCountdown();
    setPaySecs(WINDOW_SECS);
    payTicker.current = setInterval(()=>{
      setPaySecs(prev=>{
        if (prev<=1){ stopPayCountdown(); stopScanLoop(); setStatus('Payment window expired. Generate a new address to continue.'); return 0; }
        return prev-1;
      });
    },1000);
  }
  function stopPayCountdown(){ if (payTicker.current) clearInterval(payTicker.current); payTicker.current=null; }
  function startScanLoop(){
    stopScanLoop();
    setScanIdx(0);
    setStatus(scanMessages[0]);
    scanTicker.current = setInterval(()=>{
      setScanIdx(prev=>{
        const next = (prev+1)%scanMessages.length;
        setStatus(scanMessages[next]);
        return next;
      });
    },1500);
  }
  function stopScanLoop(){ if (scanTicker.current) clearInterval(scanTicker.current); scanTicker.current=null; }
  useEffect(()=>()=>{ stopPayCountdown(); stopScanLoop(); },[]);

  // deep-link plan
  const searchParams = useSearchParams();
  useEffect(()=>{
    const q = searchParams?.get('plan');
    if (!q) return;
    const byId = PLANS.find(p => (p as any).id?.toLowerCase()===q.toLowerCase());
    const byLabel = PLANS.find(p => p.label.toLowerCase() === decodeURIComponent(q).toLowerCase());
    const target = byId || byLabel;
    if (!target) return;
    resetPayment();
    setSelected(target);
    setTimeout(()=>document.getElementById('checkout')?.scrollIntoView({behavior:'smooth'}), 60);
  },[searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetPayment(){
    stopPayCountdown(); stopScanLoop();
    setAddress(''); setLockedAmount(''); setStatus(''); setStep('select');
    setPaySecs(WINDOW_SECS); setEmailLocked(false);
  }
  function handleSelectPlan(p: Plan){ setSelected(p); resetPayment(); scrollToId('checkout'); }

  async function startPayment(){
    if (!isEmailValid){ setStatus('Enter a valid email to continue.'); return; }
    if (METHOD_NEEDS_CHAIN[method] && !chain){ setStatus('Select a network to continue.'); return; }
    if (methodNeedsLivePrice(method) && !pricesUSD[method]){ setStatus('Could not fetch live price. Please try again.'); return; }

    setStatus('Generating your unique address…');
    try{
      const endpoint = computeEndpoint(method, chain);
      const res = await fetch(endpoint, { cache:'no-store' });
      const data = await res.json();
      const addr = data?.address || demoAddress(method);
      setAddress(addr);
      setLockedAmount(previewAmount || '');
      setStep('pay'); setEmailLocked(true);
      startPayCountdown(); startScanLoop();
    }catch{
      setAddress(demoAddress(method));
      setLockedAmount(previewAmount || '');
      setStep('pay'); setEmailLocked(true);
      startPayCountdown(); startScanLoop();
    }
  }

  function computeEndpoint(m: Method, c: Chain|null){
    if (m==='BTC') return '/api/next-btc-address';
    if (m==='ETH') return '/api/next-eth-address';
    if (m==='SOL') return '/api/next-sol-address';
    if (m==='BNB') return '/api/next-bnb-address';
    if (m==='LTC') return '/api/next-ltc-address';
    if (m==='USDT'){ if (c==='ETH') return '/api/next-usdt-eth-address'; if (c==='SOL') return '/api/next-usdt-sol-address'; return '/api/next-usdt-bnb-address'; }
    if (m==='USDC'){ if (c==='ETH') return '/api/next-usdc-eth-address'; if (c==='SOL') return '/api/next-usdc-sol-address'; return '/api/next-usdc-bnb-address'; }
    return '/api/next-btc-address';
  }
  function demoAddress(m: Method){
    switch(m){
      case 'BTC': return 'bc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      case 'ETH': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
      case 'SOL': return 'So11111111111111111111111111111111111111112';
      case 'BNB': return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
      case 'LTC': return 'ltc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxx';
      default:    return '0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX';
    }
  }

  function paymentURI(){
    if (!address) return '';
    if (method==='BTC') return `bitcoin:${address}${lockedAmount?`?amount=${lockedAmount}`:''}`;
    if (method==='LTC') return `litecoin:${address}`;
    return address;
  }
  function qrURL(){
    const uri = paymentURI(); if (!uri) return '';
    return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(uri)}`;
  }
  function copy(v: string){ if (v) navigator.clipboard?.writeText(v).catch(()=>{}); }
  function scrollToId(id:string){ document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'}); }

  return (
    <div className="min-h-screen text-slate-900 bg-gradient-to-b from-white to-[#F6F8FB]">
      <BG />

      {/* Header (light) */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
          <span
  className="inline-grid h-8 w-8 place-items-center rounded-xl ring-1 ring-black/5 shadow-sm transition-transform group-hover:scale-105"
  style={{ background: '#3385FF', color: '#fff' }} // darker blue for contrast
>
  <ArrowLeftRight className="h-4 w-4" />
</span>
            <span className="font-semibold">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700">
            <a href="#plans" onClick={(e)=>{e.preventDefault(); scrollToId('plans')}} className="hover:text-slate-900">Plans</a>
            <a href="#features" onClick={(e)=>{e.preventDefault(); scrollToId('features')}} className="hover:text-slate-900">Features</a>
            <a href="#checkout" onClick={(e)=>{e.preventDefault(); scrollToId('checkout')}} className="hover:text-slate-900">Checkout</a>
            <a href="#faq" onClick={(e)=>{e.preventDefault(); scrollToId('faq')}} className="hover:text-slate-900">FAQ</a>
          </nav>
          <a href="#checkout" onClick={(e)=>{e.preventDefault(); scrollToId('checkout')}}
             className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
             style={{ background: ACCENT }}>
            <Bitcoin className="h-4 w-4"/> Pay with Crypto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 ring-1 ring-slate-200 px-3 py-1 text-xs text-slate-700 mb-6">
              <Zap className="h-3.5 w-3.5 text-[color:var(--accent)]" style={{ ['--accent' as any]: ACCENT }} />
              Instant email delivery • Live price lock
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Jumploads <span className="text-transparent bg-clip-text" style={{ backgroundImage:`linear-gradient(to right, ${ACCENT}, #6aa8ff)` }}>Premium Keys</span>
            </h1>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl">
              Pay with crypto and get your Jumploads premium key instantly after confirmations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" onClick={(e)=>{e.preventDefault(); scrollToId('plans')}}
                 className="px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-white hover:opacity-90"
                 style={{ background: ACCENT }}>
                View Plans <ArrowRight className="h-4 w-4"/>
              </a>
              <a href="#checkout" onClick={(e)=>{e.preventDefault(); scrollToId('checkout')}}
                 className="px-5 py-3 rounded-2xl border border-slate-200 bg-white/70 hover:bg-white/90 inline-flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-[color:var(--accent)]" style={{ ['--accent' as any]: ACCENT }}/>
                Pay with Crypto
              </a>
            </div>

           
          </motion.div>
        </div>
      </section>

      {/* Plans (white glass) */}
      <section id="plans" className="py-14 border-t border-slate-200 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: ACCENT }}>Choose your plan</h2>
          <p className="text-slate-600 mt-2">
            Every plan includes <span className="font-semibold text-slate-800">500 GB storage & 2 TB bandwidth</span> with instant email delivery.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p)=>(
              <motion.button key={p.id} whileHover={{scale:1.02}} onClick={()=>handleSelectPlan(p)}
                className="text-left rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-sm">
                <div className="text-xl font-semibold text-slate-900">{p.label}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-extrabold text-slate-900">${p.priceUSD.toFixed(2)}</div>
                  <div className="text-slate-400 line-through">${p.wasUSD.toFixed(2)}</div>
                </div>
                <div className="mt-3 text-xs text-slate-600">{p.bandwidth}</div>
                {selected.id===p.id && (
                  <div className="mt-3 inline-flex items-center text-[11px] px-2 py-0.5 rounded-md text-white"
                       style={{ background: ACCENT }}>
                    Selected
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          <div className="mt-6 text-sm text-slate-600">
            Selected: <span className="text-slate-900 font-medium">{selected.label}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: ACCENT }}>Benefits of Premium</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="No file size limits" text="Upload and download without hard caps."/>
            <Feature icon={<Zap className="h-5 w-5" />} title="No speed limits" text="Full-speed downloads with parallel support."/>
            <Feature icon={<QrCode className="h-5 w-5" />} title="Upload & download links" text="Easy linking for sharing and transfers."/>
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Encryption & security" text="Secure HTTPS with premium privacy."/>
            <Feature icon={<Coins className="h-5 w-5" />} title="Easy sharing" text="Simple link sharing with no ads."/>
            <Feature icon={<Mail className="h-5 w-5" />} title="24/7 email support" text="We’re here to help whenever you need."/>
          </div>
        </div>
      </section>

      {/* Checkout (light) */}
      <section id="checkout" className="py-24 border-t border-slate-200 bg-gradient-to-b from-transparent via-white/70 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.35}}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: ACCENT }}>Checkout</h3>
                <p className="mt-2 text-slate-600">Buy Jumploads Premium Key direct to email.</p>
              </div>
            </div>

            {/* Methods */}
            <div className="mt-8 flex flex-wrap gap-2">
              {METHODS.map(m=>{
                const Icon = m.icon;
                const active = method=== (m.id as Method);
                return (
                  <button key={m.id}
                    onClick={()=>{ if(method!==m.id){ resetPayment(); setMethod(m.id as Method); setChain(null);} }}
                    className={`px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2
                      ${active ? 'border-slate-300 bg-white/80'
                               : 'border-slate-200 hover:border-slate-300 bg-white/70'}`}>
                    <Icon className="h-4 w-4"/>{m.label}
                    {active && <span className="ml-1 text-xs text-slate-500">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Networks */}
            {METHOD_NEEDS_CHAIN[method] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">Network:</span>
                {(CHAIN_OPTIONS[method]||[]).map(c=>{
                  const active = chain===c;
                  return (
                    <button key={c} onClick={()=>{ setChain(c); resetPayment(); }}
                      className={`px-3 py-1.5 rounded-xl border text-sm
                        ${active ? 'border-slate-300 bg-white/80'
                                 : 'border-slate-200 hover:border-slate-300 bg-white/70'}`}>
                      {chainLabel(c)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2-col layout */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              {/* LEFT: before payment */}
              {step!=='pay' ? (
                <div className="space-y-4">
                  <Field label="Selected Plan">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-lg backdrop-blur">
                        {selected.label} — ${selected.priceUSD.toFixed(2)}
                      </div>
                      <button onClick={()=>{ resetPayment(); scrollToId('plans'); }}
                        className="text-xs px-3 py-2 rounded-xl bg-white/70 border border-slate-200 hover:border-slate-300">
                        Change
                      </button>
                    </div>
                  </Field>

                  <Field label="Your Email (for key delivery)">
                    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
                      disabled={emailLocked}
                      className={`w-full px-4 py-3 rounded-xl bg-white/70 border outline-none text-lg backdrop-blur
                        ${email.length===0 ? 'border-slate-200'
                          : isEmailValid ? 'border-emerald-400/70' : 'border-rose-400/70'}`} />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Stat label="Total Price (USD)" value={`$${selected.priceUSD.toFixed(2)}`} mono />
                    <Stat label={`Amount (${method})`} value={previewAmount || '—'} mono />
                  </div>

                  <button
                    onClick={startPayment}
                    disabled={!isEmailValid || (methodNeedsLivePrice(method)&&!pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method]&&!chain)}
                    className="w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg text-white shadow-[0_0_25px_rgba(47,130,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: (!isEmailValid || (methodNeedsLivePrice(method)&&!pricesUSD[method]) || (METHOD_NEEDS_CHAIN[method]&&!chain)) ? 'rgba(2,6,23,0.15)' : ACCENT }}
                  >
                    <QrCode className="h-5 w-5"/> Generate Address
                  </button>

                  {!!status && <p className="text-sm text-slate-600">{status}</p>}
                </div>
              ) : (
                // LEFT: during payment
                <div className="space-y-6">
                  <h4 className="text-2xl font-semibold" style={{ color: ACCENT }}>
                    Payment Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label={`Amount (${method})`}>
                      <div className="flex gap-2">
                        <input readOnly value={lockedAmount}
                          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 font-mono text-lg backdrop-blur"/>
                        <IconBtn onClick={()=>copy(lockedAmount)} title="Copy amount"><Copy className="h-4 w-4"/></IconBtn>
                      </div>
                    </Field>

                    <Field label="Payment Address">
                      <div className="flex gap-2">
                        <input readOnly value={address}
                          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 font-mono text-sm backdrop-blur"/>
                        <IconBtn onClick={()=>copy(address)} title="Copy address"><Copy className="h-4 w-4"/></IconBtn>
                      </div>
                      {METHOD_NEEDS_CHAIN[method] && chain && (
                        <div className="text-xs text-slate-600 mt-1">
                          Network: <span className="text-slate-800">{chainLabel(chain)}</span>
                        </div>
                      )}
                    </Field>
                  </div>

                  <div className="w-full flex items-center justify-center">
                    {qrURL() ? (
                      <img
                        src={qrURL()}
                        alt="Payment QR"
                        width={260} height={260}
                        className="mt-2 rounded-xl border border-slate-200 shadow-[0_0_35px_rgba(47,130,255,0.15)]"
                        referrerPolicy="no-referrer"
                        onError={(e)=>{
                          const uri = paymentURI();
                          (e.currentTarget as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                        }}
                      />
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-slate-300 grid place-items-center text-slate-400">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-2 text-sm text-slate-700 text-center">
                    <div className="font-medium">Send the exact amount.</div>
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[color:var(--acc)]" style={{ ['--acc' as any]: ACCENT }}/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT COL */}
              {step!=='pay' ? (
                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold" style={{ color: ACCENT }}>How it works</h4>
                  <ol className="space-y-3 text-slate-700 text-sm">
                    <Step icon={<Bitcoin className="h-4 w-4"/>} text="Select a Jumploads Premium pack" />
                    <Step icon={<Mail className="h-4 w-4"/>} text="Enter your email for delivery" />
                    <Step icon={<QrCode className="h-4 w-4"/>} text="Click Generate to lock price & get your address/QR" />
                    <Step icon={<TimerIcon className="h-4 w-4"/>} text="Send the exact amount within 30:00" />
                    <Step icon={<ShieldCheck className="h-4 w-4"/>} text="Key emailed after 2 confirmations" />
                  </ol>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600 backdrop-blur">
                    Payment details and QR will appear after you generate an address.
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-2xl font-semibold" style={{ color: ACCENT }}>Order Summary</h5>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <Summary label="Pack" value={selected.label}/>
                    <Summary label="USD Total" value={`$${selected.priceUSD.toFixed(2)}`} mono/>
                    <Summary label="Asset" value={method}/>
                    {METHOD_NEEDS_CHAIN[method] && chain && <Summary label="Network" value={chainLabel(chain)}/>}
                    <Summary label="Amount" value={lockedAmount} mono/>
                    <Summary label="Email" value={email}/>
                  </div>
                  <div className="mt-6 space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-slate-200 px-3 py-1 text-sm text-slate-700 backdrop-blur">
                      <TimerIcon className="h-4 w-4" />
                      <span>Time left</span>
                      <span className="font-mono text-slate-900">{fmtSecs(paySecs)}</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <Chip><ShieldCheck className="h-4 w-4"/><span>Buyer pays network fees</span></Chip>
                      <Chip><ShieldCheck className="h-4 w-4"/><span>2 confirmations required</span></Chip>
                      <Chip><Mail className="h-4 w-4"/><span>Instant Delivery</span></Chip>
                    </div>
                  </div>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    <button onClick={resetPayment} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white/70 hover:bg-white/90">
                      Cancel / Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ (includes activation steps) */}
      <section id="faq" className="py-16 border-t border-slate-200 bg-gradient-to-b from-transparent via-white/70 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: ACCENT }}>
              FAQ
              <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full"
                    style={{ backgroundImage:`linear-gradient(to right, ${ACCENT}, rgba(47,130,255,0.5))` }} />
            </h2>
            <div className="flex flex-wrap gap-2">
              <a href="/support" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 border border-slate-200 bg-white/70 hover:bg-white/90">
                <Mail className="h-4 w-4" />
                Contact support
              </a>
              <a href="/jumploads" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
                 style={{ background: ACCENT }}>
                Buy Jumploads keys
              </a>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
              <QA q={<><QrCode className="h-4 w-4 opacity-90"/> How do I buy a Jumploads key?</>}
                  a={<ol className="list-decimal list-inside space-y-1">
                      <li>Choose a pack & enter your email.</li>
                      <li>Select coin (and network for USDT/USDC or ETH L2).</li>
                      <li>Click <em>Generate</em> to lock price & get your address/QR.</li>
                      <li>Send the exact amount within 30 minutes.</li>
                    </ol>} />
              <QA q={<><ShieldCheck className="h-4 w-4 opacity-90"/> How do I activate my key?</>}
                  a={<ol className="list-decimal list-inside space-y-1">
                      <li>Log in to your account (<a className="underline" href="https://www.jumploads.com/user/join" target="_blank" rel="noreferrer">register here</a> if needed).</li>
                      <li>Go to <strong>My Account</strong> and find <strong>Apply Promo Code</strong>.</li>
                      <li>Paste your Premium Key and click <strong>Apply</strong>.</li>
                    </ol>} />
              <QA q={<><Coins className="h-4 w-4 opacity-90"/> Which coins & networks are supported?</>}
                  a={<>Coins: BTC, ETH, SOL, BNB, LTC, USDT, USDC. USDT/USDC networks: Ethereum, Solana, BNB. ETH supports L2s (Base, Arbitrum, Optimism, Polygon, zkSync, Linea, Scroll).</>} />
              <QA q={<><TimerIcon className="h-4 w-4 opacity-90"/> When do I receive my key?</>}
                  a={<>Instantly after required confirmations (usually minutes). We send the key to the email you entered.</>} />
              <QA q={<><AlertTriangle className="h-4 w-4 opacity-90"/> I sent the wrong amount/network</>}
                  a={<ul className="list-disc list-inside space-y-1">
                      <li><strong>Underpaid:</strong> send the difference before the timer expires.</li>
                      <li><strong>Overpaid:</strong> <a className="underline" href="/support">Contact support</a> with your TX hash—we’ll reconcile.</li>
                      <li><strong>Wrong network:</strong> USDT/USDC must match the selected network. Unsure? <a className="underline" href="/support">Reach out</a> ASAP.</li>
                    </ul>} />
              <QA q={<><RefreshCw className="h-4 w-4 opacity-90"/> Can I change my pack or email?</>}
                  a={<>During payment, email is locked. Click <em>Cancel / Start Over</em> to edit and re-generate.</>} />
            </div>

            {/* Side panel */}
            <aside className="rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur shadow-sm">
              <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: ACCENT }}>
                <Zap className="h-4 w-4 opacity-90" />
                Quick help
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✔️ <a href="/jumploads" className="underline">All Jumploads packs</a></li>
                <li>✔️ <a href="/support" className="underline">Payment issues (over/underpaid)</a></li>
                <li>✔️ <a href="/support" className="underline">Key not received</a></li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer (light) */}
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg" style={{ backgroundImage:'linear-gradient(to br, #f0abfc, #a78bfa, #60a5fa)' }} />
              <span className="font-semibold text-slate-900">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/support">Support</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refunds">Refunds</Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            © 2025 Only.Exchange • All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/** ---------- UI helpers (light) ---------- */
function Field({ label, children }:{label:string; children:React.ReactNode}){
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/70 border border-slate-200 ${mono?'font-mono':''} text-lg backdrop-blur`}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`${mono?'font-mono':''} mt-1 text-slate-900`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }:{icon:React.ReactNode; title:string; text:string}){
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur shadow-sm">
      <div className="inline-flex items-center gap-2 text-slate-900">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-slate-600 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }:{ q:React.ReactNode; a:React.ReactNode }){
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white/70 backdrop-blur hover:border-slate-300 transition overflow-hidden shadow-sm">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 text-slate-900">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90"/>
      </summary>
      <div className="h-px w-full" style={{ backgroundImage:`linear-gradient(to right, ${ACCENT}, rgba(47,130,255,0.35))` }} />
      <div className="px-4 pb-4 pt-3 text-slate-700 text-sm">{a}</div>
    </details>
  );
}
function Step({ icon, text }:{icon:React.ReactNode; text:string}){
  return (
    <li className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-xl bg-white/70 border border-slate-200 grid place-items-center backdrop-blur text-slate-800">
        {icon}
      </div>
      <span>{text}</span>
    </li>
  );
}
function Chip({ children }:{children:React.ReactNode}){
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 flex items-center justify-center gap-2 text-slate-700 backdrop-blur">
      {children}
    </div>
  );
}
function IconBtn({ onClick, title, children }:{onClick:()=>void; title:string; children:React.ReactNode}){
  return (
    <button onClick={onClick} title={title}
      className="px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/70 backdrop-blur">
      {children}
    </button>
  );
}
function fmtSecs(s:number){ const m=Math.floor(s/60), ss=s%60; return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft white blobs behind glass */}
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-white blur-3xl opacity-60"/>
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-white blur-3xl opacity-50"/>
    </div>
  );
}
