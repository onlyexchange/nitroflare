// app/filehost/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Filter,
  Check,
  ArrowLeftRight,
  HelpCircle,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────────────────── */
type Pack = {
  label: string;
  priceUSD: number;
  wasUSD?: number;
  bandwidth?: string;
  planId?: string;
};
type Provider = {
  slug: string;
  name: string;
  status: 'live' | 'soon';
  blurb: string;
  cta?: string;
  monogram: string;
  vibe: { ring: string; chip: string; mono: string; glow: string };
  packs?: Pack[];
};

/* ── Alpha tabs helpers ─────────────────────────────────────────────────── */
const ALPHA_TABS = ['all', '0-9', 'A-D', 'E-H', 'I-L', 'M-P', 'Q-T', 'U-Z'] as const;
type AlphaTab = (typeof ALPHA_TABS)[number];

function inAlphaRange(name: string, tab: AlphaTab): boolean {
  if (tab === 'all') return true;
  const first = (name.trim()[0] || '').toUpperCase();
  if (tab === '0-9') return /[0-9]/.test(first);
  const [start, end] = tab.split('-') as [string, string];
  return first >= start && first <= end;
}

/* ── Data (your providers) ──────────────────────────────────────────────── */
const PROVIDERS: Provider[] = [
  {
    slug: '1fichier',
    name: '1Fichier.com',
    status: 'live',
    blurb: 'Premium GOLD keys — instant email delivery.',
    cta: 'Buy 1Fichier GOLD',
    monogram: '1F',
    vibe: {
      ring: 'from-amber-300/70 via-orange-400/60 to-amber-600/70',
      chip: 'from-amber-400 via-orange-500 to-amber-600',
      mono: 'from-amber-400 via-orange-500 to-amber-600',
      glow: 'shadow-[0_0_28px_rgba(251,146,60,0.28)]',
    },
    packs: [
      { label: '30 Days GOLD', planId: '1f-30', priceUSD: 7.0, wasUSD: 11.95 },
      { label: '1 Year GOLD', planId: '1f-365', priceUSD: 26.95, wasUSD: 44.95 },
      { label: '5 Years GOLD', planId: '1f-1825', priceUSD: 119.95, wasUSD: 199.95 },
    ],
  },
  {
    slug: 'nitroflare',
    name: 'NitroFlare.com',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy NitroFlare Premium',
    monogram: 'N',
    vibe: {
      ring: 'from-sky-400/70 via-cyan-500/60 to-blue-600/70',
      chip: 'from-sky-500 via-cyan-500 to-blue-600',
      mono: 'from-sky-500 via-cyan-500 to-blue-600',
      glow: 'shadow-[0_0_28px_rgba(56,189,248,0.28)]',
    },
    packs: [
      { label: '30 Days', planId: 'nf-30', priceUSD: 8.99, wasUSD: 15, bandwidth: '25 GB/day' },
      { label: '90 Days', planId: 'nf-90', priceUSD: 20.99, wasUSD: 35, bandwidth: '50 GB/day' },
      { label: '180 Days', planId: 'nf-180', priceUSD: 32.99, wasUSD: 55, bandwidth: '75 GB/day' },
      { label: '365 Days', planId: 'nf-365', priceUSD: 59.99, wasUSD: 100, bandwidth: '100 GB/day' },
    ],
  },
  {
    slug: 'rapidgator',
    name: 'Rapidgator.net',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy Rapidgator Premium',
    monogram: 'R',
    vibe: {
      ring: 'from-orange-500/70 via-amber-500/60 to-orange-600/70',
      chip: 'from-orange-500 via-amber-500 to-orange-600',
      mono: 'from-orange-600 via-amber-500 to-orange-400',
      glow: 'shadow-[0_0_28px_rgba(255,134,27,0.35)]',
    },
    packs: [
      { label: '30 Days', planId: 'rg-30', priceUSD: 10.49, wasUSD: 14.99, bandwidth: '1 TB Bandwidth / 1 TB Storage' },
      { label: '90 Days', planId: 'rg-90', priceUSD: 27.99, wasUSD: 39.99, bandwidth: '4 TB Bandwidth / 3 TB Storage' },
      { label: '180 Days', planId: 'rg-180', priceUSD: 34.99, wasUSD: 49.99, bandwidth: '6 TB Bandwidth / 6 TB Storage' },
      { label: '365 Days', planId: 'rg-365', priceUSD: 69.99, wasUSD: 99.99, bandwidth: '12 TB Bandwidth / 12 TB Storage' },
    ],
  },
  {
    slug: 'real-debrid',
    name: 'Real-Debrid.com',
    status: 'live',
    blurb: 'Multi-host premium — high-speed links from many filehosters.',
    cta: 'Buy Real-Debrid Premium',
    monogram: 'R',
    vibe: {
      ring: 'from-emerald-500/70 via-teal-500/60 to-sky-600/70',
      chip: 'from-emerald-500 via-teal-500 to-sky-600',
      mono: 'from-emerald-500 via-teal-500 to-sky-600',
      glow: 'shadow-[0_0_28px_rgba(45,212,191,0.28)]',
    },
    packs: [
      { label: '30 Days', planId: 'rd-30', priceUSD: 3.75, wasUSD: 4.95, bandwidth: 'Up to 2500 Mbps' },
      { label: '90 Days', planId: 'rd-90', priceUSD: 11.95, wasUSD: 14.95, bandwidth: 'Up to 2500 Mbps' },
      { label: '180 Days', planId: 'rd-180', priceUSD: 16.95, wasUSD: 18.95, bandwidth: 'Unlimited traffic*' },
      { label: '360 Days', planId: 'rd-360', priceUSD: 28.95, wasUSD: 34.95, bandwidth: 'Unlimited traffic*' },
    ],
  },
  {
    slug: 'filesfly',
    name: 'FilesFly.cc',
    status: 'live',
    blurb: 'Full-speed downloads, no ads or captchas — keys by email instantly. Includes 1TB storage.',
    cta: 'Buy FilesFly Premium',
    monogram: 'F',
    vibe: {
      ring: 'from-blue-600/70 via-blue-500/60 to-sky-400/70',
      chip: 'from-blue-700 via-blue-600 to-sky-500',
      mono: 'from-blue-700 via-blue-600 to-sky-500',
      glow: 'shadow-[0_0_28px_rgba(59,130,246,0.35)]',
    },
    packs: [
      { label: '31 Days', planId: 'ff-31', priceUSD: 21.0, wasUSD: 35.0, bandwidth: 'Includes 1TB storage' },
      { label: '110 Days', planId: 'ff-110', priceUSD: 66.0, wasUSD: 110.0, bandwidth: 'Includes 1TB storage' },
      { label: '180 Days', planId: 'ff-180', priceUSD: 87.0, wasUSD: 145.0, bandwidth: 'Includes 1TB storage' },
      { label: '365 Days', planId: 'ff-365', priceUSD: 150.0, wasUSD: 250.0, bandwidth: 'Includes 1TB storage' },
    ],
  },
  {
    slug: 'emload',
    name: 'Emload.com',
    status: 'live',
    blurb: 'Premium keys with instant email delivery.',
    cta: 'Buy Emload Premium',
    monogram: 'E',
    vibe: {
      ring: 'from-[#4DA0FF]/70 via-[#2E79F6]/60 to-[#035DE7]/70',
      chip: 'from-[#4DA0FF] via-[#2E79F6] to-[#035DE7]',
      mono: 'from-[#4DA0FF] via-[#2E79F6] to-[#035DE7]',
      glow: 'shadow-[0_0_28px_rgba(3,93,231,0.28)]',
    },
    packs: [
      { label: '30 Days', planId: 'em-30', priceUSD: 13.95, wasUSD: 19.95, bandwidth: '35 GB/day • 1 TB storage' },
      { label: '90 Days', planId: 'em-90', priceUSD: 34.95, wasUSD: 49.95, bandwidth: '35 GB/day • 1 TB storage' },
      { label: '180 Days', planId: 'em-180', priceUSD: 55.95, wasUSD: 79.95, bandwidth: '35 GB/day • 1 TB storage' },
      { label: '365 Days', planId: 'em-365', priceUSD: 83.95, wasUSD: 119.95, bandwidth: '35 GB/day • 1 TB storage' },
    ],
  },
  {
    slug: 'daofile',
    name: 'DaoFile.com',
    status: 'live',
    blurb: 'High-speed downloads — instant email delivery for premium keys.',
    cta: 'Buy DaoFile Premium',
    monogram: 'D',
    vibe: {
      ring: 'from-[#058CC2]/70 via-[#1E75BE]/60 to-[#2D58A7]/70',
      chip: 'from-[#058CC2] via-[#1E75BE] to-[#2D58A7]',
      mono: 'from-[#058CC2] via-[#1E75BE] to-[#2D58A7]',
      glow: 'shadow-[0_0_28px_rgba(5,140,194,0.28)]',
    },
    packs: [
      { label: '31 Days', planId: 'df-31', priceUSD: 12.99, wasUSD: 19.95, bandwidth: 'Up to 50 GB / 3 days' },
      { label: '90 Days', planId: 'df-90', priceUSD: 27.99, wasUSD: 39.95, bandwidth: 'Up to 50 GB / 3 days' },
      { label: '365 Days', planId: 'df-365', priceUSD: 59.99, wasUSD: 89.95, bandwidth: 'Up to 50 GB / 3 days' },
      { label: '999 Days', planId: 'df-999', priceUSD: 89.99, wasUSD: 129.95, bandwidth: 'Up to 50 GB / 3 days' },
    ],
  },
  {
    slug: 'tezfiles',
    name: 'TezFiles.com',
    status: 'live',
    blurb: 'Premium keys (20–150GB/day), ad-free, instant email delivery.',
    cta: 'Buy TezFiles Premium',
    monogram: 'T',
    vibe: {
      ring: 'from-amber-400/70 via-orange-500/60 to-[#ff861b]/70',
      chip: 'from-amber-500 via-orange-500 to-[#ff861b]',
      mono: 'from-amber-500 via-orange-500 to-[#ff861b]',
      glow: 'shadow-[0_0_28px_rgba(255,134,27,0.28)]',
    },
    packs: [
      { label: 'Premium Max — 30 Days', planId: 'tz-max-30', priceUSD: 27.95, wasUSD: 39.95, bandwidth: '150 GB/day' },
      { label: 'Premium Max — 90 Days', planId: 'tz-max-90', priceUSD: 66.45, wasUSD: 94.95, bandwidth: '150 GB/day' },
      { label: 'Premium Max — 365 Days', planId: 'tz-max-365', priceUSD: 139.95, wasUSD: 199.95, bandwidth: '150 GB/day' },
    ],
  },
  {
    slug: 'alfafile',
    name: 'Alfafile.net',
    status: 'live',
    blurb: 'Ad-free, full-speed downloads with direct links — instant key delivery.',
    cta: 'Buy Alfafile Premium',
    monogram: 'A',
    vibe: {
      ring: 'from-lime-400/70 via-sky-500/60 to-blue-700/70',
      chip: 'from-lime-500 via-sky-500 to-blue-700',
      mono: 'from-lime-500 via-sky-500 to-blue-700',
      glow: 'shadow-[0_0_28px_rgba(56,189,248,0.32)]',
    },
    packs: [
      { label: '30 Days', planId: 'af-30', priceUSD: 14.99, bandwidth: '1 TB bandwidth • 1 TB storage' },
      { label: '90 Days', planId: 'af-90', priceUSD: 39.99, bandwidth: '4 TB bandwidth • 3 TB storage' },
      { label: '180 Days', planId: 'af-180', priceUSD: 49.99, bandwidth: '6 TB bandwidth • 6 TB storage' },
      { label: '365 Days', planId: 'af-365', priceUSD: 99.99, bandwidth: '12 TB bandwidth • 12 TB storage' },
    ],
  },
  {
  slug: 'crockdown',
  name: 'CrockDown.com',
  status: 'live',
  blurb: '100 GB/day on all plans. No ads, no captchas — instant email delivery.',
  cta: 'Buy CrockDown Premium',
  monogram: 'C',
  vibe: {
    // blue-on-blue (distinct from NitroFlare’s cyan mix)
    ring: 'from-sky-500/70 via-blue-600/60 to-indigo-700/70',
    chip: 'from-sky-500 via-blue-600 to-indigo-700',
    mono: 'from-sky-500 via-blue-600 to-indigo-700',
    glow: 'shadow-[0_0_28px_rgba(37,99,235,0.30)]', // blue-600 glow
  },
  packs: [
    { label: '30 Days',  planId: 'cd-30',  priceUSD:  5.99, wasUSD:  9.99, bandwidth: '100 GB/day' },
    { label: '90 Days',  planId: 'cd-90',  priceUSD: 17.99, wasUSD: 24.99, bandwidth: '100 GB/day' },
    { label: '180 Days', planId: 'cd-180', priceUSD: 29.99, wasUSD: 49.99, bandwidth: '100 GB/day' },
    { label: '365 Days', planId: 'cd-365', priceUSD: 49.99, wasUSD: 74.99, bandwidth: '100 GB/day' },
  ],
},
{
  slug: 'dasan',
  name: 'Dasan.co',
  status: 'live',
  blurb: 'GB credit for multi-host premium links (40+ hosts).',
  cta: 'Buy Dasan Credits',
  monogram: 'D',
  vibe: {
    ring: 'from-[#1E2B6A]/70 via-[#24317A]/60 to-[#192766]/70',
    chip: 'from-[#1E2B6A] via-[#24317A] to-[#192766]',
    mono: 'from-[#1E2B6A] via-[#24317A] to-[#192766]',
    glow: 'shadow-[0_0_28px_rgba(30,43,106,0.28)]',
  },
  packs: [
    { label: '35 GB',   planId: 'ds-35',   priceUSD: 2.99,  bandwidth: 'Free daily quota: 0 MB • 30% off' },
    { label: '115 GB',  planId: 'ds-115',  priceUSD: 5.99,  bandwidth: 'Free daily quota: 300 MB • 30% off' },
    { label: '310 GB',  planId: 'ds-310',  priceUSD: 14.99, bandwidth: 'Free daily quota: 500 MB • 30% off' },
    { label: '1000 GB', planId: 'ds-1000', priceUSD: 33.00, bandwidth: 'Free daily 1.2 GB + 2 GB Usenet • 30% off' },
  ],
},
{
  slug: 'ddownload',
  name: 'DDownload.com',
  status: 'live',
  blurb: 'Unlimited speed and 200 GB/day — instant key delivery.',
  cta: 'Buy DDownload Premium',
  monogram: 'D',
  vibe: {
    ring: 'from-[#6ea0ff]/70 via-[#3562da]/60 to-[#153FA6]/70',
    chip: 'from-[#6ea0ff] via-[#3562da] to-[#153FA6]',
    mono: 'from-[#6ea0ff] via-[#3562da] to-[#153FA6]',
    glow: 'shadow-[0_0_28px_rgba(21,63,166,0.28)]',
  },
  packs: [
    { label: '1 Month',   planId: 'dd-30',  priceUSD: 14.99,                 bandwidth: '200 GB/day • parallel downloads' },
    { label: '6 Months',  planId: 'dd-180', priceUSD: 49.99,                 bandwidth: '200 GB/day • parallel downloads' },
    { label: '12 Months', planId: 'dd-365', priceUSD: 39.99, wasUSD: 69.99,  bandwidth: '200 GB/day • parallel downloads' },
  ],
},
{
  slug: 'depositfiles',
  name: 'DepositFiles.com',
  status: 'live',
  blurb: 'GOLD membership keys — instant email delivery.',
  cta: 'Buy DepositFiles GOLD',
  monogram: 'D',
  vibe: {
    ring: 'from-[#ff6a3d]/70 via-[#EF360E]/60 to-[#b51f02]/70',
    chip: 'from-[#ff6a3d] via-[#EF360E] to-[#b51f02]',
    mono: 'from-[#ff6a3d] via-[#EF360E] to-[#b51f02]',
    glow: 'shadow-[0_0_28px_rgba(239,54,14,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'dp-30',  priceUSD: 8.95,  wasUSD: 11.95 },
    { label: '90 Days',  planId: 'dp-90',  priceUSD: 12.95, wasUSD: 19.95 },
    { label: '180 Days', planId: 'dp-180', priceUSD: 29.95, wasUSD: 44.95 },
    { label: '365 Days', planId: 'dp-365', priceUSD: 49.95, wasUSD: 74.95 },
  ],
},
{
  slug: 'drop-download',
  name: 'Drop.Download',
  status: 'live',
  blurb: 'Premium PRO keys — unlimited storage, instant email delivery.',
  cta: 'Buy Drop.Download Premium',
  monogram: 'D',
  vibe: {
    // mint → cyan
    ring: 'from-[#36EEB0]/70 via-[#1CB8E8]/60 to-[#1CB8E8]/70',
    chip: 'from-[#36EEB0] via-[#1CB8E8] to-[#1CB8E8]',
    mono: 'from-[#36EEB0] via-[#1CB8E8] to-[#1CB8E8]',
    glow: 'shadow-[0_0_28px_rgba(28,184,232,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'dd-30',  priceUSD: 30.00,  bandwidth: 'Unlimited storage' },
    { label: '90 Days',  planId: 'dd-90',  priceUSD: 75.00,  bandwidth: 'Unlimited storage' },
    { label: '180 Days', planId: 'dd-180', priceUSD: 120.00, bandwidth: 'Unlimited storage' },
    { label: '365 Days', planId: 'dd-365', priceUSD: 200.00, bandwidth: 'Unlimited storage' },
  ],
},
{
  slug: 'elitefile',
  name: 'EliteFile.net',
  status: 'live',
  blurb: 'No waiting, unlimited downloads — 1 TB storage, 30 GB/day.',
  cta: 'Buy EliteFile Premium',
  monogram: 'E',
  vibe: {
    ring: 'from-[#953EFE]/70 via-[#B85CFF]/60 to-[#DA72FF]/70',
    chip: 'from-[#953EFE] via-[#B85CFF] to-[#DA72FF]',
    mono: 'from-[#953EFE] via-[#B85CFF] to-[#DA72FF]',
    glow: 'shadow-[0_0_28px_rgba(186,104,255,0.32)]',
  },
  packs: [
    { label: '30 Days',  planId: 'ef-30',  priceUSD: 36.00,  bandwidth: '30 GB/day • 1 TB storage' },
    { label: '90 Days',  planId: 'ef-90',  priceUSD: 96.00,  bandwidth: '30 GB/day • 1 TB storage' }, // popular
    { label: '180 Days', planId: 'ef-180', priceUSD: 180.00, bandwidth: '30 GB/day • 1 TB storage' },
    { label: '365 Days', planId: 'ef-365', priceUSD: 300.00, bandwidth: '30 GB/day • 1 TB storage' },
  ],
},
{
  slug: 'ex-load',
  name: 'Ex-Load.com',
  status: 'live',
  blurb: 'Sale pricing • instant email delivery • unlimited speed & storage.',
  cta: 'Buy Ex-Load Premium',
  monogram: 'E',
  vibe: {
    ring: 'from-[#C36259]/70 via-[#a85456]/60 to-[#64444B]/70',
    chip: 'from-[#C36259] via-[#a85456] to-[#64444B]',
    mono: 'from-[#C36259] via-[#a85456] to-[#64444B]',
    glow: 'shadow-[0_0_28px_rgba(195,98,89,0.28)]',
  },
  packs: [
    { label: '30 Days',          planId: 'xl-30',  priceUSD: 12.50, wasUSD: 34,   bandwidth: '1 TB total • 65 GB / 2 days' },
    { label: '90 Days',          planId: 'xl-90',  priceUSD: 29.99, wasUSD: 69,   bandwidth: '3 TB total • 65 GB / 2 days' },
    { label: '180 + 60 Days',    planId: 'xl-180', priceUSD: 79.99, wasUSD: 115,  bandwidth: '6 TB + 2 TB total • 65 GB / 2 days' },
    { label: '365 + 120 Days',   planId: 'xl-365', priceUSD: 99.99, wasUSD: 155,  bandwidth: '12 TB + 4 TB total • 65 GB / 2 days' },
  ],
},
{
  slug: 'fastbit',
  name: 'FastBit.cc',
  status: 'live',
  blurb: '50 GB/day, unlimited speed — instant key by email.',
  cta: 'Buy FastBit Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#05B565]/70 via-emerald-500/60 to-[#39505A]/70',
    chip: 'from-[#05B565] via-emerald-500 to-[#39505A]',
    mono: 'from-[#05B565] via-emerald-500 to-[#39505A]',
    glow: 'shadow-[0_0_28px_rgba(5,181,101,0.28)]',
  },
  packs: [
    { label: '1 Month',   planId: 'fb-30',  priceUSD: 14.95, wasUSD: 24.95, bandwidth: '50 GB/day' },
    { label: '3 Months',  planId: 'fb-180', priceUSD: 42.95, wasUSD: 49.95,                bandwidth: '50 GB/day' },
    { label: '1 Year',  planId: 'fb-365', priceUSD: 89.95,    wasUSD: 99.95,             bandwidth: '50 GB/day' },
  ],
},
{
  slug: 'fastfile',
  name: 'FastFile.cc',
  status: 'live',
  blurb: '150 GB/day • no delays or captchas — instant key by email.',
  cta: 'Buy FastFile Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#4692C3]/70 via-sky-400/60 to-[#4692C3]/70',
    chip: 'from-[#4692C3] via-sky-400 to-[#4692C3]',
    mono: 'from-[#4692C3] via-sky-400 to-[#4692C3]',
    glow: 'shadow-[0_0_28px_rgba(70,146,195,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'ff-30',  priceUSD: 11.95, wasUSD: 19.95, bandwidth: '150 GB/day' },
    { label: '90 Days',  planId: 'ff-90',  priceUSD: 42.95,                 bandwidth: '150 GB/day' },
    { label: '180 Days', planId: 'ff-180', priceUSD: 65.95,                 bandwidth: '150 GB/day' },
    { label: '365 Days', planId: 'ff-365', priceUSD: 95.95,                 bandwidth: '150 GB/day' },
  ],
},
{
  slug: 'fboom',
  name: 'Fboom.me',
  status: 'live',
  blurb: 'Fileboom Premium keys — up to 100GB/day. Instant email delivery.',
  cta: 'Buy Fboom Premium',
  monogram: 'F',
  // Charcoal/grey with orange highlight (#FFA648)
  vibe: {
    ring: 'from-zinc-700/70 via-zinc-800/60 to-zinc-900/70',
    chip: 'from-[#FFA648] via-[#FFA648] to-[#FFA648]', // solid
    mono: 'from-[#FFA648] via-[#FFA648] to-[#FFA648]', // solid
    glow: 'shadow-[0_0_28px_rgba(255,166,72,0.34)]',
  },
  packs: [
    // Show the Max tier first (homepage/filehost list will slice to 4)
    { label: 'Premium Max — 30 Days',  planId: 'fb-max-30',  priceUSD: 34.95,  wasUSD: 46.95,  bandwidth: '100 GB/day • Video streaming' },
    { label: 'Premium Max — 90 Days',  planId: 'fb-max-90',  priceUSD: 79.95,  wasUSD: 109.95, bandwidth: '100 GB/day • Video streaming' },
    { label: 'Premium Max — 365 Days', planId: 'fb-max-365', priceUSD: 199.95, wasUSD: 279.95, bandwidth: '100 GB/day • Video streaming' },
    { label: 'Premium — 30 Days',      planId: 'fb-prem-30', priceUSD: 28.95,                      bandwidth: '20 GB/day' },
  ],
},
{
  slug: 'fikper',
  name: 'Fikper.com',
  status: 'live',
  blurb: 'No-speed-limit downloads, no ads or queues — instant key delivery.',
  cta: 'Buy Fikper Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#0D47A1]/70 via-[#1565C0]/60 to-[#1E88E5]/70',
    chip: 'from-[#0D47A1] via-[#1565C0] to-[#1E88E5]',
    mono: 'from-[#0D47A1] via-[#1565C0] to-[#1E88E5]',
    glow: 'shadow-[0_0_28px_rgba(13,71,161,0.30)]',
  },
  packs: [
    { label: '30 Days',  planId: 'fk-30',  priceUSD: 19.95 },
    { label: '90 Days',  planId: 'fk-90',  priceUSD: 49.95 },
    { label: '180 Days', planId: 'fk-180', priceUSD: 89.95 },
    { label: '365 Days', planId: 'fk-365', priceUSD: 129.95 },
  ],
},
{
  slug: 'fileal',
  name: 'File.al',
  status: 'live',
  blurb: '4TB storage • 30GB/day • up to 100GB uploads — instant key delivery.',
  cta: 'Buy File.al Premium',
  monogram: 'F',
 vibe: {
    // subtle white/silver ring; works on dark home too
    ring: 'from-white via-zinc-100 to-zinc-200',
    // keep solid red accents for identity
    chip: 'from-red-600 via-red-600 to-red-600',
    mono: 'from-red-600 via-red-600 to-red-600',
    // ✨ white glow (not red)
    glow: 'shadow-[0_0_34px_rgba(255,255,255,0.45)]',
  },
  packs: [
    { label: '30 Days',        planId: 'fa-30',   priceUSD: 19.95, wasUSD: 29.95, bandwidth: '30 GB/day • 4 TB storage' },
    { label: '90 Days',        planId: 'fa-90',   priceUSD: 59.95,                  bandwidth: '30 GB/day • 4 TB storage' },
    { label: '365 Days',       planId: 'fa-365',  priceUSD: 99.95,                  bandwidth: '30 GB/day • 4 TB storage' },
    { label: '25 GB Traffic',  planId: 'fa-25gb', priceUSD: 17.95,                  bandwidth: 'One-time data' },
    { label: '50 GB Traffic',  planId: 'fa-50gb', priceUSD: 24.95,                  bandwidth: 'One-time data' },
    { label: '100 GB Traffic', planId: 'fa-100gb',priceUSD: 39.95,                  bandwidth: 'One-time data' },
  ],
},
{
  slug: 'filejoker',
  name: 'FileJoker.net',
  status: 'live',
  blurb: 'Premium & Premium VIP keys — instant email delivery.',
  cta: 'Buy FileJoker Premium',
  monogram: 'F',
  vibe: {
    // teal (Premium) → blue (VIP) → brand steel
    ring: 'from-[#1EB4AA]/70 via-[#5C98CA]/60 to-[#457299]/70',
    chip: 'from-[#1EB4AA] via-[#5C98CA] to-[#457299]',
    mono: 'from-[#1EB4AA] via-[#5C98CA] to-[#457299]',
    glow: 'shadow-[0_0_28px_rgba(92,152,202,0.28)]',
  },
  packs: [
    // Show Premium first so homepage/filehost grids (slice 0..4) display 30/90/180/365
    { label: 'Premium — 30 Days',  planId: 'fj-prem-30',  priceUSD: 18.95, wasUSD: 22.95 },
    { label: 'Premium — 90 Days',  planId: 'fj-prem-90',  priceUSD: 44.95 },
    { label: 'Premium — 180 Days', planId: 'fj-prem-180', priceUSD: 89.95 },
    { label: 'Premium — 365 Days', planId: 'fj-prem-365', priceUSD: 134.95 },

    // VIP tier
    { label: 'Premium VIP — 30 Days',  planId: 'fj-vip-30',  priceUSD: 29.95, wasUSD: 33.95 },
    { label: 'Premium VIP — 90 Days',  planId: 'fj-vip-90',  priceUSD: 73.95 },
    { label: 'Premium VIP — 180 Days', planId: 'fj-vip-180', priceUSD: 109.95 },
    { label: 'Premium VIP — 365 Days', planId: 'fj-vip-365', priceUSD: 169.95 },
  ],
},
{
  slug: 'filesmonster',
  name: 'FilesMonster.com',
  status: 'live',
  blurb: 'Unlimited speed, media streaming, instant start — keys by email.',
  cta: 'Buy FilesMonster Premium',
  monogram: 'F',
  // Light/glass page uses red accents — keep a rich red ring for the card
  vibe: {
    ring: 'from-rose-400/70 via-red-500/60 to-red-600/70',
    chip: 'from-rose-500 via-red-500 to-red-600',
    mono: 'from-rose-500 via-red-500 to-red-600',
    glow: 'shadow-[0_0_28px_rgba(244,63,94,0.28)]',
  },
  packs: [
    { label: '30 Days',  planId: 'fm-30',  priceUSD: 13.95, wasUSD: 17.00 },
    { label: '90 Days',  planId: 'fm-90',  priceUSD: 32.95, wasUSD: 37.00 },
    { label: '180 Days', planId: 'fm-180', priceUSD: 59.95, wasUSD: 66.00 },
    { label: '365 Days', planId: 'fm-365', priceUSD: 99.95, wasUSD: 116.00 },
  ],
},
{
  slug: 'filespace',
  name: 'Filespace.com',
  status: 'live',
  blurb: 'Ad-free, unlimited speed, direct links — instant key delivery.',
  cta: 'Buy Filespace Premium',
  monogram: 'F',
  vibe: {
    ring: 'from-[#52AEE0]/70 via-sky-400/60 to-[#8ABD3F]/70',
    chip: 'from-[#52AEE0] via-sky-500 to-[#8ABD3F]',
    mono: 'from-sky-500 via-[#52AEE0] to-[#8ABD3F]',
    glow: 'shadow-[0_0_28px_rgba(82,174,224,0.32)]',
  },
  packs: [
    { label: '30 Days',  planId: 'fs-30',  priceUSD: 9.95,  wasUSD: 15.95,  bandwidth: 'Unlimited speed • 500 GB storage' },
    { label: '90 Days',  planId: 'fs-90',  priceUSD: 14.95, wasUSD: 39.95,  bandwidth: 'Unlimited speed • 500 GB storage' },
    { label: '330 Days', planId: 'fs-330', priceUSD: 79.95, wasUSD: 117.95, bandwidth: 'Unlimited speed • 500 GB storage' },
  ],
},
{
  slug: 'file-upload',
  name: 'File-Upload.org',
  status: 'live',
  blurb: 'No waiting, unlimited speed, no ads — instant email delivery.',
  cta: 'Buy File-Upload Premium',
  monogram: 'F',
  vibe: {
    // blue highlight + orange CTA, on white-glass cards
    ring: 'from-[#2C82C9]/70 via-[#62A9DD]/60 to-[#FE5722]/70',
    chip: 'from-[#2C82C9] via-[#62A9DD] to-[#FE5722]',
    mono: 'from-[#2C82C9] via-[#62A9DD] to-[#FE5722]',
    glow: 'shadow-[0_0_28px_rgba(255,87,34,0.25)]',
  },
  packs: [
    { label: '7 Days',   planId: 'fu-7',   priceUSD: 5.95, wasUSD: 5.95 },
    { label: '30 Days',  planId: 'fu-30',  priceUSD: 16.95, wasUSD: 19.95 },
    { label: '90 Days',  planId: 'fu-90',  priceUSD: 24.95, wasUSD: 29.95 },
    { label: '180 Days', planId: 'fu-180', priceUSD: 49.95, wasUSD: 56.95 },
    { label: '365 Days', planId: 'fu-365', priceUSD: 89.95, wasUSD: 99.95 },
    { label: '730 Days', planId: 'fu-730', priceUSD: 129.95, wasUSD: 499.95 },
  ],
},
{
  slug: 'flashbit',
  name: 'FlashBit.cc',
  status: 'live',
  blurb: 'Premium MAX keys — instant delivery. No waiting, no ads, max speeds.',
  cta: 'Buy FlashBit Premium',
  monogram: 'F',
  vibe: {
    // Charcoal ring/mono to match the page bg; red chip as the accent
    ring: 'from-slate-600/70 via-slate-700/70 to-slate-800/70',
    chip: 'from-red-500 via-red-600 to-red-700',
    mono: 'from-slate-700 via-slate-800 to-gray-900',
    glow: 'shadow-[0_0_28px_rgba(15,23,42,0.35)]',
  },
  packs: [
    { label: 'Premium MAX — 30 Days',  planId: 'fb-30',  priceUSD: 12.50, wasUSD: 24.95 },
    { label: 'Premium MAX — 90 Days',  planId: 'fb-90',  priceUSD: 29.75, wasUSD: 59.95 },
    { label: 'Premium MAX — 180 Days', planId: 'fb-180', priceUSD: 49.95, wasUSD: 79.95 },
    { label: 'Premium MAX — 365 Days', planId: 'fb-365', priceUSD: 89.95, wasUSD: 110.00 },
  ],
},
{
  slug: 'gigapeta',
  name: 'GigaPeta.com',
  status: 'live',
  blurb: 'Unlimited speed & threads, direct links — 90GB traffic per 72h.',
  cta: 'Buy GigaPeta Premium',
  monogram: 'G',
  vibe: {
    // white-glass friendly greens
    ring: 'from-emerald-300/70 via-emerald-400/60 to-emerald-600/70',
    chip: 'from-[#66CC66] via-[#59c159] to-[#4fb74f]',
    mono: 'from-emerald-400 via-emerald-500 to-emerald-600',
    glow: 'shadow-[0_0_28px_rgba(102,204,102,0.28)]',
  },
  packs: [
    { label: '3 Days',    planId: 'gp-3',   priceUSD: 4.00 },
    { label: '1 Week',    planId: 'gp-7',   priceUSD: 5.00 },
    { label: '2 Weeks',   planId: 'gp-14',  priceUSD: 8.00 },
    { label: '1 Month',   planId: 'gp-30',  priceUSD: 13.00 },
    { label: '3 Months',  planId: 'gp-90',  priceUSD: 30.00 },
    { label: '6 Months',  planId: 'gp-180', priceUSD: 55.00 },
    { label: '1 Year',    planId: 'gp-365', priceUSD: 90.00 },
  ],
},

];

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function FilehostIndexPage({
  providers = (globalThis as any).PROVIDERS as Provider[] | undefined,
}: {
  providers?: Provider[];
}) {
  const ALL: Provider[] = providers ?? PROVIDERS;

  // UI state
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'soon'>('all');
  const [alpha, setAlpha] = useState<AlphaTab>('all');
  const [maxPrice, setMaxPrice] = useState<'any' | 10 | 25 | 50 | 100>('any');
  const [hasLongTerm, setHasLongTerm] = useState(false);
  const [hasStorage, setHasStorage] = useState(false);

  // Sticky controls state
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' } // header is h-16 (64px)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Always present results alphabetically by provider name
  const providersAlpha = useMemo(() => [...ALL].sort((a, b) => a.name.localeCompare(b.name)), [ALL]);

  // Search matcher
  function matchesSearch(p: Provider, q: string) {
    if (!q) return true;
    const s = q.toLowerCase();
    const base =
      p.name.toLowerCase().includes(s) ||
      p.slug.toLowerCase().includes(s) ||
      p.blurb.toLowerCase().includes(s);
    if (base) return true;
    return (p.packs ?? []).some(
      (pk) =>
        pk.label.toLowerCase().includes(s) ||
        String(pk.priceUSD).includes(s) ||
        (pk.bandwidth ?? '').toLowerCase().includes(s)
    );
  }

  // Feature toggles
  const longTermRegex = /(180|365|360|999|\byear\b|\byears\b)/i;

  const filtered = useMemo(() => {
    const q = query.trim();

    return providersAlpha
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => inAlphaRange(p.name, alpha))
      .filter((p) => matchesSearch(p, q))
      .filter((p) => {
        if (maxPrice === 'any') return true;
        return (p.packs ?? []).some((pk) => pk.priceUSD <= Number(maxPrice));
      })
      .filter((p) => {
        if (!hasLongTerm) return true;
        return (p.packs ?? []).some((pk) => longTermRegex.test(pk.label));
      })
      .filter((p) => {
        if (!hasStorage) return true;
        return (p.packs ?? []).some((pk) => (pk.bandwidth ?? '').toLowerCase().includes('storage'));
      });
  }, [providersAlpha, statusFilter, alpha, query, maxPrice, hasLongTerm, hasStorage]);

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Only.Exchange — Home" prefetch={false}>
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>

                 <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
  <Link href="/" className="hover:text-white">Home</Link>

  {/* Active: Filehost */}
  <span
    aria-current="page"
    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-white/15 bg-white/10"
    title="You are here"
  >
   
    <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-medium">
      Filehosts
    </span>
  </span>
</nav>
        </div>
      </header>

      {/* Hero / Title */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Filehosts
            <span className="ml-3 inline-block align-middle h-2 w-24 rounded-full bg-gradient-to-r from-fuchsia-500/70 via-purple-500/60 to-indigo-500/70" />
          </h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Browse all supported filehosts, compare plans, and jump straight to checkout. Powerful filters help you find
            the exact key you need.
          </p>
        </div>
      </section>

      {/* Sticky sentinel (invisible) */}
      <div ref={sentinelRef} aria-hidden className="h-0" />

      {/* Controls (sticky) */}
      <section
        className={`sticky top-16 z-40 border-t border-white/10
                    backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/20
                    transition-shadow ${stuck ? 'shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/10' : ''}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {/* Row 1: search + status + price */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hosts, plans, bandwidth…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none"
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'live' | 'soon')}
                className="sm:w-40 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white/80"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="live">Live</option>
                <option value="soon">Coming soon</option>
              </select>

              {/* Max price */}
              <select
                value={String(maxPrice)}
                onChange={(e) =>
                  setMaxPrice((e.target.value as any) === 'any' ? 'any' : (Number(e.target.value) as 10 | 25 | 50 | 100))
                }
                className="sm:w-44 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white/80"
                aria-label="Max price"
              >
                <option value="any">Any price</option>
                <option value="10">Under $10</option>
                <option value="25">Under $25</option>
                <option value="50">Under $50</option>
                <option value="100">Under $100</option>
              </select>
            </div>

            {/* Quick toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setHasLongTerm((v) => !v)}
                className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 ${
                  hasLongTerm ? 'border-fuchsia-400/60 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
                title="Show plans with 180/365/999 days or 'Year(s)'"
              >
                <Filter className="h-4 w-4" />
                Long-term plans
                {hasLongTerm && <Check className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setHasStorage((v) => !v)}
                className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 ${
                  hasStorage ? 'border-fuchsia-400/60 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
                title="Show plans that mention storage in benefits"
              >
                <Filter className="h-4 w-4" />
                Includes storage
                {hasStorage && <Check className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Row 2: Alpha tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ALPHA_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setAlpha(t)}
                className={`px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap ${
                  alpha === t ? 'border-fuchsia-400/60 bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
                aria-pressed={alpha === t}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No filehosts match your filters. Try clearing a filter or widening the price.
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((provider) => (
                <motion.div
                  key={provider.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-3xl p-[1.5px] bg-gradient-to-r ${provider.vibe.ring} ${provider.vibe.glow}`}
                >
                  <div className="rounded-[22px] bg-black/40 border border-white/10 p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Identity */}
                      <div className="flex items-center gap-4">
                        <span className={`inline-grid place-items-center h-10 w-10 rounded-xl text-sm font-bold bg-gradient-to-br ${provider.vibe.mono}`}>
                          {provider.monogram}
                        </span>
                        <div>
                          <div className="text-xl font-semibold">{provider.name}</div>
                          <p className="text-white/70 text-sm mt-0.5">{provider.blurb}</p>
                        </div>
                      </div>

                      {/* Status + CTA */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] tracking-wide uppercase px-2 py-1 rounded-md bg-gradient-to-r ${provider.vibe.chip}`}>
                          {provider.status === 'live' ? 'Live' : 'Coming Soon'}
                        </span>
                        {provider.status === 'live' ? (
                          <Link
                            href={`/${provider.slug}`}
                            prefetch={false}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 text-sm"
                          >
                            {provider.cta ?? 'View'}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/50 cursor-not-allowed"
                          >
                            Coming soon
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Packs */}
                    {!!provider.packs?.length && (
                      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {provider.packs.slice(0, 4).map((pk) => (
                          <Link
                            key={`${provider.slug}-${pk.label}`}
                            href={{ pathname: `/${provider.slug}`, query: { plan: pk.planId ?? pk.label } }}
                            prefetch={false}
                            aria-label={`Buy ${provider.name} ${pk.label}`}
                            className="block"
                          >
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition h-full">
                              <div className="text-sm font-medium text-white/90">{pk.label}</div>
                              <div className="mt-1 leading-tight">
                                {pk.wasUSD !== undefined && (
                                  <div className="text-xs text-white/50 line-through">${pk.wasUSD.toFixed(2)}</div>
                                )}
                                <div className="text-2xl font-bold">${pk.priceUSD.toFixed(2)}</div>
                              </div>
                              {pk.bandwidth && <div className="mt-2 text-xs text-white/60">{pk.bandwidth}</div>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
