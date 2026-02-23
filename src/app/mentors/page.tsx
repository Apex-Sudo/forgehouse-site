"use client";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

const mentors = [
  {
    slug: "colin-chapman",
    name: "Colin Chapman",
    title: "Growth Strategist & Startup Mentor",
    tagline: "Cuts through noise to the one thing that moves the needle.",
  },
];

export default function MentorsPage() {
  return (
    <div className="pt-20 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Mentors</h1>
        <p className="text-muted text-lg mb-12">
          Every mentor on ForgeHouse has made the hard calls themselves. Their agents carry real frameworks, not theory.
        </p>

        <div className="grid gap-4">
          {mentors.map((m) => (
            <Link
              key={m.slug}
              href={`/mentors/${m.slug}`}
              className="group p-6 rounded-xl bg-card border border-border hover:border-amber/40 transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center text-lg font-bold text-amber">
                    {m.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold group-hover:text-amber transition">{m.name}</h2>
                    <p className="text-sm text-muted">{m.title}</p>
                  </div>
                </div>
                <p className="text-muted text-sm ml-16">{m.tagline}</p>
              </div>
              <IconArrowRight size={20} className="text-muted group-hover:text-amber transition shrink-0" />
            </Link>
          ))}
        </div>

        {/* Become a mentor CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted mb-4">Have frameworks worth preserving?</p>
          <Link href="/contribute" className="text-amber hover:underline font-medium">
            Contribute to ForgeHouse →
          </Link>
        </div>
      </div>
    </div>
  );
}
