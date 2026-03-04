import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "./supabase";
import { verifyCode } from "./verification";
import { captureServerEvent } from "./posthog";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const code = credentials?.code as string;
        if (!email || !code) return null;

        // Verify the 6-digit code
        const valid = await verifyCode(email.toLowerCase().trim(), code);
        if (!valid) return null;

        // Find or create user
        const { data: existing } = await supabase
          .from("users")
          .select("id, email, name")
          .eq("email", email.toLowerCase().trim())
          .single();

        if (existing) {
          return { id: existing.id, email: existing.email, name: existing.name };
        }

        // Create new user
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({ email: email.toLowerCase().trim(), provider: "email" })
          .select("id, email")
          .single();

        if (error || !newUser) return null;
        return { id: newUser.id, email: newUser.email, name: null };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        const provider = account?.provider ?? null;
        const providerAccountId = account?.providerAccountId ?? null;

        // Check if user exists
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (existing) {
          // Update existing user
          const updateData: Record<string, unknown> = {
            name: user.name ?? null,
            image: user.image ?? null,
            provider,
          };
          if (provider === "linkedin" && providerAccountId) {
            updateData.linkedin_id = providerAccountId;
          }

          await supabase
            .from("users")
            .update(updateData)
            .eq("id", existing.id);
        } else {
          // Insert new user
          const insertData: Record<string, unknown> = {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            provider,
          };
          if (provider === "linkedin" && providerAccountId) {
            insertData.linkedin_id = providerAccountId;
          }

          const { error } = await supabase
            .from("users")
            .insert(insertData);

          if (error) {
            console.error("Failed to insert user:", error);
            return false;
          }
        }

        // Track sign-in event
        captureServerEvent(user.email, "user_signed_in", {
          provider: account?.provider ?? "unknown",
          is_new_user: !existing,
        });

        return true;
      } catch (err) {
        console.error("Auth signIn error:", err);
        return false;
      }
    },
    async session({ session }) {
      // Attach Supabase user ID to session
      if (session.user?.email) {
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session.user as any).id = data.id;
        }
      }
      return session;
    },
  },
});
