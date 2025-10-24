import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  
  // Protected routes that require a complete profile
  const protectedRoutes = ['/community', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route))
  
  // If user is logged in and trying to access protected routes
  if (session?.user && isProtectedRoute) {
    // Check if profile is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_profile_complete')
      .eq('id', session.user.id)
      .single()
    
    // If no profile or profile not complete, redirect to setup
    if (!profile || !profile.is_profile_complete) {
      url.pathname = '/auth/setup-profile'
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in with complete profile and tries to access auth pages, redirect to community
  if (session?.user && (url.pathname.startsWith('/auth/login') || url.pathname.startsWith('/auth/signup'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_profile_complete')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.is_profile_complete) {
      url.pathname = '/community'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
