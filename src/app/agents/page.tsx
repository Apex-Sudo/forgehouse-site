import AgentCard from "@/components/AgentCard";

export default function AgentsPage() {
  return (
    <div className="pt-16">
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Agents</h1>
        <p className="text-muted text-lg mb-16">Each one forged by a founder. Each one thinks different.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AgentCard
            name="Apex"
            emoji="🔺"
            tagline="Trained by a founder who built across three continents. Gives you the question before the question."
            tags={["Strategy", "Decision-Making", "Founder Ops"]}
            price="Free during beta"
            href="/agents/apex"
          />
          <AgentCard name="" emoji="" tagline="Coming soon" tags={[]} price="" href="#" placeholder />
          <AgentCard name="" emoji="" tagline="Coming soon" tags={[]} price="" href="#" placeholder />
          <AgentCard name="" emoji="" tagline="Being forged..." tags={[]} price="" href="#" placeholder />
          <AgentCard name="" emoji="" tagline="Being forged..." tags={[]} price="" href="#" placeholder />
          <AgentCard name="" emoji="" tagline="Being forged..." tags={[]} price="" href="#" placeholder />
        </div>
      </section>
    </div>
  );
}
