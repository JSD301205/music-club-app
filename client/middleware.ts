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

  try {
    // Refresh session if expired - this updates cookies automatically
    const { data: { session } } = await supabase.auth.getSession()

    const url = request.nextUrl.clone()
    
    // Admin route protection - only allow admin role
    if (url.pathname.startsWith('/admin')) {
      if (!session?.user) {
        // Not logged in, redirect to login
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
      }
      
      // Get user metadata for role check (avoid database call)
      const userRole = session.user.user_metadata?.role || 
                       session.user.app_metadata?.role
      
      // If role not in metadata, check database as fallback
      if (!userRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (!profile || profile.role !== 'admin') {
          url.pathname = '/'
          return NextResponse.redirect(url)
        }
      } else if (userRole !== 'admin') {
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
    
    // Protected routes that require authentication
    const protectedRoutes = ['/settings', '/jam-board']
    
    // Check if it's the community list page (not individual profiles)
    const isCommunityListPage = url.pathname === '/community'
    const isCommunityMessagesPage = url.pathname.startsWith('/community/messages')
    
    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route)) || 
                            isCommunityListPage || 
                            isCommunityMessagesPage
    
    // If trying to access protected route without session, redirect to login
    if (isProtectedRoute && !session?.user) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    
    // If user is logged in and trying to access protected routes, check profile completion
    if (session?.user && isProtectedRoute) {
      // Always check is_profile_complete from database
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

    // If user is logged in and tries to access auth pages (login/signup), redirect appropriately
    if (session?.user && (url.pathname.startsWith('/auth/login') || url.pathname.startsWith('/auth/signup'))) {
      // Check if profile is complete
      const isProfileComplete = session.user.user_metadata?.is_profile_complete
      
      if (isProfileComplete === undefined) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('id', session.user.id)
          .single()
        
        // Redirect to setup if profile not complete, otherwise to community
        url.pathname = profile?.is_profile_complete ? '/community' : '/auth/setup-profile'
      } else {
        url.pathname = isProfileComplete ? '/community' : '/auth/setup-profile'
      }
      
      return NextResponse.redirect(url)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, let the request through - client-side will handle auth
    return response
  }
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
