import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { supabase } from "./supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Upsert user to Supabase
      const { error } = await supabase
        .from("users")
        .upsert(
          {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            provider: account?.provider ?? null,
          },
          { onConflict: "email" }
        );

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
