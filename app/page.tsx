'use client';

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
  Loader2
} from "lucide-react";

/** Degen Landing (full-bleed checkout + multi-method) */

const COINGECKO_URL = "/api/price?ids=bitcoin"; // BTC price for BTC amount
// Default BTC endpoint (others are optional; see ENDPOINTS below)
const WALLETS_URL   = "/api/next-btc-address";

const PLANS = [
  { id: 'nf-30',  label: '30 Days',  days: 30,  priceUSD: 8.99,  wasUSD: 15.0 },
  { id: 'nf-90',  label: '90 Days',  days: 90,  priceUSD: 20.99, wasUSD: 35.0 },
  { id: 'nf-180', label: '180 Days', days: 180, priceUSD: 32.99, wasUSD: 55.0 },
  { id: 'nf-365', label: '365 Days', days: 365, priceUSD: 59.99, wasUSD: 100.0 },
] as const;

const METHODS = [
  { id: 'BTC',  label: 'Bitcoin', icon: Bitcoin },
  { id: 'USDT', label: 'USDT',   icon: Zap },
  { id: 'USDC', label: 'USDC',   icon: Zap },
  { id: 'SOL',  label: 'SOL',    icon: Zap },
] as const;

type Plan = typeof PLANS[number];
type Method = typeof METHODS[number]['id'];

const ENDPOINTS: Record<Method, string> = {
  BTC:  "/api/next-btc-address",
  USDT: "/api/next-usdt-address", // create this route when ready
  USDC: "/api/next-usdc-address", // create this route when ready
  SOL:  "/api/next-sol-address",  // create this route when ready
};

const DEMO_ADDR: Record<Method, string> = {
  BTC:  "bc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  USDT: "TExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXXX",    // TRON example-ish
  USDC: "0xExampleDemoAddressXXXXXXXXXXXXXXXXXXXXXXXX",    // EVM example-ish
  SOL:  "So11111111111111111111111111111111111111112",    // SOL example-ish
};

export default function Page(){
  const [selected, setSelected] = useState<Plan>(PLANS[0]);
  const [email, setEmail] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);

  const [method, setMethod] = useState<Method>('BTC');
  const [btcUSD, setBtcUSD] = useState<number | null>(null);

  // Payment session
  const [address, setAddress] = useState('');
  const [lockedBtc, setLockedBtc] = useState(''); // only for BTC
  const [status, setStatus] = useState('');
  const [step, setStep] = useState<'select'|'pay'|'done'>('select');

  // Timers
  const WINDOW_SECS = 30 * 60;
  const [paySecs, setPaySecs] = useState(WINDOW_SECS);
  const payTicker = useRef<ReturnType<typeof setInterval> | null>(null);
  const [generating, setGenerating] = useState(false);

  // Animated scan messages
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

  // Hero FOMO timer (visual)
  const [heroTimer, setHeroTimer] = useState(29 * 60 + 59);
  useEffect(()=>{
    const t = setInterval(()=> setHeroTimer(v => (v>0? v-1 : 0)), 1000);
    return ()=> clearInterval(t);
  },[]);
  const heroTimeLeft = `${String(Math.floor(heroTimer/60)).padStart(2,'0')}:${String(heroTimer%60).padStart(2,'0')}`;

  // BTC price (for preview/lock when method === 'BTC')
  useEffect(()=>{
    let active = true;
    async function fetchPrice(){
      try{
        const res = await fetch(COINGECKO_URL, { cache: 'no-store' });
        const data = await res.json();
        const usd = data?.bitcoin?.usd ?? null;
        if (active) setBtcUSD(usd);
      }catch(e){ console.error(e); }
    }
    fetchPrice();
    const i = setInterval(fetchPrice, 60000);
    return ()=>{ active=false; clearInterval(i); };
  },[]);

  // preview BTC amount
  const previewBtc = useMemo(()=>{
    if (method !== 'BTC' || !btcUSD) return '';
    const amt = selected.priceUSD / btcUSD;
    const truncated = Math.trunc(amt * 1e8) / 1e8;
    return truncated.toFixed(8);
  }, [btcUSD, selected, method]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function startPayCountdown() {
    if (payTicker.current) clearInterval(payTicker.current);
    setPaySecs(WINDOW_SECS);
    payTicker.current = setInterval(() => {
      setPaySecs(prev => {
        if (prev <= 1) {
          if (payTicker.current) clearInterval(payTicker.current);
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
    if (scanTicker.current) clearInterval(scanTicker.current);
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

  function resetPayment(){
    stopPayCountdown();
    stopScanLoop();
    setAddress('');
    setLockedBtc('');
    setStatus('');
    setStep('select');
    setPaySecs(WINDOW_SECS);
    setEmailLocked(false);
  }

  async function startPayment(){
    if (!isEmailValid) { setStatus('Enter a valid email to continue.'); return; }
    if (method === 'BTC' && !btcUSD) { setStatus('Could not fetch BTC price. Please try again.'); return; }

    setGenerating(true);
    setStatus('Generating your unique address…');
    try{
      const endpoint = ENDPOINTS[method] || WALLETS_URL;
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      const addr = data?.address || '';
      if (!addr) throw new Error('No wallet available');

      setAddress(addr);
      setLockedBtc(method === 'BTC' ? (previewBtc || '') : '');
      setStep('pay');
      startPayCountdown();
      startScanLoop();
      setEmailLocked(true);
    }catch(e){
      console.error(e);
      const demo = DEMO_ADDR[method];
      setAddress(demo);
      setLockedBtc(method === 'BTC' ? (previewBtc || '') : '');
      setStep('pay');
      startPayCountdown();
      startScanLoop();
      setEmailLocked(true);
    } finally{
      setGenerating(false);
    }
  }

  function fmtSecs(s: number){
    const m = Math.floor(s/60);
    const ss = s % 60;
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  function paymentURI(){
    if (!address) return '';
    if (method === 'BTC') {
      return `bitcoin:${address}${lockedBtc ? `?amount=${lockedBtc}` : ''}`;
    }
    // generic URI for other assets (encode raw address)
    return address;
  }

  function qrURL(){
    const uri = paymentURI();
    if (!uri) return '';
    return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(uri)}`;
  }

  function copy(value: string){
    navigator.clipboard?.writeText(value).catch(()=>{});
  }
  function scrollToId(id: string){
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function handleSelectPlan(p: Plan){
    resetPayment();
    setSelected(p);
    scrollToId('checkout');
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500"/>
            <span className="font-semibold">NitroFlare Premium Keys</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#plans" onClick={e=>{e.preventDefault(); scrollToId('plans')}} className="hover:text-white">Plans</a>
            <a href="#features" onClick={e=>{e.preventDefault(); scrollToId('features')}} className="hover:text-white">Features</a>
            <a href="#checkout" onClick={e=>{e.preventDefault(); scrollToId('checkout')}} className="hover:text-white">Checkout</a>
            <a href="#faq" onClick={e=>{e.preventDefault(); scrollToId('faq')}} className="hover:text-white">FAQ</a>
          </nav>
          <a
            href="#checkout"
            onClick={e=>{e.preventDefault(); scrollToId('checkout')}}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500"
          >
            <Bitcoin className="h-4 w-4"/> Pay with Bitcoin
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-6">
              <Zap className="h-3.5 w-3.5"/> Live pricing • Unique address • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              NitroFlare <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">Premium Keys</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-2xl">
              Pay with crypto and get your NitroFlare premium key <em>instantly</em> after confirmation.
              Flash discount active — don’t miss it.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
              <TimerIcon className="h-4 w-4"/> Flash deal ends in <span className="font-mono">{heroTimeLeft}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#plans"
                onClick={e=>{e.preventDefault(); scrollToId('plans')}}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 inline-flex items-center gap-2 hover:from-fuchsia-400 hover:to-indigo-400"
              >
                <Flame className="h-5 w-5"/> View Plans
              </a>
              <a
                href="#checkout"
                onClick={e=>{e.preventDefault(); scrollToId('checkout')}}
                className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2"
              >
                <Bitcoin className="h-5 w-5"/> Pay with Crypto
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-white/70 mt-2">Big savings today. Instant delivery after confirmations.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> handleSelectPlan(p)}
                whileHover={{scale:1.02}}
                className={`text-left rounded-2xl border ${selected.id===p.id? 'border-fuchsia-400/60' : 'border-white/10'} bg-gradient-to-br from-white/10 to-transparent p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">{p.label}</div>
                  {selected.id===p.id && <CheckCircle2 className="h-5 w-5 text-fuchsia-300"/>}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold">${p.priceUSD.toFixed(2)}</div>
                  <div className="text-white/50 line-through">${p.wasUSD.toFixed(2)}</div>
                </div>
                <div className="mt-3 text-xs text-white/70">Best for: {p.days} days of high-speed downloads</div>
              </motion.button>
            ))}
          </div>
          <div className="mt-6 text-sm text-white/70">Selected: <span className="text-white font-medium">{selected.label}</span></div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Why NitroFlare Premium?</h2>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="Full-speed downloads" text="No throttling during peak hours—maximize your bandwidth."/>
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="No ads, no waiting" text="Skip timers and interstitials for 1-click access."/>
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="Parallel connections" text="Download multiple files at once with your manager."/>
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="Resume support" text="Pause/resume large files without starting over."/>
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="Direct links" text="Stable, resumable links that work in apps & DMs."/>
            <Feature icon={<ShieldCheck className="h-5 w-5"/>} title="Priority network" text="Premium routes for more reliable connectivity."/>
          </div>
        </div>
      </section>

      {/* Checkout — full-bleed degen (no box) */}
      <section id="checkout" className="py-24 border-t border-white/10 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {/* Big heading */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  Checkout
                </h3>
                <p className="mt-2 text-white/70">
                  Live price locks when you generate the address.
                </p>
              </div>
              <div className="text-xs font-mono text-white/70">
                {step === 'pay'
                  ? <>Window: <span className="text-white">{fmtSecs(paySecs)}</span></>
                  : <>Ready</>}
              </div>
            </div>

            {/* Method selector */}
            <div className="mt-8 flex flex-wrap gap-2">
              {METHODS.map(m=>{
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={()=>{ if (method!==m.id){ resetPayment(); setMethod(m.id); }}}
                    className={`px-4 py-2 rounded-2xl border text-sm inline-flex items-center gap-2
                      ${active
                        ? "border-fuchsia-400/60 bg-white/10"
                        : "border-white/10 hover:border-white/30 bg-white/5"}`}
                  >
                    <Icon className="h-4 w-4"/>{m.label}
                    {active && <span className="ml-1 text-xs text-white/60">(selected)</span>}
                  </button>
                );
              })}
            </div>

            {/* Summary row */}
            <div className="mt-10 grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-white/70">Selected Plan</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-lg">
                      {selected.label} — ${selected.priceUSD.toFixed(2)}
                    </div>
                    <button
                      onClick={()=>{ resetPayment(); scrollToId('plans'); }}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/15 hover:border-white/30"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-white/70">Your Email (for key delivery)</div>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      readOnly={emailLocked}
                      placeholder="you@email.com"
                      className={`flex-1 px-4 py-3 rounded-xl bg-white/5 border outline-none text-lg ${
                        emailLocked
                          ? "border-emerald-400/60 opacity-90"
                          : email.length === 0
                            ? "border-white/10"
                            : isEmailValid ? "border-emerald-400/60" : "border-red-400/60"
                      }`}
                    />
                    {emailLocked && (
                      <button
                        onClick={()=>{ setEmailLocked(false); resetPayment(); }}
                        className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/15 hover:border-white/30"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Stat label="Total Price (USD)" value={`$${selected.priceUSD.toFixed(2)}`} mono />
                  <Stat
                    label={`Amount (${method})`}
                    value={method === 'BTC' ? (lockedBtc || previewBtc || '—') : `≈ $${selected.priceUSD.toFixed(2)} in ${method}`}
                    mono
                  />
                  <Stat label="Savings today" value={`Save $${(selected.wasUSD - selected.priceUSD).toFixed(2)}`} />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={startPayment}
                    disabled={!isEmailValid || (method==='BTC' && !btcUSD) || generating}
                    className={`w-full px-6 py-4 rounded-2xl inline-flex items-center justify-center gap-2 text-lg
                      ${(!isEmailValid || (method==='BTC' && !btcUSD) || generating)
                        ? "bg-white/10 text-white/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(168,85,247,0.4)]"}`}
                  >
                    {generating ? <Loader2 className="h-5 w-5 animate-spin"/> : <Rocket className="h-5 w-5"/>}
                    {generating ? 'Generating…' : 'Generate address & start payment'}
                  </button>

                  {step === 'pay' && (
                    <button
                      onClick={resetPayment}
                      className="w-full px-6 py-4 rounded-2xl border border-white/15 hover:border-white/30"
                    >
                      Cancel / Start Over
                    </button>
                  )}
                </div>

                <p className="text-xs text-white/60">
                  By continuing you agree to our Terms. USD total is converted to your selected asset at current rate.
                </p>
              </div>

              {/* Payment details side — still no big box, just elements */}
              <div className="space-y-6">
                <h4 className="text-2xl font-semibold flex items-center gap-2">
                  <QrCode className="h-5 w-5"/> Payment Details
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/70">Amount ({method})</div>
                    <div className="mt-1 flex gap-2">
                      <input
                        readOnly
                        value={method === 'BTC' ? (lockedBtc || previewBtc || '') : (step==='pay' ? `≈ $${selected.priceUSD.toFixed(2)}` : '')}
                        placeholder={method==='BTC' ? '' : 'Shown after you generate'}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-lg"
                      />
                      <button onClick={()=>copy(method==='BTC' ? (lockedBtc || '') : (step==='pay' ? `${selected.priceUSD}` : ''))}
                        className="px-3 rounded-xl border border-white/10 hover:border-white/20" title="Copy amount">
                        <Copy className="h-4 w-4"/>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/70">Recipient Address</div>
                    <div className="mt-1 flex gap-2">
                      <input readOnly value={address} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm"/>
                      <button onClick={()=>copy(address)} className="px-3 rounded-xl border border-white/10 hover:border-white/20" title="Copy address">
                        <Copy className="h-4 w-4"/>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-center justify-center">
                  {qrURL() ? (
                    <img
                      src={qrURL()}
                      alt="Payment QR"
                      width={260}
                      height={260}
                      className="mt-2 rounded-xl border border-white/10 shadow-[0_0_35px_rgba(129,140,248,0.25)]"
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

                {/* Centered status + rules */}
                <div className="pt-2 flex flex-col items-center gap-2 text-sm text-white/80 text-center">
                  <div className="font-medium">Send the exact amount.</div>
                  {step === 'pay' && (
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin"/>
                      <span className="font-mono">{status || scanMessages[scanIdx]}</span>
                    </div>
                  )}
                </div>

                <ul className="text-xs text-white/60 space-y-1 text-center">
                  <li>• Payment window: <strong>{fmtSecs(paySecs)}</strong></li>
                  <li>• Network fees are paid by the sender. 1–2 confirmations required.</li>
                  <li>• Key delivered to your email immediately after confirmation.</li>
                </ul>

                {/* Order Summary (inline, no box) */}
                {step === 'pay' && address && (
                  <div className="mt-6">
                    <h5 className="text-lg font-semibold">Order Summary</h5>
                    <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Summary label="Pack" value={selected.label}/>
                      <Summary label="USD Total" value={`$${selected.priceUSD.toFixed(2)}`} mono/>
                      <Summary label="Asset" value={method}/>
                      <Summary label="Amount"
                               value={method==='BTC' ? (lockedBtc || previewBtc || '—') : `≈ $${selected.priceUSD.toFixed(2)}`}
                               mono/>
                      <Summary label="Email" value={email || '—'}/>
                      <Summary label="Recipient" value={address} mono wrap/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">FAQ</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <QA q="How fast do I get my key?" a="We dispatch instantly once your transaction reaches the required confirmations. Typically within minutes."/>
            <QA q="Do you support coins besides BTC?" a="Yes—BTC is live here. USDT/USDC/SOL will appear as options as we enable their endpoints."/>
            <QA q="Unique address per order?" a="Yes. We generate a fresh address per order for clean tracking."/>
            <QA q="What if my window expires?" a="Just generate a new address. The previous one will no longer be monitored."/>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500"/>
              <span className="font-semibold text-white">NitroFlare Premium Keys</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="#">Support</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Refunds</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/60 max-w-4xl">
            NitroFlare is a third-party service. This site sells access codes/keys only. All brand names and logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Small presentational helpers */
function Stat({ label, value, mono=false }:{label:string; value:string; mono?:boolean}){
  return (
    <div>
      <div className="text-sm text-white/70">{label}</div>
      <div className={`mt-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 ${mono ? 'font-mono' : ''} text-lg`}>
        {value}
      </div>
    </div>
  );
}
function Summary({ label, value, mono=false, wrap=false }:{label:string; value:string; mono?:boolean; wrap?:boolean}){
  return (
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className={`${mono ? 'font-mono' : ''} ${wrap ? 'break-all' : ''} mt-1 text-white/90`}>{value}</div>
    </div>
  );
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }){
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="inline-flex items-center gap-2 text-white">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-white/70 mt-1.5 text-sm">{text}</p>
    </div>
  );
}
function QA({ q, a }: { q: string; a: string }){
  return (
    <details className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <summary className="cursor-pointer list-none flex items-center justify-between">
        <span className="font-medium">{q}</span>
        <ArrowRight className="h-4 w-4 opacity-60"/>
      </summary>
      <p className="text-white/75 pt-3">{a}</p>
    </details>
  );
}
function BG(){
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-600/15 to-indigo-600/25 blur-3xl"/>
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-fuchsia-600/10 to-purple-600/15 blur-3xl"/>
    </div>
  );
}
