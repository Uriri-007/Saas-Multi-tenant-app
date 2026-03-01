import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function BaseDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the first organization the user is a member of
  const { data: membership } = await supabase
    .from('memberships')
    .select('organizations(slug)')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  // Extract the slug safely based on your relationship setup
  // @ts-ignore - Sometimes Supabase TS types get confused on nested joins
  const orgSlug = membership?.organizations?.slug

  if (orgSlug) {
    // Redirect them into their tenant workspace!
    redirect(`/dashboard/${orgSlug}`)
  } else {
    // Edge case: They have no memberships (maybe prompt them to create one)
    return (
      <div className="p-10 text-center">
        <h1>Welcome! You don't belong to any workspaces yet.</h1>
      </div>
    )
  }
}