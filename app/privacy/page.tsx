// app/privacy/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  Mail,
  Cookie,
  Database,
  Globe,
  Server,
  Hash,
  UserCheck,
  Trash2,
  AlertTriangle,
  Info,
  ArrowLeftRight,
} from 'lucide-react';

export default function PrivacyPage() {
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
              <Lock className="h-3.5 w-3.5" />
              Privacy
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
              Privacy Policy
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              We keep it simple: minimum data, clear purpose. This page explains what we collect,
              how we use it, and the choices you have. Questions?{" "}
              <Link
                href="/support"
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r
                           from-fuchsia-400 via-purple-400 to-indigo-400 underline underline-offset-4 decoration-white/20"
              >
                Contact support
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
            <Card title="Plain-English Summary" icon={<ShieldCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>We sell <strong>digital access keys</strong> and email them to you once your crypto payment confirms.</li>
                <li>We collect the <strong>email you provide</strong> and <strong>order metadata</strong> (pack, host, amount, tx hash/ID, network).</li>
                <li>We do <strong>not</strong> collect private keys or card data (we don’t take cards).</li>
                <li>Support messages are sent via EmailJS; keys are sent via our email provider.</li>
                <li>We don’t sell personal data. Limited cookies/analytics help us run the site.</li>
              </ul>
            </Card>

            <Card title="Data We Collect" icon={<Database className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Order data:</strong> email, selected host & pack, amount/asset, network, tx hash/ID, confirmation status.</li>
                <li><strong>Support data:</strong> your contact email and any info you include (e.g., tx link, refund address) via our form.</li>
                <li><strong>Basic device data:</strong> IP, approximate location, user agent (standard server logs/analytics).</li>
              </ul>
            </Card>

            <Card title="How We Use Data" icon={<Server className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Deliver keys:</strong> email your key when the blockchain confirms payment.</li>
                <li><strong>Support:</strong> look up orders, fix payment mismatches, issue adjustments/refunds.</li>
                <li><strong>Security & fraud prevention:</strong> detect abuse and keep systems stable.</li>
                <li><strong>Legal compliance:</strong> respond to lawful requests and meet obligations.</li>
              </ul>
            </Card>

            <Card title="Payments & Blockchain" icon={<Hash className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Crypto payments are processed on-chain. We store <strong>addresses and tx hashes</strong> to match payments to orders.</li>
                <li>We never control or collect your wallet’s private keys.</li>
                <li>Transactions are public by design; anyone can view them on block explorers.</li>
              </ul>
            </Card>

            <Card title="Cookies & Analytics" icon={<Cookie className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Essential:</strong> session/basic cookies to keep the site working.</li>
                <li><strong>Analytics:</strong> privacy-respecting analytics to understand traffic and uptime (no ad tracking).</li>
                <li>You can block cookies in your browser, but some features may not work.</li>
              </ul>
            </Card>

            <Card title="Sharing & Service Providers" icon={<Globe className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Email delivery:</strong> we use an email provider to send keys and receipts.</li>
                <li><strong>Support (EmailJS):</strong> support form submissions are sent via EmailJS to our support inbox.</li>
                <li><strong>Hosting & infrastructure:</strong> cloud providers host the app and logs.</li>
                <li>We don’t sell personal data.</li>
              </ul>
            </Card>

            <Card title="Data Retention" icon={<Server className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Order and support records are kept for as long as needed for operations, accounting, and regulatory purposes.</li>
                <li>You can request deletion of personal data that we’re not required to keep; see “Your Rights.”</li>
              </ul>
            </Card>

            <Card title="Your Rights & Choices" icon={<UserCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Access, correction, deletion, and portability (where applicable: GDPR/UK GDPR/other local laws).</li>
                <li>Object or restrict certain processing where applicable.</li>
                <li>We do not sell personal data (CCPA/CPRA “Do Not Sell/Share” not applicable).</li>
                <li>To exercise rights,{" "}
                  <Link
                    href="/support"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r
                               from-fuchsia-400 via-purple-400 to-indigo-400 underline underline-offset-4 decoration-white/20"
                  >
                    contact support
                  </Link> from the email tied to your order.</li>
              </ul>
            </Card>

            <Card title="Security" icon={<ShieldCheck className="h-5 w-5" />}>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>We use industry-standard safeguards and least-data practices.</li>
                <li>No system is perfectly secure; please keep your wallet and email secure.</li>
              </ul>
            </Card>

            <Card title="Children" icon={<AlertTriangle className="h-5 w-5" />}>
              <p className="text-white/80">
                Only.Exchange is not intended for children under 13 (or older, where local law requires).
                Do not use the service if you are under the applicable age.
              </p>
            </Card>

            <Card title="Changes to this Policy" icon={<Info className="h-5 w-5" />}>
              <p className="text-white/80">
                We may update this Privacy Policy. The “Last updated” date will change. Your continued use
                of Only.Exchange means you accept the updated policy.
              </p>
            </Card>

            <Card title="Contact" icon={<Mail className="h-5 w-5" />}>
              <p className="text-white/80">
                Data controller: Only.Exchange. For questions, requests, or complaints,{" "}
                <Link
                  href="/support"
                  className="font-semibold text-transparent bg-clip-text bg-gradient-to-r
                             from-fuchsia-400 via-purple-400 to-indigo-400 underline underline-offset-4 decoration-white/20"
                >
                  contact support
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:support@only.exchange"
                  className="underline decoration-white/30 hover:decoration-white"
                >
                  support@only.exchange
                </a>.
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4 opacity-90" />
                Quick links
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#plain-english-summary" className="side-link">Summary</a></li>
                <li><a href="#data-we-collect" className="side-link">Data We Collect</a></li>
                <li><a href="#how-we-use-data" className="side-link">How We Use Data</a></li>
                <li><a href="#payments-blockchain" className="side-link">Payments & Blockchain</a></li>
                <li><a href="#cookies-analytics" className="side-link">Cookies & Analytics</a></li>
                <li><a href="#sharing-service-providers" className="side-link">Sharing</a></li>
                <li><a href="#data-retention" className="side-link">Retention</a></li>
                <li><a href="#your-rights-choices" className="side-link">Your Rights</a></li>
                <li><a href="#security" className="side-link">Security</a></li>
                <li><a href="#children" className="side-link">Children</a></li>
                <li><a href="#changes-to-this-policy" className="side-link">Changes</a></li>
                <li><a href="#contact" className="side-link">Contact</a></li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/10 to-indigo-600/10 p-5">
              <div className="text-sm font-semibold">Need to exercise your rights?</div>
              <p className="text-white/70 text-sm mt-1">
                Request access or deletion using the same email used for your order.
              </p>
              <Link
                href="/support"
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg
                           text-sm font-semibold text-white
                           bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                           hover:from-fuchsia-500 hover:to-indigo-500"
              >
                <Trash2 className="h-4 w-4" />
                Make a request
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
  // anchor id for sidebar links
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
