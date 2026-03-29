import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public routes
  const publicPaths = ['/login', '/forgot-password', '/reset-password', '/auth/callback']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // CHANGE: Use 'const' here to fix the ESLint Error
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Use getSession for faster JWT-only validation
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  // --- Optimized Early Exit Logic ---

  // 1. User exists and path is private -> Success, move on
  if (user && !isPublicPath) {
    return supabaseResponse
  }

  // 2. No user and path is public -> Success, move on (to Login/Reset pages)
  if (!user && isPublicPath) {
    return supabaseResponse
  }

  // 3. No user and path is private -> Redirect to Login
  if (!user && !isPublicPath) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // 4. User exists but tries to access login/public path -> Redirect to Home
  if (user && isPublicPath) {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}