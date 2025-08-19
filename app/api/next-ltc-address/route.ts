// app/api/next-ltc-address/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import wallets from "../../../data/litecoin-wallets.json";

export async function GET() {
  const arr: string[] = Array.isArray((wallets as any)?.wallets) ? (wallets as any).wallets : [];
  const addr = arr.length ? arr[Math.floor(Math.random() * arr.length)] : "";
  return NextResponse.json({ address: addr || null });
}
