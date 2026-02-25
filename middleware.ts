import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, isValidToken } from "@/lib/adminAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();
  
  // Always set pathname in headers for layouts to use
  response.headers.set("x-pathname", pathname);

  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPath && !isAdminApi) {
    return response;
  }

  // TEMPORARY: Allow all admin API routes without auth for testing
  if (isAdminApi) {
    return response;
  }

  // Allow login page
  if (pathname === "/admin/login") {
    return response;
  }

  // TEMPORARY: Allow all admin pages without auth for testing
  if (isAdminPath) {
    return response;
  }

  // Below code is temporarily disabled
  // Check for admin cookie (token)
  // const token = req.cookies.get(adminCookieName())?.value;
  // const isLoggedIn = token && isValidToken(token);

  // If on login page and already logged in, redirect to dashboard
  // if (pathname === "/admin/login" && isLoggedIn) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = "/admin";
  //   return NextResponse.redirect(url);
  // }

  // If not on login page and not logged in, redirect to login
  // if (pathname !== "/admin/login" && !isLoggedIn) {
  //   if (isAdminApi) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }
  //   const url = req.nextUrl.clone();
  //   url.pathname = "/admin/login";
  //   url.searchParams.set("next", pathname);
  //   return NextResponse.redirect(url);
  // }

  // Token exists, let it through
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
