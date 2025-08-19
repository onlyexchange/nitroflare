// app/api/price/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';  // never prerender; avoids build-time fetch
export const runtime = 'edge';           // fast on Vercel Edge (optional)

// Default coins we care about if ?ids= is not provided
const DEFAULT_IDS = [
  'bitcoin',        // BTC
  'ethereum',       // ETH
  'solana',         // SOL
  'binancecoin',    // BNB
  'litecoin',       // LTC
  'tether',         // USDT
  'usd-coin',       // USDC
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');
    const ids = idsParam
      ? idsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : DEFAULT_IDS;

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids.join(',')
    )}&vs_currencies=usd`;

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'accept': 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `coingecko_${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
