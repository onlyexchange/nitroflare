// app/terms/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Wallet,
  Scale,
  AlertTriangle,
  Mail,
  Info,
  ScrollText,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';

export default function TermsPage() {
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
              <ScrollText className="h-3.5 w-3.5" />
              Terms
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
              Terms of Service
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              Quick summary first, then the legal details. By using Only.Exchange you agree to
              these Terms. If you have questions,{" "}
              <Link href="/support" className="underline decoration-white/30 hover:decoration-white">
                contact support
              </Link>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Plain-English Overview" icon={<ShieldCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>We sell <strong>access codes/keys</strong> for third-party filehosts (e.g., NitroFlare, FilesFly, RapidGator).</li>
                <li>Payments are in crypto. Amounts are calculated from live pricing and <strong>lock for 30 minutes</strong> per order.</li>
                <li>Your key is <strong>emailed automatically</strong> once the chain shows the required confirmations.</li>
                <li>You must send the <strong>exact amount</strong> to the address shown and use the <strong>correct network</strong>.</li>
                <li>If you underpay, send the difference before the timer ends. If you overpay or used the wrong network,{" "}
                  <Link href="/support" className="link-grad">contact support</Link>.
                </li>
                <li>We are not affiliated with filehosts and can’t control their uptime, features, or policies.</li>
              </ul>
            </Card>

            <Card title="Eligibility & Account" icon={<Scale className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>You must be legally able to enter into these Terms in your jurisdiction.</li>
                <li>You are responsible for the <strong>accuracy of your email</strong> so your key can be delivered.</li>
                <li>Do not use Only.Exchange for illegal purposes or in violation of sanctions/embargoes.</li>
              </ul>
            </Card>

            <Card title="Products We Sell" icon={<ScrollText className="h-5 w-5" />}>
              <p className="text-white/80">
                Only.Exchange sells <strong>digital access codes/keys</strong> redeemable at third-party
                services (e.g., NitroFlare, Daofile). We don’t operate or control those services. All brand names and
                logos belong to their respective owners.
              </p>
            </Card>

            <Card title="Pricing & Crypto Payments" icon={<Wallet className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Supported assets include BTC, ETH, SOL, BNB, LTC, and stables (USDT/USDC with supported networks).</li>
                <li>Prices are calculated via live Crypto Market Price
                    are <strong>locked for 30 minutes</strong> when you click <em>Buy at Checkout</em>.</li>
                <li>You must send the <strong>exact amount</strong> to the address provided. Sender pays network/miner fees.</li>
                <li>USDT/USDC must be sent on the <strong>selected network</strong>. ETH supports L2 choices—send on what you picked.</li>
                <li>Blockchain transactions are typically final. We cannot reverse payments on-chain.</li>
              </ul>
            </Card>

            <Card title="Orders & Delivery" icon={<ShieldCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Keys are delivered to your email after required confirmations (usually minutes; network-dependent).</li>
                <li>If you don’t see the email, check spam. Still missing?{" "}
                  <Link href="/support" className="link-grad">open a ticket</Link> with your transaction hash.</li>
                <li>Keep your key confidential until you redeem it on the host’s website.</li>
              </ul>
            </Card>

            <Card title="Adjustments & Refunds" icon={<AlertTriangle className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Underpaid:</strong> Send the difference to the same address before the timer expires.</li>
                <li><strong>Overpaid:</strong> We’ll reconcile differences—please{" "}
                  <Link href="/support" className="link-grad">contact support</Link> with your TX hash.</li>
                <li><strong>Wrong network:</strong> For stables, the network must match your selection. If you sent to a non-monitored
                    network/address,{" "}
                  <Link href="/support" className="link-grad">reach out ASAP</Link>.</li>
                <li>Once a key is issued and visible in your email, it’s considered delivered.</li>
              </ul>
            </Card>

            <Card title="Your Responsibilities" icon={<ShieldCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Provide a valid email and monitor it for delivery.</li>
                <li>Send the exact amount within the window, on the correct network.</li>
                <li>Comply with applicable laws and the third-party host’s terms.</li>
              </ul>
            </Card>

            <Card title="Disclaimers & Liability" icon={<Scale className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>The service is provided “as is” and “as available.” We make no warranties as to uptime, speed, or fitness for a particular purpose.</li>
                <li>We are not responsible for third-party host outages, policy changes, or performance.</li>
                <li>To the fullest extent permitted by law, our total liability is limited to the amount you paid for the affected order.</li>
              </ul>
            </Card>

            <Card title="Changes to These Terms" icon={<Info className="h-5 w-5" />}>
              <p className="text-white/80">
                We may update these Terms from time to time. The “Last updated” date will change. Your continued use of
                Only.Exchange means you accept the updated Terms.
              </p>
            </Card>

            <Card title="Contact" icon={<Mail className="h-5 w-5" />}>
              <p className="text-white/80">
                Questions about these Terms?{" "}
                <Link href="/support" className="link-grad">Contact support</Link> or email{" "}
                <a href="mailto:support@only.exchange" className="underline decoration-white/30 hover:decoration-white">
                  support@only.exchange
                </a>.
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <ScrollText className="h-4 w-4 opacity-90" />
                Quick links
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#plain-english" className="side-link">Plain-English Overview</a></li>
                <li><a href="#eligibility" className="side-link">Eligibility</a></li>
                <li><a href="#products" className="side-link">Products We Sell</a></li>
                <li><a href="#pricing" className="side-link">Pricing & Payments</a></li>
                <li><a href="#orders" className="side-link">Orders & Delivery</a></li>
                <li><a href="#refunds" className="side-link">Adjustments & Refunds</a></li>
                <li><a href="#responsibilities" className="side-link">Your Responsibilities</a></li>
                <li><a href="#disclaimers" className="side-link">Disclaimers</a></li>
                <li><a href="#changes" className="side-link">Changes to Terms</a></li>
                <li><a href="#contact" className="side-link">Contact</a></li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 p-5">
              <div className="text-sm font-semibold">Need help with an order?</div>
              <p className="text-white/70 text-sm mt-1">
                Our team can verify your transaction and resend keys if needed.
              </p>
              <Link
                href="/support"
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

      
      {/* Footer */}
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

/* ---------- UI helpers ---------- */
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  // generate an id for sidebar anchors based on the title
  const id = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <section id={id} className="rounded-3xl p-[1.5px] bg-gradient-to-r from-fuchsia-600/60 via-purple-600/40 to-indigo-600/60 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
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

function BG() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-600/15 to-indigo-600/25 blur-3xl" />
      <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-fuchsia-600/10 to-purple-600/15 blur-3xl" />
    </div>
  );
}

/* tiny link styles */
const sideLink =
  "side-link inline-flex items-center gap-1 text-white/70 hover:text-white";
const linkGrad =
  "link-grad font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 underline underline-offset-4 decoration-white/20";

// attach classes to global (TS happy helper - optional)
declare global {
  interface HTMLElementTagNameMap {
    'a': HTMLAnchorElement;
  }
}
