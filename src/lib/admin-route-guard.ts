import { auth } from "@/lib/auth";
import { isAdmin, isAdminOrMentor } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

/**
 * Middleware function to protect admin-only routes
 * Redirects to home page if user is not an admin
 */
export async function requireAdminRoute() {
  const session = await auth();
  
  if (!session?.user || !isAdmin(session)) {
    redirect("/");
  }
  
  return session;
}

/**
 * Middleware function to protect admin/mentor routes
 * Redirects to home page if user is neither admin nor mentor
 */
export async function requireAdminOrMentorRoute() {
  const session = await auth();
  
  if (!session?.user || !isAdminOrMentor(session)) {
    redirect("/");
  }
  
  return session;
}