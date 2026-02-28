'use client'

import { useState } from 'react'
import { signIn, signUp } from './actions'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    
    // Call the respective Server Action
    const result = isSignUp ? await signUp(formData) : await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? 'Create your workspace' : 'Sign in to your account'}
        </h1>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Company Name</label>
                <input
                  name="companyName"
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Acme Corp"
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border rounded-md"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}