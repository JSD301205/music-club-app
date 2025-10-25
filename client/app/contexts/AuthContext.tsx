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
    // Use much longer timeout for production environments (Vercel has slower cold starts)
    const timeoutDuration = process.env.NODE_ENV === 'production' ? 30000 : 10000
    const timeout = setTimeout(() => {
      if (!hasInitialized) {
        console.warn('Auth loading timeout - forcing loading to false')
        console.warn('If you see this frequently, check Supabase connection and API performance')
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
    const initAuth = async () => {
      try {
        // Robust getSession with retries and exponential backoff to handle intermittent network/cold-starts
        const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('getSession timeout')), ms))

        let raceResult: any = null
        let session: any = null
        let sessionError: any = null

        const attempts = [10000, 12000, 15000] // timeouts per attempt (ms)
        for (let i = 0; i < attempts.length; i++) {
          try {
            const p = supabase.auth.getSession()
            raceResult = await Promise.race([p, timeoutPromise(attempts[i])]).catch((err) => ({ data: { session: null }, error: err }))
            if (raceResult && raceResult.data && raceResult.data.session) {
              session = raceResult.data.session
              sessionError = raceResult.error ?? null
              break
            } else {
              // record error and retry after a short backoff
              sessionError = raceResult?.error ?? new Error('no session')
              console.warn(`getSession attempt ${i + 1} failed:`, sessionError)
              // small backoff before next attempt
              if (i < attempts.length - 1) await new Promise(r => setTimeout(r, 500 * (i + 1)))
            }
          } catch (err) {
            sessionError = err
            console.error(`getSession attempt ${i + 1} error:`, err)
            if (i < attempts.length - 1) await new Promise(r => setTimeout(r, 500 * (i + 1)))
          }
        }

        // Fallback: try reading a cached session from localStorage if no session obtained

        // If still no session, try reading a cached session from localStorage as a last-resort fallback
        if (!session && typeof window !== 'undefined') {
          try {
            const ls = window.localStorage
            const found = []
            for (let i = 0; i < ls.length; i++) {
              const key = ls.key(i) || ''
              const val = ls.getItem(key)
              if (!val) continue
              // Heuristic: look for Supabase token objects
              if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
                try {
                  const parsed = JSON.parse(val)
                  // Typical Supabase storage contains currentSession or access_token
                  if (parsed?.currentSession || parsed?.access_token || parsed?.user) {
                    found.push(parsed)
                  }
                } catch (e) {
                  // ignore non-json
                }
              }
            }

            if (found.length > 0) {
              // Take the first plausible entry
              const p = found[0]
              session = p.currentSession ?? p
              // attempt to set a lightweight user object if present
              const fallbackUser = p.currentSession?.user ?? p.user ?? null
              if (fallbackUser) {
                setSession(session)
                setUser(fallbackUser)
                console.warn('Using fallback session from localStorage')
              }
            }
          } catch (e) {
            console.error('Error reading localStorage for session fallback:', e)
          }
        }
        
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
          
          setUser(user)
          
          if (user) {
            // Fetch profile with timeout protection
            // Use longer timeout in production due to cold starts
            const profileTimeoutDuration = process.env.NODE_ENV === 'production' ? 8000 : 5000
            
            // Use Promise.race to ensure we continue even if fetchProfile hangs
            Promise.race([
              fetchProfile(user.id),
              new Promise((resolve) => 
                setTimeout(() => {
                  console.warn('Profile fetch timeout - proceeding without profile')
                  setProfile(null)
                  resolve(null)
                }, profileTimeoutDuration)
              )
            ]).catch(err => {
              console.error('Error in profile fetch:', err)
              setProfile(null)
            })
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        
        // IMPORTANT: Set initialized immediately, don't wait for profile
        setLoading(false)
        setHasInitialized(true)
        clearTimeout(timeout)
      } catch (error) {
        console.error('Error in auth initialization:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
        setHasInitialized(true)
        clearTimeout(timeout)
      }
    }

    initAuth()

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
