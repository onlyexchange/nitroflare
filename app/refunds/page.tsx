// app/refund/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Wallet,
  Hash,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Info,
  Timer as TimerIcon,
  ArrowRight,
  ArrowLeftRight,
  
} from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      <BG />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs
                         bg-gradient-to-r from-fuchsia-600/20 via-purple-600/15 to-indigo-600/20
                         ring-1 ring-white/10 text-white/90"
              aria-current="page"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refunds
            </span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-4">
              <Info className="h-3.5 w-3.5" />
              Last updated: August 2025
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Refunds & Adjustments
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              We can reconcile{" "}
              <span className="text-white">overpayments</span>, fix{" "}
              <span className="text-white">underpayments</span>, and help if your key
              hasn’t arrived. Refunds are sent on-chain to the{" "}
              <span className="text-white">same asset/network</span> you paid with.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/support"
                prefetch={false}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           text-sm font-semibold text-white
                           bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                           hover:from-fuchsia-500 hover:to-indigo-500
                           shadow-[0_0_18px_rgba(168,85,247,0.4)]"
              >
                <Mail className="h-4 w-4" />
                Start a refund request
              </Link>
              
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Plain-English Summary" icon={<ShieldCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Overpaid?</strong> We can return the difference.</li>
                <li><strong>Underpaid?</strong> Send the remaining amount to the <em>same address</em> before the timer expires.</li>
                <li><strong>No key?</strong> We’ll verify confirmations and resend to your order email.</li>
                <li><strong>Refunds</strong> are sent in the same asset/network used for payment (e.g., USDT on BNB → refund in USDT on BNB).</li>
              </ul>
            </Card>

            <Card title="Eligibility" icon={<RefreshCw className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Confirmed payment that exceeds the locked amount (overpayment).</li>
                <li>Duplicate payments to the same order address.</li>
                <li>Failed order delivery after confirmations (no key received).</li>
                <li><span className="text-white/70">Note:</span> If a key is <strong>redeemed</strong> on NitroFlare, it’s considered delivered and non-refundable.</li>
              </ul>
            </Card>

            <Card title="What to include in your request" icon={<Wallet className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Order email</strong> (the one you entered at checkout).</li>
                <li><strong>Host & pack</strong> (e.g., NitroFlare – 90 Days).</li>
                <li><strong>Coin + network</strong> (e.g., USDT on BNB; ETH on Base).</li>
                <li><strong>Transaction hash/ID</strong> and, if possible, a <strong>block explorer link</strong>.</li>
                <li><strong>Amount paid</strong> and your <strong>refund address</strong> (must be the same network/asset).</li>
              </ul>
              <div className="mt-3 text-sm text-white/70">
                Tip: Use our <Link href="/support" className="link-accent">support form</Link> — it asks for each item.
              </div>
            </Card>

            <Card title="How refunds are issued" icon={<Coins className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>We refund in the <strong>same asset & network</strong> used to pay.</li>
                <li>For overpayments, we return the <strong>difference</strong> after network fees.</li>
                <li>Underpayments are solved by sending the shortfall to the same address; no refund needed.</li>
              </ul>
            </Card>

            <Card title="Timelines" icon={<TimerIcon className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Verification:</strong> usually within a few hours after you provide details.</li>
                <li><strong>Payout:</strong> typically same day; complex cases may take up to 2 business days.</li>
              </ul>
            </Card>

            <div className="grid md:grid-cols-2 gap-5">
              <QA
                q={
                  <span className="inline-flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 opacity-90" />
                    Sent on the wrong network?
                  </span>
                }
                a={
                  <>
                    <div>If you sent USDT/USDC on the <em>wrong chain</em> (different from the one you selected),{" "}
                      <Link href="/support" className="link-accent">contact support</Link> immediately with your TX hash.</div>
                    <div className="mt-1 text-white/70 text-sm">We’ll investigate what’s possible case-by-case.</div>
                  </>
                }
              />
              <QA
                q={
                  <span className="inline-flex items-center gap-2">
                    <Hash className="h-4 w-4 opacity-90" />
                    Paid but no key?
                  </span>
                }
                a={
                  <>
                    <div>Check spam/junk first. Still missing? Open a ticket with your order email and TX hash:{" "}
                      <Link href="/support" className="link-accent">/support</Link>.</div>
                    <div className="mt-1 text-white/70 text-sm">We can verify confirmations and resend instantly.</div>
                  </>
                }
              />
            </div>

            <ActionCard />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 opacity-90" />
                Quick links
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#plain-english-summary" className="side-link">Summary</a></li>
                <li><a href="#eligibility" className="side-link">Eligibility</a></li>
                <li><a href="#what-to-include-in-your-request" className="side-link">What to include</a></li>
                <li><a href="#how-refunds-are-issued" className="side-link">How refunds work</a></li>
                <li><a href="#timelines" className="side-link">Timelines</a></li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 p-5">
              <div className="text-sm font-semibold">Need to start a refund?</div>
              <p className="text-white/70 text-sm mt-1">
                Use the Support form and select <em>Refund request</em>. Have your TX hash handy.
              </p>
              <Link
                href="/support"
                prefetch={false}
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg
                           text-sm font-semibold text-white
                           bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                           hover:from-fuchsia-500 hover:to-indigo-500"
              >
                <Mail className="h-4 w-4" />
                Contact support
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer (global) */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500" />
              <span className="font-semibold text-white">Only.Exchange</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href="/support">Support</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/refund">Refunds</a>
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

/* ---------- Small components ---------- */
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <section
      id={id}
      className="rounded-3xl p-[1.5px] bg-gradient-to-r from-fuchsia-600/60 via-purple-600/40 to-indigo-600/60 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
    >
      <div className="rounded-[22px] bg-black/40 border border-white/10 p-5 md:p-6">
        <div className="inline-flex items-center gap-2 text-white">
          {icon}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </section>
  );
}

function QA({ q, a }: { q: React.ReactNode; a: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm hover:border-white/20 transition overflow-hidden">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4">
        <div className="inline-flex items-center gap-2">{q}</div>
        <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-open:rotate-90" />
      </summary>
      <div className="h-px w-full bg-gradient-to-r from-fuchsia-500/40 via-purple-500/30 to-indigo-500/40" />
      <div className="px-4 pb-4 pt-3 text-white/80 text-sm">{a}</div>
    </details>
  );
}

function ActionCard() {
  return (
    <div className="rounded-3xl p-[1.5px] bg-gradient-to-r from-fuchsia-600/60 via-purple-600/40 to-indigo-600/60 shadow-[0_0_22px_rgba(168,85,247,0.25)]">
      <div className="rounded-[22px] bg-black/40 border border-white/10 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-white">
            <Mail className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Ready to request a refund?</h3>
          </div>
          <p className="text-white/70 text-sm mt-1">
            We’ll review your TX and respond by email. Have your order email and transaction hash ready.
          </p>
        </div>
        <Link
          href="/support"
          prefetch={false}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     text-sm font-semibold text-white
                     bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                     hover:from-fuchsia-500 hover:to-indigo-500"
        >
          <Mail className="h-4 w-4" />
          Contact support
        </Link>
      </div>
    </div>
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

/* tiny link class */
const sideLink = "side-link inline-flex items-center gap-1 text-white/70 hover:text-white";
