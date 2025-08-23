// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redirects: Record<string, string> = {
  '/fileboom': '/fboom',
  '/dropdownload': '/drop-download',
  '/keep2share': '/k2s',
  '/k2s.cc': '/k2s',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const to = redirects[pathname.toLowerCase()];
  if (to) {
    const url = req.nextUrl.clone();
    url.pathname = to;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
