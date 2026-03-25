"use client";
import { SessionProvider } from "next-auth/react";
import DevAutoAuth from "./DevAutoAuth";

const devAutoAuth = process.env.NEXT_PUBLIC_DEV_AUTO_AUTH === "true";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {devAutoAuth && <DevAutoAuth />}
      {children}
    </SessionProvider>
  );
}
