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
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      // @ts-ignore - Supabase types
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, sign out the user
        if (error.code === 'PGRST116') {
          console.warn('Profile not found for user, signing out...')
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
          setProfile(null)
          return
        }
        throw error
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // Safety timeout to ensure loading doesn't stay true forever
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing loading to false')
        setLoading(false)
      }
    }, 3000)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured - auth will not work')
      setUser(null)
      setSession(null)
      setProfile(null)
      setLoading(false)
      clearTimeout(timeout)
      return () => {
        clearTimeout(timeout)
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext - Session loaded:', session ? 'exists' : 'none')
      const newUser = session?.user ?? null
      console.log('AuthContext - Initial user:', newUser)
      setSession(session)
      setUser(newUser)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
      clearTimeout(timeout)
    }).catch((error) => {
      console.error('Error getting session:', error)
      setUser(null)
      setLoading(false)
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthContext - Auth state changed:', _event, session)
      const newUser = session?.user ?? null
      console.log('AuthContext - Setting user to:', newUser)
      setSession(session)
      setUser(newUser)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
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
