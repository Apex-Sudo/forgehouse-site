import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import Google from "next-auth/providers/google";
import { supabase } from "./supabase";

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
  ],
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const provider = account?.provider ?? null;
      const providerAccountId = account?.providerAccountId ?? null;

      // Always upsert on email (the stable key across providers)
      // If LinkedIn, also store linkedin_id
      const upsertData: Record<string, unknown> = {
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        provider,
      };

      if (provider === "linkedin") {
        upsertData.linkedin_id = providerAccountId;
      }

      const { error } = await supabase
        .from("users")
        .upsert(upsertData, { onConflict: "email" });

      if (error) {
        console.error("Failed to upsert user:", error);
        return false;
      }

      return true;
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
