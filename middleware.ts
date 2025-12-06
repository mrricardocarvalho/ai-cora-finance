import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Allow static assets, API routes and public auth routes to pass through
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Create response to allow cookie manipulation
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Check Supabase configuration
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Missing config - redirect to login with error indicator
    if (process.env.NODE_ENV !== 'production') {
      console.warn('middleware: Missing Supabase configuration')
    }
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'config')
    return NextResponse.redirect(url)
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh session if exists - this is important for keeping the session alive
  const { data: { user }, error } = await supabase.auth.getUser()

  // Dev logging
  if (process.env.NODE_ENV !== 'production') {
    console.debug('middleware: pathname=', pathname, 'user=', user?.id || 'none', 'error=', error?.message || 'none')
  }

  // Protect all routes except login/auth - redirect to login if not authenticated
  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|auth|manifest.json|sw.js|icons|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
