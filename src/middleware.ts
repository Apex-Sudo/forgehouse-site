export { auth as middleware } from "@/lib/auth";

export const config = {
  // Only run auth middleware on protected API routes
  // Chat routes handle auth optionally (anonymous still works)
  matcher: ["/api/conversations/:path*", "/api/insights/:path*"],
};
