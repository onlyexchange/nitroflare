export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids") ?? "bitcoin";
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  const r = await fetch(url, {
    // ensure no static caching
    cache: "no-store",
    // (optional) also tell Next not to ISR-cache this fetch
    next: { revalidate: 0 },
  });

  const data = await r.json();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
