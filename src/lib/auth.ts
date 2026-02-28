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

      if (provider === "linkedin") {
        // Upsert keyed on linkedin_id
        const { error } = await supabase
          .from("users")
          .upsert(
            {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              provider,
              linkedin_id: providerAccountId,
            },
            { onConflict: "linkedin_id" }
          );

        if (error) {
          console.error("Failed to upsert user:", error);
          return false;
        }
      } else {
        // Google and other providers: upsert keyed on email
        const { error } = await supabase
          .from("users")
          .upsert(
            {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              provider,
              linkedin_id: null,
            },
            { onConflict: "email" }
          );

        if (error) {
          console.error("Failed to upsert user:", error);
          return false;
        }
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
