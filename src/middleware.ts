import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (req.auth?.user as any)?.role;

    if (!req.auth?.user) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/conversations/:path*",
    "/api/insights/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
