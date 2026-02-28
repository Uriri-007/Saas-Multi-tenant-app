import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create an unmodified response to pass down the chain
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Initialize Supabase Server Client for Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Update the response cookies
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Get the current user session
  // IMPORTANT: auth.getUser() is required here to securely validate and refresh the session
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 3. Extract the orgSlug using a Regular Expression
  // This matches paths like /dashboard/acme-corp or /dashboard/acme-corp/settings
  const dashboardTenantRegex = /^\/dashboard\/([^/]+)/
  const match = pathname.match(dashboardTenantRegex)

  // If the user is trying to access a tenant-specific dashboard route
  if (match) {
    const orgSlug = match[1]

    // If no user is logged in, redirect to login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      // Optional: Pass the intended URL to redirect back after login
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 4. Check Organization Access
    // Because you enabled RLS on the `organizations` table in Phase 1 to ONLY allow
    // SELECT if an entry exists in `memberships`, we just need to query the organization.
    // If the user is NOT a member, RLS blocks the read, and this returns a null/error.
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    // If RLS blocked the query (or the slug doesn't exist), redirect the user
    if (error || !organization) {
      // You could redirect to a /404 or /unauthorized page, but per instructions:
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } 
  // Fallback: Protect the base /dashboard route if they navigate there without a slug
  else if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. Allow request to proceed if checks pass
  return supabaseResponse
}

// 6. Optimize Middleware Execution
// Only run middleware on relevant paths (ignore static files, images, etc.)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}