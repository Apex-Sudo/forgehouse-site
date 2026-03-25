"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";

const DEV_EMAIL = "kyle@forgehouse.io";
const DEV_CODE = "000000";

export default function DevAutoAuth() {
  const { status } = useSession();
  const attempted = useRef(false);

  useEffect(() => {
    if (status !== "unauthenticated" || attempted.current) return;
    attempted.current = true;

    signIn("credentials", {
      email: DEV_EMAIL,
      code: DEV_CODE,
      redirect: false,
    }).then((res) => {
      if (res?.ok) {
        window.location.reload();
      }
    });
  }, [status]);

  return null;
}
