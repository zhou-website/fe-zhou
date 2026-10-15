import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("zhou_auth_token")?.value;

    if (!token || token.trim() === "") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    const rawRole = request.cookies.get("zhou_user_role")?.value?.toLowerCase();

    // Client/User attempting to access admin or superadmin area
    if (rawRole === "user" && (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/superadmin"))) {
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }

    // Admin attempting to access superadmin-only management portal
    if (rawRole === "admin" && pathname.startsWith("/dashboard/superadmin")) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }

    // Superadmin accessing regular admin or client dashboard
    if (rawRole === "superadmin" && (pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/user"))) {
      return NextResponse.redirect(new URL("/dashboard/superadmin/perikatan", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
