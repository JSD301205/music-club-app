import { createClient } from '@/app/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin))
    }

    if (session?.user) {
      // Check if profile exists and is complete
      // @ts-ignore - Supabase types
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_profile_complete, username')
        .eq('id', session.user.id)
        .single()

      const userProfile = profile as any

      // If no profile exists, create one with data from OAuth provider
      if (profileError?.code === 'PGRST116') {
        const username = session.user.user_metadata?.preferred_username 
          || session.user.user_metadata?.user_name
          || session.user.email?.split('@')[0]
          || `user_${session.user.id.slice(0, 8)}`

        const fullName = session.user.user_metadata?.full_name 
          || session.user.user_metadata?.name
          || username

        const avatarUrl = session.user.user_metadata?.avatar_url 
          || session.user.user_metadata?.picture
          || null

        const profileData = {
          id: session.user.id,
          username: username,
          full_name: fullName,
          avatar_url: avatarUrl,
          is_profile_complete: false,
        }

        // @ts-ignore - Supabase types
        const { error: insertError } = await (supabase as any)
          .from('profiles')
          .insert(profileData)

        if (insertError) {
          console.error('Error creating profile:', insertError)
        }

        // Redirect to profile setup since it's a new OAuth user
        return NextResponse.redirect(new URL('/auth/setup-profile', requestUrl.origin))
      }

      // If profile exists but is not complete, redirect to setup
      if (!userProfile?.is_profile_complete) {
        return NextResponse.redirect(new URL('/auth/setup-profile', requestUrl.origin))
      }

      // Profile is complete, redirect to community
      return NextResponse.redirect(new URL('/community', requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
