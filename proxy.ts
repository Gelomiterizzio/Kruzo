import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED  = ['/dashboard', '/settings', '/favorites', '/notifications']
const ADMIN_ONLY = ['/admin']
const AUTH_ONLY  = ['/login', '/register', '/forgot-password']

// Next 16 "proxy" (formerly middleware). Uses `request.cookies` (synchronous),
// NOT `next/headers`. Security headers (incl. CSP) are set in next.config.mjs
// so they also cover statically-rendered pages, which a per-request nonce cannot.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session  = request.cookies.get('kruzo-session')
  const isAuthed = !!session?.value

  const isProtected = PROTECTED.some((r) => pathname.startsWith(r))
  const isAdmin      = ADMIN_ONLY.some((r) => pathname.startsWith(r))
  const isAuth       = AUTH_ONLY.some((r)  => pathname.startsWith(r))

  if ((isProtected || isAdmin) && !isAuthed) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  if (isAuth && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
