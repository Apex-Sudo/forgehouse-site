"use client";
import Image from "next/image";
import { useState } from "react";

/**
 * Expert portrait with a graceful fallback.
 *
 * Some mentors store a LinkedIn CDN avatar, and those URLs carry an expiry
 * (`?e=…`). Once it lapses the image 404s, which would otherwise render as
 * broken-image alt text on the card. Falling back to an initials plate keeps
 * the grid intact.
 */
export default function ExpertPhoto({
  src,
  name,
  className = "",
  sizes,
  rounded = false,
}: {
  src?: string | null;
  name: string;
  className?: string;
  sizes?: string;
  rounded?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-light text-muted select-none ${rounded ? "rounded-full" : ""} ${className}`}
        aria-label={name}
      >
        <span className="text-[1.6em] leading-none tracking-[0.04em]">{initials}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes={sizes}
      onError={() => setFailed(true)}
      className={`object-cover object-top ${rounded ? "rounded-full" : ""} ${className}`}
    />
  );
}
