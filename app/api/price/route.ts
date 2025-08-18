import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice/BTC.json");
  const data = await res.json();
  return NextResponse.json({ price: data.bpi.USD.rate });
}
