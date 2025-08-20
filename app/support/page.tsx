'use client';

import Link from 'next/link';
import { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Coins,
  Wallet,
  Hash,
} from 'lucide-react';
import emailjs from '@emailjs/browser';

// ======== CONFIG ========
// Create these public env vars (no server required):
// NEXT_PUBLIC_EMAILJS_SERVICE_ID=xxx
// NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=xxx
// NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxx
const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

// Primary reasons
type Reason = 'general' | 'bug' | 'order' | 'refund' | 'key';
// Order subreasons
type OrderIssue = 'overpaid' | 'underpaid' | 'not_received';

// Supported assets & networks
const COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'LTC', 'USDT', 'USDC'] as const;
type Coin = (typeof COINS)[number];

const ETH_L2S = ['ETH (Mainnet)', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'zkSync', 'Linea', 'Scroll'] as const;
const STABLE_NETWORKS = ['Ethereum', 'Solana', 'BNB Smart Chain'] as const;

function networksFor(coin: Coin): string[] {
  if (coin === 'ETH') return [...ETH_L2S];
  if (coin === 'USDT' || coin === 'USDC') return [...STABLE_NETWORKS];
  return []; // BTC/LTC/SOL/BNB native => no extra picker needed
}

export default function SupportPage() {
  // Core fields
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState<Reason>('general');
  const [orderIssue, setOrderIssue] = useState<OrderIssue>('not_received');

  // Order/payment details (conditionally required)
  const [coin, setCoin] = useState<Coin>('BTC');
  const [network, setNetwork] = useState<string>(''); // only when needed
  const [txHash, setTxHash] = useState('');
  const [txUrl, setTxUrl] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [pack, setPack] = useState(''); // e.g., 30/90/180/365 days
  const [host, setHost] = useState('NitroFlare'); // default live host
  const [orderEmail, setOrderEmail] = useState(''); // email used at checkout
  const [refundAddress, setRefundAddress] = useState(''); // for refund requests

  // Key troubleshooting
  const [keyValue, setKeyValue] = useState('');

  // Message
  const [message, setMessage] = useState('');

  // UX state
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Honeypot (spam trap)
  const honey = useRef<HTMLInputElement | null>(null);

  // Dynamic network reset when coin changes
  const availableNetworks = useMemo(() => networksFor(coin), [coin]);

  // Basic validators
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const orderEmailValid =
    orderEmail.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail);

  // Conditional requirements
  const needsPaymentBlock = reason === 'order' || reason === 'refund';
  const needsKeyBlock = reason === 'key';

  // For refunds, require "everything"
  const refundMissing =
    reason === 'refund' &&
    (!orderEmailValid ||
      orderEmail.trim() === '' ||
      pack.trim() === '' ||
      !coin ||
      (availableNetworks.length > 0 && network.trim() === '') ||
      txHash.trim() === '' ||
      amountPaid.trim() === '' ||
      refundAddress.trim() === '');

  // For order issues:
  const orderMissing =
    reason === 'order' &&
    (!orderEmailValid ||
      orderEmail.trim() === '' ||
      pack.trim() === '' ||
      !coin ||
      (availableNetworks.length > 0 && network.trim() === '') ||
      (orderIssue !== 'not_received' && txHash.trim() === '') // tx required if over/underpaid
    );

  // For key not working:
  const keyMissing = reason === 'key' && keyValue.trim() === '';

  const disabled =
    submitting ||
    !emailValid ||
    (needsPaymentBlock && (refundMissing || orderMissing)) ||
    (needsKeyBlock && keyMissing);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    // Honeypot
    if (honey.current && honey.current.value) {
      setErr('Something went wrong.'); // silently drop spam
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        // meta
        site: 'Only.Exchange',
        to_email: 'support@only.exchange', // for your template
        // user
        email,
        // reason
        reason,
        order_issue: reason === 'order' ? orderIssue : '',
        // order/payment
        host: needsPaymentBlock ? host : '',
        pack: needsPaymentBlock ? pack : '',
        order_email: needsPaymentBlock ? orderEmail : '',
        coin: needsPaymentBlock ? coin : '',
        network: needsPaymentBlock ? network : '',
        tx_hash: needsPaymentBlock ? txHash : '',
        tx_url: needsPaymentBlock ? txUrl : '',
        amount_paid: needsPaymentBlock ? amountPaid : '',
        refund_address: reason === 'refund' ? refundAddress : '',
        // key
        key_value: needsKeyBlock ? keyValue : '',
        // message
        message,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, payload, {
        publicKey: PUBLIC_KEY,
      });

      setOk('Thanks! Your ticket has been submitted. We’ll reply by email.');
      // soft reset but keep email for convenience
      setReason('general');
      setOrderIssue('not_received');
      setCoin('BTC');
      setNetwork('');
      setTxHash('');
      setTxUrl('');
      setAmountPaid('');
      setPack('');
      setHost('NitroFlare');
      setOrderEmail('');
      setRefundAddress('');
      setKeyValue('');
      setMessage('');
    } catch (e) {
      console.error(e);
      setErr('Could not send your request. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white text-[13px] font-extrabold leading-none ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
              O
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-white/60">Support</span>
          </nav>
        </div>
      </header>

      {/* Hero / Intro */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-4">
              <HelpCircle className="h-3.5 w-3.5" />
              We reply by email—usually within a few hours.
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Get help fast
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">
                Support@Only.Exchange
              </span>
            </h1>
            <p className="mt-3 text-white/80">
              Use the form below or email us directly at{' '}
              <a href="mailto:support@only.exchange" className="underline decoration-white/40 hover:decoration-white">
                support@only.exchange
              </a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={submit}
            className="rounded-3xl p-[1.5px] bg-gradient-to-r from-fuchsia-600/60 via-purple-600/40 to-indigo-600/60 shadow-[0_0_28px_rgba(168,85,247,0.25)]"
          >
            <div className="rounded-[22px] bg-black/40 border border-white/10 p-6 md:p-8">
              {/* Status banners */}
              {ok && (
                <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {ok}
                </div>
              )}
              {err && (
                <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm inline-flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                  {err}
                </div>
              )}

              {/* Contact email */}
              <Field label="Your email (reply-to)" required>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@email.com"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border outline-none ${email.length === 0 ? 'border-white/10' : emailValid ? 'border-emerald-400/60' : 'border-red-400/60'}`}
                />
              </Field>

              {/* Reason */}
              <Field label="How can we help?" required>
                <div className="grid sm:grid-cols-2 gap-2">
                  <RadioChip name="reason" value="general" current={reason} setCurrent={setReason} label="General query" />
                  <RadioChip name="reason" value="bug" current={reason} setCurrent={setReason} label="Technical support — report a bug" />
                  <RadioChip name="reason" value="order" current={reason} setCurrent={setReason} label="Issue with order" />
                  <RadioChip name="reason" value="refund" current={reason} setCurrent={setReason} label="Refund request" />
                  <RadioChip name="reason" value="key" current={reason} setCurrent={setReason} label="Key not working" />
                </div>
              </Field>

              {/* Order issue subtype */}
              {reason === 'order' && (
                <Field label="Order issue type" required>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <RadioChip name="orderIssue" value="overpaid" current={orderIssue} setCurrent={setOrderIssue} label="Overpaid" />
                    <RadioChip name="orderIssue" value="underpaid" current={orderIssue} setCurrent={setOrderIssue} label="Underpaid" />
                    <RadioChip name="orderIssue" value="not_received" current={orderIssue} setCurrent={setOrderIssue} label="Key not received" />
                  </div>
                </Field>
              )}

              {/* Payment / order details */}
              {needsPaymentBlock && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 opacity-80" />
                    Order & payment details
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <Field label="Filehost" required>
                      <select
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                      >
                        <option>NitroFlare</option>
                        <option>Emload</option>
                        <option>DaoFile</option>
                      </select>
                    </Field>

                    <Field label="Pack (e.g., 30 / 90 / 180 / 365 days)" required>
                      <input
                        value={pack}
                        onChange={(e) => setPack(e.target.value)}
                        placeholder="30 Days"
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                      />
                    </Field>

                    <Field label="Email used on order" required>
                      <input
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        placeholder="the email you entered at checkout"
                        className={`w-full px-3 py-2.5 rounded-xl bg-black/40 border outline-none ${orderEmail.length === 0 ? 'border-white/10' : orderEmailValid ? 'border-emerald-400/60' : 'border-red-400/60'}`}
                      />
                    </Field>

                    <Field label="Coin" required>
                      <select
                        value={coin}
                        onChange={(e) => { setCoin(e.target.value as Coin); setNetwork(''); }}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                      >
                        {COINS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>

                    {availableNetworks.length > 0 && (
                      <Field label="Network" required>
                        <select
                          value={network}
                          onChange={(e) => setNetwork(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                        >
                          <option value="" disabled>Select a network</option>
                          {availableNetworks.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </Field>
                    )}

                    <Field label="Transaction hash">
                      <div className="flex gap-2">
                        <input
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="0x… / txid"
                          className="flex-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                        />
                        <span className="inline-grid place-items-center px-3 rounded-xl border border-white/10 bg-black/40">
                          <Hash className="h-4 w-4 opacity-70" />
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/50">
                        Required for Overpaid / Underpaid. Optional for “Not received”.
                      </p>
                    </Field>

                    <Field label="Transaction URL (optional)">
                      <input
                        value={txUrl}
                        onChange={(e) => setTxUrl(e.target.value)}
                        placeholder="https://explorer/tx/…"
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                      />
                    </Field>

                    <Field label="Amount paid" required={reason === 'refund'}>
                      <div className="flex gap-2">
                        <input
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          placeholder="Enter amount (e.g., 0.0012)"
                          className="flex-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                        />
                        <span className="inline-grid place-items-center px-3 rounded-xl border border-white/10 bg-black/40 text-xs">
                          {coin}
                        </span>
                      </div>
                    </Field>

                    {reason === 'refund' && (
                      <Field label="Refund address (same network)" required>
                        <input
                          value={refundAddress}
                          onChange={(e) => setRefundAddress(e.target.value)}
                          placeholder="Where should we return the funds?"
                          className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                        />
                      </Field>
                    )}
                  </div>
                </div>
              )}

              {/* Key troubleshooting */}
              {needsKeyBlock && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold inline-flex items-center gap-2">
                    <Coins className="h-4 w-4 opacity-80" />
                    Key details
                  </div>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <Field label="Key code" required>
                      <input
                        value={keyValue}
                        onChange={(e) => setKeyValue(e.target.value)}
                        placeholder="Paste the key you received"
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                      />
                    </Field>
                    <Field label="Email used on order (optional)">
                      <input
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        placeholder="the email you entered at checkout"
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* Message */}
              <Field label="Describe the issue" required>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what happened. Include any error messages or extra context."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                />
              </Field>

              {/* Honeypot */}
              <input
                ref={honey}
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Footer / actions */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-white/60">
                  Or email us directly:{" "}
                  <a href="mailto:support@only.exchange" className="underline decoration-white/40 hover:decoration-white">
                    support@only.exchange
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={disabled}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm
                    ${disabled
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-[0_0_22px_rgba(168,85,247,0.35)]'
                    }`}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {submitting ? 'Sending…' : 'Send to Support'}
                </button>
              </div>
            </div>
          </form>

          {/* Tiny help */}
          <div className="mt-4 text-xs text-white/50">
            By submitting, you agree to be contacted at the email provided regarding your request.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
            <span className="font-semibold text-white">Only.Exchange</span>
          </div>
          <p className="mt-4 text-xs text-white/60 max-w-3xl">
            This form sends an email to support@only.exchange via EmailJS.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ------- little UI helpers ------- */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="text-sm text-white/70">
        {label} {required && <span className="text-white/50">*</span>}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function RadioChip<T extends string>({
  name,
  value,
  current,
  setCurrent,
  label,
}: {
  name: string;
  value: T;
  current: T | string;
  setCurrent: (v: T) => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => setCurrent(value)}
      className={`px-3 py-2 rounded-xl border text-sm
        ${active ? 'border-fuchsia-400/60 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
      aria-pressed={active}
      name={name}
    >
      {label}
    </button>
  );
}

function BG() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-600/15 to-indigo-600/25 blur-3xl" />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-fuchsia-600/10 to-purple-600/15 blur-3xl" />
    </div>
  );
}
