// types/product.ts
export type Vibe = { ring: string; glow: string; chip: string; mono: string };
export type Sku = {
  id: string; label: string; priceUSD: number; wasUSD?: number;
  bullets?: string[]; type?: string; region?: string; durationDays?: number;
};
export type Product = {
  slug: string; name: string; blurb?: string; monogram?: string;
  vendor?: string; category?: string; status?: 'live'|'soon';
  features?: string[]; vibe?: Partial<Vibe>; skus: Sku[];
};
