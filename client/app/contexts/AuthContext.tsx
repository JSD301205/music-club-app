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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);

        if (error.code === 'PGRST116') {
          console.warn('Profile not found for user, signing out...');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          return false;
        }

        setProfile(null);
        return false;
      }

      setProfile(data);
      return true;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
      return false;
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
        const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('getSession timeout')), ms));

        let session: Session | null = null;
        const attempts = [10000, 12000, 15000];

        for (let i = 0; i < attempts.length; i++) {
          try {
            const result = await Promise.race([supabase.auth.getSession(), timeoutPromise(attempts[i])]) as { data: { session: Session | null } };
            if (result?.data?.session) {
              session = result.data.session;
              break;
            }
          } catch (err) {
            console.warn(`getSession attempt ${i + 1} failed:`, err);
            if (i < attempts.length - 1) await new Promise(r => setTimeout(r, 500 * (i + 1)));
          }
        }

        if (!session) {
          console.error('Failed to retrieve session after retries.');
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          setHasInitialized(true);
          return;
        }

        setSession(session);

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          setHasInitialized(true);
          return;
        }

        setUser(user);

        if (user) {
          const profileFetchSuccess = await fetchProfile(user.id);
          if (!profileFetchSuccess) {
            console.warn('Profile fetch failed during initialization.');
          }
        }

        setLoading(false);
        setHasInitialized(true);
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
        setHasInitialized(true);
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
