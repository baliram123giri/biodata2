import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    if (isAuth) {
      // If logged in, redirect to dashboard immediately on the server
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    // If not logged in, allow displaying login page
    return NextResponse.next();
  }

  // For any other /admin/:path* routes
  if (!isAuth) {
    // If not logged in, redirect to login page
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Otherwise, let them proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*"
  ]
};
