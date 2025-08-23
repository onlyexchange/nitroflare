'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeftRight, Search, ArrowRight, Home } from 'lucide-react';

const ALIASES: Record<string, string> = {
  // domain/slug → your canonical route
  '1fichier.com': '1fichier',
  'nitroflare.com': 'nitroflare',
  'rapidgator.net': 'rapidgator',
  'emload.com': 'emload',
  'daofile.com': 'daofile',
  'tezfiles.com': 'tezfiles',
  'alfafile.net': 'alfafile',
  'real-debrid.com': 'real-debrid',
  'filesfly.cc': 'filesfly',
  'ddownload.com': 'ddownload',
  'depositfiles.com': 'depositfiles',
  'drop.download': 'drop-download',
  'elitefile.net': 'elitefile',
  'ex-load.com': 'ex-load',
  'fastbit.cc': 'fastbit',
  'fastfile.cc': 'fastfile',
  'fboom.me': 'fboom',
  'fikper.com': 'fikper',
  'file.al': 'fileal',
  'filejoker.net': 'filejoker',
  'filesmonster.com': 'filesmonster',
  'filespace.com': 'filespace',
  'file-upload.org': 'file-upload',
  'flashbit.cc': 'flashbit',
  'gigapeta.com': 'gigapeta',
  'hitfile.net': 'hitfile',
  'hotlink.cc': 'hotlink',
  'jumploads.com': 'jumploads',
  'k2s.cc': 'k2s',
  'katfile.com': 'katfile',
  'kshared.com': 'kshared',
  'novafile.org': 'novafile',
  'rarefile.net': 'rarefile',
  'silkfiles.com': 'silkfiles',
  'subyshare.com': 'subyshare',
  'takefile.link': 'takefile',
  'turbobit.net': 'turbobit',
  'ubiqfile.com': 'ubiqfile',
  'uploady.io': 'uploady',
};

function normalizeHost(input: string) {
  try {
    const url = input.includes('http') ? new URL(input) : new URL(`https://${input}`);
    return url.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return input.replace(/^www\./i, '').toLowerCase();
  }
}

export default function NotFound() {
  const [host, setHost] = useState('');

  function goHost() {
    const key = normalizeHost(host);
    const slug = ALIASES[key];
    if (slug) window.location.href = `/${slug}`;
    else window.location.href = `/filehost`;
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white">
      {/* Soft brand glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-600/15 to-indigo-600/25 blur-3xl" />
        <div className="absolute bottom-[-30vh] right-[-10vw] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-fuchsia-600/10 to-purple-600/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" prefetch={false} className="flex items-center gap-2 group" aria-label="Only.Exchange — Home">
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl
                             bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500
                             text-white ring-1 ring-white/20 shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="font-semibold group-hover:text-white">Only.Exchange</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-6">
            <Home className="h-3.5 w-3.5" />
            Page not found (404)
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Can’t find that page.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400">
              Let’s get you to the right host.
            </span>
          </h1>

          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            Try jumping to a filehost directly, or browse them all with filters.
          </p>

          {/* Host finder */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full sm:w-[520px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Paste a link or type a host (e.g. rapidgator.net)"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && goHost()}
              />
            </div>
            <button
              onClick={goHost}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 inline-flex items-center gap-2 hover:from-fuchsia-400 hover:to-indigo-400"
            >
              Go <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Top sellers */}
          <div className="mt-10">
            <div className="text-sm uppercase tracking-wide text-white/60 mb-2">Top sellers</div>
            <div className="flex flex-wrap gap-2">
              <Link href="/filesfly" prefetch={false} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30">#1 FilesFly</Link>
              <Link href="/nitroflare" prefetch={false} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30">#2 NitroFlare</Link>
              <Link href="/rapidgator" prefetch={false} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30">#3 Rapidgator</Link>
              <Link href="/emload" prefetch={false} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30">#4 Emload</Link>
              <Link href="/daofile" prefetch={false} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30">#5 DaoFile</Link>
            </div>
          </div>

          {/* Browse all */}
          <div className="mt-8">
            <Link
              href="/filehost"
              prefetch={false}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 bg-white/5 hover:border-white/30"
            >
              View all filehosts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 text-xs text-white/60">
            Tip: If you landed here from an old link, try the host finder above.
          </div>
        </div>
      </main>
    </div>
  );
}
