import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Protect dashboard and onboarding routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    const token = req.cookies.get('sb:token') || req.cookies.get('supabase-auth-token') || req.cookies.get('sb-access-token')
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*']
}
