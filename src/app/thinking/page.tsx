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
    <main className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Thinking</h1>
        <p className="text-muted mb-16 text-lg">
          How we think about mentoring. Not content. Signal.
        </p>

        <div className="flex flex-col gap-12">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/thinking/${post.slug}`}
              className="group block"
            >
              <time className="text-sm text-muted/60">{post.date}</time>
              <h2 className="text-xl font-semibold mt-1 group-hover:text-amber transition">
                {post.title}
              </h2>
              <p className="text-muted mt-2">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
