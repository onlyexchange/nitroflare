import wallets from "@/data/bitcoin-wallets.json";
import { NextResponse } from "next/server";

let index = 0;

export async function GET() {
  const address = wallets.wallets[index % wallets.wallets.length];
  index++;
  return NextResponse.json({ address });
}
