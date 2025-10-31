import SignUpForm from '@/app/components/auth/SignUpForm'
import { Suspense } from 'react'

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic'

function SignUpFormWrapper() {
  return <SignUpForm />
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SignUpFormWrapper />
    </Suspense>
  )
}
