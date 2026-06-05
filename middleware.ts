import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED  = ['/dashboard', '/settings', '/favorites', '/notifications']
const ADMIN_ONLY = ['/admin']
const AUTH_ONLY  = ['/login', '/register', '/forgot-password']

// Note: middleware uses `request.cookies` (synchronous), NOT `next/headers`.
// No changes needed here for the Next.js 16 async-APIs migration.
export function middleware(request: NextRequest) {
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
