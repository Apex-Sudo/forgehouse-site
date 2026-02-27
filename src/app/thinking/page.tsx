import Link from "next/link";

const posts = [
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
