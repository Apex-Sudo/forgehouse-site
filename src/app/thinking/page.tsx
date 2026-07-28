import Link from "next/link";

const posts = [
  {
    slug: "define-icp-jobs-to-be-done",
    title: "How to Define Your ICP When You Don't Have 100 Customers",
    excerpt: "Most ICP exercises produce something too vague to act on. Jobs-to-be-Done fixes that.",
    date: "March 2026",
  },
  {
    slug: "why-cold-emails-fail",
    title: "Why Your Cold Emails Don't Get Replies",
    excerpt: "The problem isn't your targeting or your subject line. It's the structure of the email itself.",
    date: "March 2026",
  },
  {
    slug: "why-deals-stall",
    title: "The One Reason Your Deals Keep Stalling",
    excerpt: "You treat each lost deal as a separate problem. That's the mistake.",
    date: "March 2026",
  },
  {
    slug: "weekly-outbound-plan",
    title: "How to Build an Outbound Plan You'll Actually Execute",
    excerpt: "Feast-or-famine is the default. Structure is the fix.",
    date: "March 2026",
  },
  {
    slug: "ai-vs-live-coaching",
    title: "When Your Mentor Can't Be in the Room",
    excerpt: "The best coaching happens between sessions. That's exactly when you're on your own.",
    date: "February 2026",
  },
  {
    slug: "you-got-promoted",
    title: "You Got Promoted. No One Trained You. Now What?",
    excerpt: "The skills that got you promoted are not the skills you need now. Nobody mentioned that during the congratulations.",
    date: "February 2026",
  },
  {
    slug: "executive-coaching-cost",
    title: "Executive Coaching Costs $300/Hour. Here's What You're Actually Paying For.",
    excerpt: "The price isn't the problem. The structure is.",
    date: "February 2026",
  },
  {
    slug: "sounding-board",
    title: "You Don't Need a Guru. You Need a Sounding Board.",
    excerpt: "The mentoring industry sells wisdom. What most people actually need is someone to think with.",
    date: "February 2026",
  },
  {
    slug: "skip-the-coach",
    title: "Skip the Coach. Find a Mentor Who's Done Your Job.",
    excerpt: "The coaching industry has professionalized advice-giving. That's the problem.",
    date: "February 2026",
  },
];

export default function ThinkingPage() {
  return (
    <main className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-16 md:pt-24 pb-24">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">Field notes</p>
          <h1 className="text-[56px] md:text-[88px] leading-[0.91] tracking-[-0.02em]">
            Thinking
          </h1>
          <p className="mt-5 text-[17px] text-muted max-w-[560px]">
            How we think about mentoring. Not content. Signal.
          </p>

          <div className="mt-14 border-t border-border">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/thinking/${post.slug}`}
                className="group block border-b border-border py-8 md:grid md:grid-cols-[140px_1fr] md:gap-10 md:items-baseline"
              >
                <time className="mono text-[11px] tracking-[0.06em] uppercase text-faint block mb-2 md:mb-0">
                  {post.date}
                </time>
                <div>
                  <h2 className="text-[26px] md:text-[30px] leading-[1.1] tracking-[-0.01em] text-foreground group-hover:text-accent transition">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-[16px] leading-[1.5] text-muted max-w-[560px]">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
