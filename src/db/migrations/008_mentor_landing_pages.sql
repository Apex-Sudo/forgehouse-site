-- Mentor landing page content (separate from mentors table; join by slug at read time)
CREATE TABLE IF NOT EXISTS mentor_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_landing_pages_published
  ON mentor_landing_pages (published)
  WHERE published = true;

-- Seed Colin Chapman (matches prior MARKETING_EXTRAS["colin-chapman"])
INSERT INTO mentor_landing_pages (slug, content, published)
VALUES (
  'colin-chapman',
  $json${
    "heroDescription": "An AI agent built from 26 years of B2B deal-making. It diagnoses your outbound, maps your buyer psychology, and builds the playbook. Available now, not in 3 weeks when a calendar slot opens.",
    "heroQuote": "The message has to be about the buyer\u2019s problem, not the seller\u2019s solution.",
    "highlights": [
      { "label": "26 years in B2B sales" },
      { "label": "15 years in business development" },
      { "label": "Built from real session transcripts" },
      { "label": "4.92 on GrowthMentor" }
    ],
    "sessions": [
      {
        "num": "01",
        "title": "Your outbound isn\u2019t converting",
        "desc": "It\u2019s usually a process problem, not a sales problem. Colin starts with your market position, ICP clarity, and current activity before prescribing anything. Most founders skip this step entirely."
      },
      {
        "num": "02",
        "title": "Your messaging is about your product",
        "desc": "That\u2019s the problem. The Jobs-to-be-Done framework maps what buyers actually care about across three layers: functional, social, and emotional. Most founders only address the first."
      },
      {
        "num": "03",
        "title": "Your knowledge is in your head, not a system",
        "desc": "The founder closes deals because they\u2019ve lived every problem the product solves. The rep can\u2019t. Colin translates that knowledge into a playbook your team runs without you."
      }
    ],
    "problemSubtitle": "Founders come in with a territory. They leave with a system their team runs without them.",
    "pillars": [
      {
        "title": "Diagnoses first",
        "desc": "Assesses commoditization, ICP clarity, and current process before giving advice. Won\u2019t give advice until he understands your situation."
      },
      {
        "title": "Pushes back",
        "desc": "If your ICP is \"anyone,\" he\u2019ll tell you. If your sequence is too long, he\u2019ll cut it. Consultative means prepared to challenge your thinking."
      },
      {
        "title": "Buyer psychology, not templates",
        "desc": "Uses the Jobs-to-be-Done framework across functional, social, and emotional layers. Maps what buyers care about before a word of copy gets written."
      }
    ],
    "pillarSubtitle": "Built from structured extraction sessions and 26 years of closed deals. Not a chatbot with a sales prompt. A system that reasons the way Colin does.",
    "tryItHeading": "Find out what\u2019s blocking your pipeline",
    "reviews": [
      {
        "quote": "Colin gave direct, practical advice and adapted quickly to my context. What I valued most was his focus on trigger-based outreach, low-friction CTAs, and earning the right to ask for a meeting instead of forcing it in message one.",
        "author": "Leon Freier",
        "role": "Founder, ApexAlpha",
        "featured": true
      },
      {
        "quote": "Covered a LOT of ground. Improved my cold call opener to giving more context, and opening with a qualifying question. Went overtime quite a bit, and he was gracious and keen to continue.",
        "author": "Liam",
        "role": "GrowthMentor session"
      },
      {
        "quote": "Colin gave concrete, actionable advice on how to improve my outbound sales, especially around cold outreach, refining my ICP, and aligning my messaging to real client problems. I left feeling like he was genuinely invested in my success.",
        "author": "Luis Cinza",
        "role": "GrowthMentor session"
      },
      {
        "quote": "Colin galvanised me to pick up the phone and start calling prospects. He gave me very actionable tips to solve the outreach challenge my startup is going through. Highly recommend.",
        "author": "Nimit B",
        "role": "GrowthMentor session"
      }
    ],
    "reviewRating": "4.92",
    "reviewSource": {
      "label": "on GrowthMentor"
    },
    "companies": [
      { "src": "/companies/ibm.svg", "alt": "IBM", "h": "h-7" },
      { "src": "/companies/siemens.svg", "alt": "Siemens", "h": "h-10" },
      { "src": "/companies/bmw.svg", "alt": "BMW", "h": "h-9" },
      { "src": "/companies/unifi.svg", "alt": "UNIFI", "h": "h-6" },
      { "src": "/companies/rain-group.png", "alt": "RAIN Group", "h": "h-7" },
      { "src": "/companies/x-idian.svg", "alt": "X-idian", "h": "h-6" },
      { "src": "/companies/smart-freight.svg", "alt": "Smart Freight Centre", "h": "h-7" },
      { "src": "/companies/tq-therapeutics.png", "alt": "TQ Therapeutics", "h": "h-7" }
    ],
    "externalLink": {
      "label": "View LinkedIn Profile",
      "url": "https://www.linkedin.com/in/colinchapmanza/"
    }
  }$json$::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  published = EXCLUDED.published,
  updated_at = now();

-- Optional: uncomment to seed leon-freier / kyle-parratt after migrating their JSON via admin or paste here.
