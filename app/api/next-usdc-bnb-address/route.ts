// app/api/next-usdc-bnb-address/route.ts   (BEP-20)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import wallets from "../../../data/usdc-bnb-wallets.json";

export async function GET() {
  const arr: string[] = Array.isArray((wallets as any)?.wallets) ? (wallets as any).wallets : [];
  const addr = arr.length ? arr[Math.floor(Math.random() * arr.length)] : "";
  return NextResponse.json({ address: addr || null });
}
