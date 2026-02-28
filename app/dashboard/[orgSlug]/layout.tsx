import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

type OrgLayoutProps = {
  children: ReactNode
  // Next.js 15: params is a Promise
  params: Promise<{ orgSlug: string }> 
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  // 1. Await the params to extract the orgSlug
  const { orgSlug } = await params

  // 2. Initialize Supabase Server Client
  const supabase = await createClient()

  // 3. Fetch current user (Guaranteed to exist by middleware, but good for linking profile)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 4. Fetch Organization & Profile Data concurrently for the UI
  const [
    { data: org }, 
    { data: profile }
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('name, slug')
      .eq('slug', orgSlug)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
  ])

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          {/* Display Organization Name */}
          <span className="font-bold text-lg truncate">
            {org?.name || 'Workspace'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Tenant-Scoped Links */}
          <Link 
            href={`/dashboard/${orgSlug}`}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            href={`/dashboard/${orgSlug}/team`}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Team Members
          </Link>
          <Link 
            href={`/dashboard/${orgSlug}/settings`}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Settings
          </Link>
        </nav>

        {/* User Profile Section at Bottom of Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || user.email?.charAt(0)
              )}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on larger screens) */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <span className="font-bold text-lg truncate">{org?.name}</span>
          {/* Add a mobile menu button here if needed */}
        </header>

        {/* Render the specific page content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>

    </div>
  )
}