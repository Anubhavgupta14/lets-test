import { NextResponse } from 'next/server';

function decodeToken(token) {
  const payload = token.split('.')[1];
  const decoded = atob(payload);
  return JSON.parse(decoded);
}

export function middleware(req) {
  const token = req.cookies.get('token');

  console.log('Token:', token);

  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  try {
    const decoded = decodeToken(token.value);

    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Token decoding failed:', error);
    return NextResponse.redirect(new URL('/auth', req.url));
  }
}

export const config = {
  matcher: ['/','/invoices', '/invoices/new', '/invoices/[id]','/api/invoices'],
};
