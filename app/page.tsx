'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin,
  Zap,
  ShieldCheck,
  Rocket,
  Copy,
  QrCode,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

const COINGECKO_URL = "/api/price?ids=bitcoin";
const WALLETS_URL = "/api/next-btc-address";

export default function Home() {
  const [price, setPrice] = useState<number | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const priceRes = await fetch(COINGECKO_URL);
        const priceJson = await priceRes.json();
        setPrice(priceJson?.bitcoin?.usd ?? null);

        const walletRes = await fetch(WALLETS_URL);
        const walletJson = await walletRes.json();
        setWallet(walletJson?.address ?? null);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            NitroFlare
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-gray-300">
            Instant access to blazing fast Bitcoin payments. Secure, private, and lightning-powered.
          </p>
        </motion.div>

        {/* Live Price */}
        <motion.div
          className="mt-10 flex items-center space-x-3 text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Bitcoin className="text-yellow-400" />
          <span>
            1 BTC ={" "}
            {price ? `$${price.toLocaleString()}` : <span className="animate-pulse text-gray-500">Loading...</span>}
          </span>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {[
          { icon: Zap, title: "Lightning Fast", desc: "Transactions confirmed instantly over the Lightning Network." },
          { icon: ShieldCheck, title: "Secure", desc: "Your funds are protected by cutting-edge cryptography." },
          { icon: Rocket, title: "Global", desc: "Send and receive anywhere in the world 24/7." },
        ].map((f) => (
          <motion.div
            key={f.title}
            className="bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <f.icon className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-gray-400 mt-2">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-6 bg-gray-950/60 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Pricing Plans</h2>
        <p className="mt-3 text-gray-400">Choose a plan that fits your needs</p>
        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Starter",
              price: "Free",
              features: ["Basic transactions", "Community support"],
            },
            {
              name: "Pro",
              price: "$19/mo",
              features: ["Lightning fast payments", "Priority support", "Advanced analytics"],
            },
            {
              name: "Enterprise",
              price: "Custom",
              features: ["Dedicated node", "White-glove onboarding", "24/7 support"],
            },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-yellow-400">{plan.price}</p>
              <ul className="mt-4 text-gray-400 space-y-2">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-6 px-6 py-2 bg-yellow-500 text-black rounded-xl font-semibold hover:bg-yellow-400">
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">FAQ</h2>
        <div className="mt-10 space-y-6">
          {[
            {
              q: "How fast are NitroFlare payments?",
              a: "Payments are confirmed instantly using the Lightning Network.",
            },
            {
              q: "Is NitroFlare secure?",
              a: "Yes, all transactions use strong cryptography and decentralized protocols.",
            },
            {
              q: "Do you support global transactions?",
              a: "Absolutely! You can send and receive BTC worldwide, anytime.",
            },
          ].map((faq) => (
            <motion.div
              key={faq.q}
              className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-yellow-400 mt-1" />
                <div>
                  <h4 className="font-bold text-lg">{faq.q}</h4>
                  <p className="text-gray-400 mt-1">{faq.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Checkout */}
      <section className="py-20 px-6 text-center bg-gray-950/60">
        <h2 className="text-3xl md:text-4xl font-bold">Checkout</h2>
        <p className="mt-3 text-gray-400">Send Bitcoin to the address below to complete your order</p>
        <div className="mt-8">
          {wallet ? (
            <div className="inline-flex items-center space-x-3 bg-gray-800 px-5 py-3 rounded-xl">
              <span className="font-mono">{wallet}</span>
              <Copy
                className="cursor-pointer text-gray-400 hover:text-white"
                onClick={() => {
                  navigator.clipboard.writeText(wallet);
                  alert("Wallet copied!");
                }}
              />
              <QrCode className="text-gray-400" />
            </div>
          ) : (
            <span className="animate-pulse text-gray-500">Loading wallet…</span>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 border-t border-gray-800">
        <p>© {new Date().getFullYear()} NitroFlare. All rights reserved.</p>
      </footer>
    </main>
  );
}
