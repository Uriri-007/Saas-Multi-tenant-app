import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function OrgDashboardPage({ 
  params 
}: { 
  params: Promise<{ orgSlug: string }> 
}) {
  // 1. Await the dynamic URL parameter (Next.js 15 requirement)
  const { orgSlug } = await params

  // 2. Initialize Supabase
  const supabase = await createClient()

  // 3. Fetch the organization matching the URL slug
  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single()

  // If the organization doesn't exist, Next.js handles the 404 cleanly
  if (error || !org) {
    notFound()
  }

  // 4. Render the Dashboard Page
  return (
    <div className="min-h-screen p-10 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-4xl font-extrabold mb-2">Welcome to {org.name}! 🚀</h1>
        <p className="text-gray-500 mb-8">
          Your workspace URL slug is: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">{org.slug}</span>
        </p>
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Backend Setup Complete!</h2>
          <p className="text-blue-600">
            You successfully registered a user, fired a database trigger to create a profile, provisioned a tenant workspace, assigned an admin role, generated a session cookie, and routed the user securely. Awesome job!
          </p>
        </div>
      </div>
    </div>
  )
}