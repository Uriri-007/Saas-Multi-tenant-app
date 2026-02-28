import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Define the expected page props
type PageProps = {
  params: Promise<{ orgSlug: string }>
}

export default async function OrganizationDashboardPage({ params }: PageProps) {
  // 1. Await params to get the slug (Required in Next.js 15+)
  const { orgSlug } = await params

  // 2. Initialize Supabase Server Client
  const supabase = await createClient()

  // 3. Fetch Organization Details
  // Assuming your table has 'id', 'name', 'slug', and 'logo_url'
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, logo_url')
    .eq('slug', orgSlug)
    .single()

  // BONUS: Handle "Company Not Found" or unauthorized access gracefully
  if (orgError || !org) {
    notFound()
  }

  // 4. Fetch Tasks for this specific organization
  // Assuming your tasks table has 'id', 'organization_id', 'title', and 'status'
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, status, created_at')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false }) // Show newest tasks first

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Dashboard Header */}
      <header className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Company Logo / Fallback */}
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {org.logo_url ? (
              <img 
                src={org.logo_url} 
                alt={`${org.name} logo`} 
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-400">
                {org.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
            <p className="text-sm text-gray-500">Workspace Dashboard</p>
          </div>
        </div>
        
        {/* Placeholder for a 'Create Task' button */}
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + New Task
        </button>
      </header>

      {/* Tasks Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Recent Tasks</h2>
        
        {tasksError && (
          <p className="text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
            Failed to load tasks. Please try again later.
          </p>
        )}

        {!tasksError && tasks?.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No tasks found for this organization.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <ul className="divide-y divide-gray-200">
              {tasks?.map((task) => (
                <li key={task.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{task.title}</span>
                    <span className="text-xs text-gray-500">
                      Added on {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Status Pill */}
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

    </div>
  )
}