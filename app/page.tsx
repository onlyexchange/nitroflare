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
} from "lucide-react";

/**
 * NitroFlare Premium Key – Degen Landing Page
 * Framework: React + Tailwind + framer-motion + lucide-react
 */

const COINGECKO_URL = "/api/price?ids=bitcoin";     // server proxy
const WALLETS_URL   = "/api/next-btc-address";       // server endpoint

const PLANS = [
  { id: 'nf-30',  label: '30 Days',  days: 30,  priceUSD: 8.99,  wasUSD: 15.0 },
  { id: 'nf-90',  label: '90 Days',  days: 90,  priceUSD: 20.99, wasUSD: 35.0 },
  { id: 'nf-180', label: '180 Days', days: 180, priceUSD: 32.99, wasUSD: 55.0 },
  { id: 'nf-365', label: '365 Days', days: 365, priceUSD: 59.99, wasUSD: 100.0 },
] as const;

type Plan = typeof PLANS[number];

export default function NitroflareDegenLanding(){
  const [selected, setSelected] = useState<Plan>(PLANS[0]);
  const [email, setEmail] = useState('');
  const [btcUSD, setBtcUSD] = useState<number | null>(null);

  // Payment session state
  const [address, setAddress] = useState('');
  const [lockedBtc, setLockedBtc] = useState(''); // amount locked at generation time
  const [lockedAt, setLockedAt] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const [step, setStep] = useState<'select'|'pay'|'done'>('select');
  const [paySecs, setPaySecs] = useState(20 * 60); // 20 min per address
  const payTicker = useRef<NodeJS.Timeout | null>(null);
  const [showSats, setShowSats] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string>('');

  // Hero deal countdown (visual only)
  const [heroTimer, setHeroTimer] = useState(29 * 60 + 59);
  useEffect(()=>{
    const t = setInterval(()=> setHeroTimer(v => (v>0? v-1 : 0)), 1000);
    return ()=> clearInterval(t);
  },[]);
  const heroTimeLeft = `${String(Math.floor(heroTimer/60)).padStart(2,'0')}:${String(heroTimer%60).padStart(2,'0')}`;

  // Live BTC every 60s
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

  // Amount (live preview before locking)
  const previewBtc = useMemo(()=>{
    if (!btcUSD) return '';
    const amt = selected.priceUSD / btcUSD;
    const truncated = Math.trunc(amt * 1e8) / 1e8;
    return truncated.toFixed(8);
  }, [btcUSD, selected]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function showToast(msg: string){
    setToast(msg);
    setTimeout(()=> setToast(''), 1400);
  }

  function startPayCountdown() {
    if (payTicker.current) clearInterval(payTicker.current);
    setPaySecs(20 * 60);
    payTicker.current = setInterval(() => {
      setPaySecs(prev => {
        if (prev <= 1) {
          clearInterval(payTicker.current!);
          setStatus('Payment window expired. Generate a new address to continue.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(()=>()=>{ if (payTicker.current) clearInterval(payTicker.current); },[]);

  async function startPayment(){
    if (!isEmailValid) { setStatus('Enter a valid email to continue.'); return; }
    if (!btcUSD) { setStatus('Could not fetch BTC price. Please try again.'); return; }
    setGenerating(true);
    setStatus('Generating your unique BTC address…');
    try{
      const res = await fetch(WALLETS_URL, { cache: 'no-store' });
      const data = await res.json();
      const addr = data?.address || '';
      if (!addr) throw new Error('No wallet available');

      // Lock amount and start session timer
      setAddress(addr);
      setLockedBtc(previewBtc);
      setLockedAt(new Date());
      setStep('pay');
      startPayCountdown();
      setStatus('Send the exact amount. Scanning blockchain network…');
    } catch(e){
      console.error(e);
      const demo = 'bc1qexampledemoaddressxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      setAddress(demo);
      setLockedBtc(previewBtc);
      setLockedAt(new Date());
      setStep('pay');
      startPayCountdown();
      setStatus('Demo address loaded. Replace with a real generator.');
    } finally {
      setGenerating(false);
    }
  }

  function resetPayment(){
    if (payTicker.current) clearInterval(payTicker.current);
    setAddress('');
    setLockedBtc('');
    setLockedAt(null);
    setPaySecs(20 * 60);
    setStep('select');
    setStatus('');
  }

  function fmtSecs(s: number){
    const m = Math.floor(s/60);
    const ss = s % 60;
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    }

  function bip21URI(amount?: string){
    if (!address) return '';
    const query = amount && Number(amount) > 0 ? `?amount=${amount}` : '';
    return `bitcoin:${address}${query}`;
  }

  function qrURL(){
    const uri = bip21URI(lockedBtc);
    if (!uri) return '';
    // primary
    return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(uri)}`;
  }

  function copy(value: string, label='Copied'){
    navigator.clipboard?.writeText(value).then(()=>showToast(label)).catch(()=>showToast('Could not copy'));
  }

  const displayAmount = showSats && lockedBtc
    ? `${Math.round(parseFloat(lockedBtc) * 1e8).toLocaleString()} sats`
    : (lockedBtc || previewBtc || '—');

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
            <a href="#plans" className="hover:text-white">Plans</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#checkout" className="hover:text-white">Checkout</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a href="#checkout" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500">
            <Bitcoin className="h-4 w-4"/> Pay with Bitcoin
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-6">
              <Zap className="h-3.5 w-3.5"/> Live BTC pricing • Unique address • Instant email delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              NitroFlare <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">Premium Keys</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-2xl">
              Pay with <strong>Bitcoin</strong> and get your NitroFlare premium key <em>instantly</em> after confirmation.
              Flash discount active — don’t miss it.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
              <TimerIcon className="h-4 w-4"/> Flash deal ends in <span className="font-mono">{heroTimeLeft}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 inline-flex items-center gap-2 hover:from-purple-400 hover:to-indigo-400">
                <Flame className="h-5 w-5"/> View Plans
              </a>
              <a href="#checkout" className="px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 inline-flex items-center gap-2">
                <Bitcoin className="h-5 w-5"/> Pay with BTC
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-14 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
          <p className="text-white/70 mt-2">Big savings today. Instant delivery after BTC confirmation.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <motion.button
                key={p.id}
                onClick={()=> setSelected(p)}
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

      {/* Checkout (centered, feature-rich) */}
      <section id="checkout" className="py-16 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Bitcoin className="h-5 w-5"/> Pay with Bitcoin
            </h3>
            <p className="text-white/70 mt-1">Live BTC pricing. Unique address per order.</p>

            {/* Order summary + email */}
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70">Selected Plan</label>
                <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  {selected.label} — ${selected.priceUSD.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70">Your Email (for key delivery)</label>
                <input
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border outline-none ${
                    email.length === 0
                      ? "border-white/10"
                      : isEmailValid ? "border-emerald-400/60" : "border-red-400/60"
                  }`}
                />
              </div>
            </div>

            {/* Price row + unit toggle */}
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-white/70">BTC/USD</div>
                <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono">
                  {btcUSD? `$${btcUSD.toLocaleString()}` : '—'}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 flex items-center justify-between">
                  <span>Amount</span>
                  <button
                    onClick={()=>setShowSats(s=>!s)}
                    className="text-xs px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15"
                  >
                    {showSats ? 'Show BTC' : 'Show sats'}
                  </button>
                </div>
                <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono">
                  {displayAmount}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70">Savings today</div>
                <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  Save ${(selected.wasUSD - selected.priceUSD).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <button
                onClick={startPayment}
                disabled={!isEmailValid || !btcUSD || generating}
                className={`w-full px-5 py-3 rounded-2xl inline-flex items-center justify-center gap-2
                  ${(!isEmailValid || !btcUSD || generating)
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400"}`}
              >
                <Rocket className="h-5 w-5"/>
                {generating ? 'Generating…' : 'Generate address & start payment'}
              </button>

              {step === 'pay' && (
                <button
                  onClick={resetPayment}
                  className="w-full px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30"
                >
                  Cancel / Start Over
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-white/60">
              By continuing you agree to our Terms. Prices shown in USD; you will pay the BTC equivalent at current rate.
            </p>

            {/* Payment Details */}
            {step === 'pay' && address && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <QrCode className="h-5 w-5"/> Payment Details
                  </h4>
                  <div className="text-sm text-white/70">
                    Window: <span className="font-mono">{fmtSecs(paySecs)}</span>
                    {lockedAt && <span className="ml-3">• Locked at {lockedAt.toLocaleTimeString()}</span>}
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/70">Amount (BTC)</div>
                    <div className="mt-1 flex gap-2">
                      <input readOnly value={lockedBtc} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono"/>
                      <button onClick={()=>copy(lockedBtc,'Amount copied')} className="px-3 rounded-xl border border-white/10 hover:border-white/20">
                        <Copy className="h-4 w-4"/>
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      {showSats ? `${Math.round(parseFloat(lockedBtc) * 1e8).toLocaleString()} sats` : 'Switch to sats above'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/70">Recipient Address</div>
                    <div className="mt-1 flex gap-2">
                      <input readOnly value={address} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono"/>
                      <button onClick={()=>copy(address,'Address copied')} className="px-3 rounded-xl border border-white/10 hover:border-white/20">
                        <Copy className="h-4 w-4"/>
                      </button>
                    </div>
                  </div>

                  {/* QR */}
                  <div className="md:col-span-2 flex items-center justify-center">
                    {qrURL() ? (
                      <a
                        href={bip21URI(lockedBtc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in your wallet"
                        className="group"
                      >
                        <img
                          src={qrURL()}
                          alt="Bitcoin payment QR"
                          width={260}
                          height={260}
                          className="mt-2 rounded-xl border border-white/10 transition group-hover:scale-[1.02]"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const uri = bip21URI(lockedBtc);
                            (e.currentTarget as HTMLImageElement).src =
                              `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(uri)}`;
                          }}
                        />
                      </a>
                    ) : (
                      <div className="mt-2 h-[260px] w-[260px] rounded-xl border border-dashed border-white/10 grid place-items-center text-white/40">
                        QR will appear here
                      </div>
                    )}
                  </div>

                  {/* Actions under QR */}
                  <div className="md:col-span-2 grid sm:grid-cols-3 gap-3">
                    <button
                      onClick={()=>copy(bip21URI(lockedBtc),'Payment URI copied')}
                      className="px-4 py-2 rounded-xl border border-white/15 hover:border-white/30"
                    >
                      Copy Payment URI
                    </button>
                    <a
                      href={qrURL() || '#'}
                      download={`bitcoin-${address}.png`}
                      className={`px-4 py-2 rounded-xl text-center ${qrURL() ? 'border border-white/15 hover:border-white/30' : 'border border-white/10 pointer-events-none opacity-50'}`}
                    >
                      Download QR
                    </a>
                    <a
                      href={bip21URI(lockedBtc) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-xl text-center ${address ? 'border border-white/15 hover:border-white/30' : 'border border-white/10 pointer-events-none opacity-50'}`}
                    >
                      Open in Wallet
                    </a>
                  </div>
                </div>

                <div className="mt-4 text-sm text-white/70 min-h-[40px]">{status}</div>
                <ul className="mt-3 text-xs text-white/60 space-y-1">
                  <li>• Send the <strong>exact</strong> BTC amount within 20 minutes.</li>
                  <li>• Network fees are paid by the sender. 1–2 confirmations required.</li>
                  <li>• Key delivered to your email immediately after confirmation.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold">FAQ</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <QA q="How fast do I get my key?" a="We dispatch instantly once your BTC transaction reaches the required confirmations. Typically within minutes."/>
            <QA q="Is the BTC price live?" a="Yes. We fetch current BTC/USD using our price proxy every minute and compute your exact BTC total when you start payment."/>
            <QA q="Unique address per order?" a="Yes. We generate a fresh Bitcoin address per order for clean tracking."/>
            <QA q="Can I pay with other crypto?" a="This page is Bitcoin-only. Ask support for USDT/USDC/SOL options."/>
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

      {/* Tiny toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm">
          {toast}
        </div>
      )}
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
