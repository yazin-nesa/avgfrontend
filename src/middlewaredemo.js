// import { NextResponse } from 'next/server'

// // This middleware runs on the edge
// export function middleware(request) {
//   const { pathname } = request.nextUrl
//   const token = request.cookies.get('token')?.value
  
//   // Define public routes that don't require authentication
//   const publicRoutes = ['/login', '/forgot-password', '/reset-password']
//   const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
//   // Redirect to login if accessing protected route without a token
//   if (!token && !isPublicRoute) {
//     return NextResponse.redirect(new URL('/login', request.url))
//   }
  
//   // Redirect to dashboard if accessing login page with a token
//   if (token && pathname === '/login') {
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }
  
//   return NextResponse.next()
// }

// // Specify which paths the middleware should be invoked on
// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)',
//   ],
// }