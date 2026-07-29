import Link from "next/link";

/**
 * Rendered when a mentor has no published row in `mentor_landing_pages`.
 *
 * Lives in its own file so the page can call `notFound()` and return a real
 * HTTP 404 — previously this markup was returned inline from the page, which
 * served it with a 200 and let search engines index missing mentors as
 * legitimate pages.
 */
export default function MentorNotFound() {
  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">404</p>
          <h1 className="text-[44px] md:text-[64px] leading-[0.92] tracking-[-0.015em]">
            Mentor not found
          </h1>
          <Link
            href="/mentors"
            className="mono inline-flex items-center gap-3 mt-8 border border-border-light text-foreground px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition"
          >
            Browse all mentors
            <span aria-hidden="true">›</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
