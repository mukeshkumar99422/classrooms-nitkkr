import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public routes
  const publicPaths = ['/login', '/forgot-password', '/reset-password', '/auth/callback']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Initialize Supabase Response
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Use getSession for faster JWT-only validation during navigation
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // --- YOUR PROPOSED IMPROVEMENTS ---

  // 1. User exists and accessing private area -> Proceed immediately
  if (user && !isPublicPath) {
    return supabaseResponse
  }

  // 2. No user and accessing login/public page -> Proceed immediately
  if (!user && isPublicPath) {
    return supabaseResponse
  }

  // 3. No user and trying to access private area -> Redirect to login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Edge Case: User exists but tries to go to /login -> Redirect to Home
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}