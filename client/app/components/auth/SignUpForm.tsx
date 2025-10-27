'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaGoogle, FaGithub, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import RoleSelector from './RoleSelector'
import { UserRole } from '@/app/types/database.types'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle()

      // Only error if it's NOT a "no rows" error
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        setError('Username already taken')
        setLoading(false)
        return
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            full_name: fullName,
            is_profile_complete: false,
            role: role,
          },
        },
      })

      if (error) throw error

      // Replace the profile creation section in SignUpForm.tsx with this:

    if (data.user) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      // Only create profile if it doesn't exist
      if (!existingProfile) {
        const profileData = {
          id: data.user.id,
          username: username.toLowerCase(),
          full_name: fullName,
          is_profile_complete: false,
          role: role,
          is_visible_in_community: role === 'member',
          allow_messages_from: 'members_only' as const,
          instruments: [],
          musical_interests: [],
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData as any)

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

        // Update user metadata to include role for middleware checks
      await supabase.auth.updateUser({
        data: {
          username: username.toLowerCase(),
          full_name: fullName,
          is_profile_complete: false,
          role: role,
        },
      })

      // Redirect to profile setup
      router.push('/auth/setup-profile')
    }
    } catch (error: any) {
      // Show a user-friendly message if email is not confirmed
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        setError('Verify your email first')
      } else {
        setError(error.message || 'An error occurred during signup')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Join the Music Community
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-purple-400 hover:text-purple-300">
              sign in to your account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Username (cannot be changed later)"
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  title="Username can only contain letters, numbers, and underscores"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Password (min. 6 characters)"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <RoleSelector selectedRole={role} onRoleChange={setRole} />

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={true}
              className="relative w-full inline-flex justify-center items-center py-3 px-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800/30 text-sm font-medium text-gray-500 cursor-not-allowed transition-all opacity-60"
            >
              <FaGoogle className="h-5 w-5" />
              <span className="ml-2">Google</span>
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                Soon
              </span>
            </button>

            <button
              type="button"
              disabled={true}
              className="relative w-full inline-flex justify-center items-center py-3 px-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800/30 text-sm font-medium text-gray-500 cursor-not-allowed transition-all opacity-60"
            >
              <FaGithub className="h-5 w-5" />
              <span className="ml-2">GitHub</span>
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                Soon
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
