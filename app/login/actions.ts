'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const companyName = formData.get('companyName') as string

  // 1. Create the user in Auth (This fires the trigger to create the Profile)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // Passed to trigger
    },
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: 'Failed to create user.' }

  // Generate a basic unique slug from the company name
  const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const slug = `${baseSlug}-${randomSuffix}`

  // 2. Create the Organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: companyName, slug })
    .select()
    .single()

  if (orgError) return { error: `Failed to create organization: ${orgError.message}` }

  // 3. Create the Admin Membership linking Profile <-> Organization
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      organization_id: orgData.id,
      profile_id: authData.user.id,
      role: 'admin',
    })

  if (membershipError) return { error: `Failed to set up membership: ${membershipError.message}` }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}