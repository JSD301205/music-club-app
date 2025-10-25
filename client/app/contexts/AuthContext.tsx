'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '../lib/supabase-client'
import { Profile } from '../types/database.types'

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const supabase = createClient()

  const fetchProfile = async (userId: string): Promise<boolean> => {
    try {
      // @ts-ignore - Supabase types
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, sign out the user
        if (error.code === 'PGRST116') {
          console.warn('Profile not found for user, signing out...')
          // Don't await signOut to prevent hanging
          supabase.auth.signOut().catch(e => console.error('Error during signOut:', e))
          setUser(null)
          setSession(null)
          setProfile(null)
          return false
        }
        
        // For other errors, just set profile to null but don't throw
        setProfile(null)
        return false
      }
      
      setProfile(data)
      return true
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
      return false
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // Safety timeout to ensure loading doesn't stay true forever (only if not initialized)
    // Use longer timeout for production environments (Vercel has slower cold starts)
    const timeoutDuration = process.env.NODE_ENV === 'production' ? 15000 : 10000
    const timeout = setTimeout(() => {
      if (!hasInitialized) {
        console.warn('Auth loading timeout - forcing loading to false')
        setLoading(false)
        setHasInitialized(true)
      }
    }, timeoutDuration)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured - auth will not work')
      setUser(null)
      setSession(null)
      setProfile(null)
      setLoading(false)
      setHasInitialized(true)
      clearTimeout(timeout)
      return () => {
        clearTimeout(timeout)
      }
    }

    // Get initial session and user
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      // console.log('AuthContext - Session loaded:', session ? 'exists' : 'none')
      
      // Handle session errors (like refresh_token_not_found)
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        // Clear invalid session
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        setHasInitialized(true)
        clearTimeout(timeout)
        return
      }
      
      setSession(session)
      
      if (session) {
        // Use getUser() for secure authentication verification
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          // If token is invalid, clear the session
          if (error.message?.includes('refresh_token') || error.message?.includes('Invalid')) {
            await supabase.auth.signOut().catch(e => console.error('Error signing out:', e))
          }
          setUser(null)
          setProfile(null)
          setLoading(false)
          setHasInitialized(true)
          clearTimeout(timeout)
          return
        }
        
        // console.log('AuthContext - Initial user:', user)
        setUser(user)
        
        if (user) {
          // Add timeout for fetchProfile to prevent hanging
          // Use longer timeout in production due to cold starts
          const profileTimeoutDuration = process.env.NODE_ENV === 'production' ? 8000 : 5000
          const profileTimeout = setTimeout(() => {
            console.warn('Profile fetch timeout - proceeding without profile')
            setProfile(null)
          }, profileTimeoutDuration)
          
          await fetchProfile(user.id).finally(() => clearTimeout(profileTimeout))
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
      setHasInitialized(true)
      clearTimeout(timeout)
    }).catch((error) => {
      console.error('Error getting session:', error)
      setUser(null)
      setLoading(false)
      setHasInitialized(true)
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // console.log('AuthContext - Auth state changed:', _event)
      setSession(session)
      
      if (session) {
        // Use getUser() for secure authentication verification
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        // console.log('AuthContext - Setting user to:', user)
        setUser(user)
        
        if (user) {
          // Add timeout for fetchProfile to prevent hanging
          // Use longer timeout in production due to cold starts
          const profileTimeoutDuration = process.env.NODE_ENV === 'production' ? 8000 : 5000
          const profileTimeout = setTimeout(() => {
            console.warn('Profile fetch timeout in auth change - proceeding without profile')
            setProfile(null)
          }, profileTimeoutDuration)
          
          fetchProfile(user.id).finally(() => clearTimeout(profileTimeout))
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
