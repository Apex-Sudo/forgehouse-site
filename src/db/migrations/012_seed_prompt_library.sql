-- 012_seed_prompt_library.sql
-- Seed prompts from the Pro-How AI Prompts for Small Business library
-- Source: https://github.com/pro-how/ai-prompts-for-small-business
-- Categories mapped: Operations & SOPs → productivity; Client Comms / Marketing / Proposals / Sales / Social → business

INSERT INTO prompts (category, title, description, prompt_text, sort_order) VALUES

-- ===== PRODUCTIVITY (Operations & SOPs) =====

(
  'productivity',
  'Task Checklist',
  'Generate a repeatable, step-by-step checklist for opening/closing, events, or quality checks.',
  'Create a step-by-step checklist for the following task:

Business type: [YOUR BUSINESS TYPE]
Task: [DESCRIBE THE TASK]
Who uses this checklist: [ROLE]
When they use it: [e.g. every morning / before every client appointment / at month end]

Items I know need to be on it:
- [ITEM 1]
- [ITEM 2]
- [ITEM 3]

Format as a checklist with checkboxes. Group related items under short subheadings.
Keep each item as a clear action (start with a verb).
Flag any items that are time-sensitive with [TIME-SENSITIVE].',
  3
),
(
  'productivity',
  'Standard Operating Procedure (SOP)',
  'Document a recurring process so anyone on your team can run it without asking you.',
  'Help me create a standard operating procedure (SOP) for the following process.

Business type: [YOUR BUSINESS TYPE]
Process name: [e.g. "New Client Onboarding" / "Weekly Inventory Check" / "End of Day Closing"]
Who performs this task: [ROLE e.g. front desk staff / manager / owner]
How often it happens: [DAILY / WEEKLY / MONTHLY / AS NEEDED]

Interview me to extract the process. Ask me one step at a time:
1. What is the very first thing that happens?
2. Then what?
3. Keep asking until I say the process is complete.

Then format the final SOP with:
- Process name
- Purpose (one sentence)
- Who is responsible
- Frequency
- Step-by-step instructions (numbered)
- What to do if something goes wrong
- Last updated date: [TODAY''S DATE]',
  4
),
(
  'productivity',
  'Team Instructions for a New Tool',
  'Explain a new tool or process to your team in plain language they will actually follow.',
  'Write clear instructions for my team explaining how to use [TOOL/PROCESS NAME].

What it is: [ONE SENTENCE DESCRIPTION]
Why we''re using it: [THE BUSINESS REASON]
Who needs to use it: [ROLES]
When they use it: [WHEN / HOW OFTEN]

Step-by-step instructions:
[DESCRIBE THE STEPS AS YOU KNOW THEM — even roughly]

Common mistakes to avoid:
[LIST ANY YOU''RE AWARE OF]

Who to contact with questions: [NAME / ROLE / CONTACT METHOD]

Write this for someone who is not technical. Use plain language. Keep sentences short.
Format with numbered steps and bold key actions.',
  5
),

-- ===== BUSINESS (Client Communication) =====

(
  'business',
  'New Client Welcome Email',
  'Write a warm, professional welcome email that kicks off the client relationship right.',
  'Write a welcome email for a new client.

My business: [YOUR BUSINESS NAME]
Service they signed up for: [SERVICE]
Client name: [FIRST NAME]
What happens next: [DESCRIBE THE NEXT 1-3 STEPS THEY CAN EXPECT]
Who their main point of contact is: [NAME AND ROLE]
Best way to reach us: [PHONE / EMAIL / PORTAL LINK]
Anything they need to do before we start: [e.g. fill out intake form, send logo files, schedule kickoff call]

Tone: [e.g. warm and professional / friendly and casual / confident and efficient]

Keep it concise. Do not list every detail about our process — just what they need to know right now.',
  3
),
(
  'business',
  'Follow-Up After No Response',
  'Send a short, friendly follow-up when a proposal or message went unanswered.',
  'Write a short follow-up email to a client who hasn''t responded to my last message.

Context:
- What I sent previously: [DESCRIBE THE ORIGINAL MESSAGE e.g. a proposal, a quote, an invoice]
- When I sent it: [DATE OR e.g. "five days ago"]
- Client name: [FIRST NAME]
- What I need from them: [e.g. a decision, a signed agreement, payment]

Tone: Friendly, not pushy. Assume they''re busy, not ignoring me.
Length: Under 100 words.
Do not apologize for following up.
End with a clear, easy next step.',
  4
),
(
  'business',
  'Price Increase Notice',
  'Inform existing clients of a rate change confidently and directly — no over-explaining.',
  'Write an email informing an existing client of a price increase.

My business: [YOUR BUSINESS NAME]
Client name: [FIRST NAME]
Current price: [CURRENT AMOUNT]
New price: [NEW AMOUNT]
Effective date: [DATE]
Reason (optional, keep brief): [e.g. rising costs, expanded service, annual adjustment]
What stays the same: [e.g. same team, same quality, same process]

Tone: Confident and direct. Not apologetic, but not cold either.
Do not over-explain or justify the increase at length.
Do not ask for their permission or approval.
End with a clear statement of the new rate and when it takes effect.',
  5
),
(
  'business',
  'Respond to a Negative Review',
  'Craft a professional public response that protects your reputation and invites resolution.',
  'Write a professional public response to a negative review.

The review said: [PASTE THE REVIEW TEXT]
The situation from my perspective: [BRIEFLY DESCRIBE WHAT ACTUALLY HAPPENED]
What I want to communicate:
- That I take feedback seriously
- [ANY SPECIFIC POINT YOU WANT TO ADDRESS]
- An invitation to resolve it directly

My business name: [BUSINESS NAME]
Tone: Calm, professional, not defensive.
Length: Under 100 words.
Do not admit fault for things that weren''t our fault.
Do not argue with the reviewer publicly.
Always end with an invitation to contact us directly.',
  6
),
(
  'business',
  'Late Payment Follow-Up',
  'Chase an overdue invoice without damaging the relationship — tone scales with how late it is.',
  'Write a follow-up email for an overdue invoice.

Client name: [FIRST NAME]
Invoice number: [NUMBER]
Invoice amount: [AMOUNT]
Original due date: [DATE]
How many days overdue: [NUMBER]
Payment link or instructions: [LINK OR INSTRUCTIONS]

Tone for first follow-up (1-7 days late): Friendly, assume it slipped through
Tone for second follow-up (8-21 days late): Polite but firm
Tone for third follow-up (22+ days late): Direct, state consequences clearly

Which follow-up is this: [FIRST / SECOND / THIRD]',
  7
),

-- ===== BUSINESS (Marketing & SEO) =====

(
  'business',
  'Blog Post Outline',
  'Generate a structured blog outline with working title, sections, and a clear CTA.',
  'Create a detailed blog post outline for the following:

My business: [YOUR BUSINESS NAME / TYPE]
Target audience: [WHO WILL READ THIS]
Blog post topic: [TOPIC]
Primary keyword (if known): [KEYWORD]
The main question this post answers: [QUESTION]
The reader''s situation before reading: [e.g. confused about X / considering Y / struggling with Z]
What I want them to do after reading: [CALL TO ACTION]

Format the outline with:
- A working title (with the keyword near the front)
- An intro section summary
- 4-6 main sections with H2 headings
- 2-3 bullet point sub-points under each H2
- A conclusion section summary
- A suggested call to action

Also suggest 3 alternative title options.',
  8
),
(
  'business',
  'SEO Meta Title & Description',
  'Write click-worthy SEO meta tags that fit character limits and include your keyword.',
  'Write an SEO meta title and meta description for the following page:

Page type: [e.g. service page / blog post / homepage / location page]
Page topic: [WHAT THE PAGE IS ABOUT]
Primary keyword: [KEYWORD]
Business name: [YOUR BUSINESS NAME]
Location (if local SEO): [CITY, STATE]

Requirements:
- Meta title: under 60 characters, include the keyword near the front
- Meta description: 140-155 characters, include the keyword, end with a clear action
- Do not use clickbait or make promises the page doesn''t keep
- Write for a human reader, not just a search engine

Give me 3 options for each.',
  9
),
(
  'business',
  'Google Business Profile Post',
  'Write a local, under-300-word GBP post that mentions your city and drives action.',
  'Write a Google Business Profile post for my business.

Business name: [YOUR BUSINESS NAME]
Business type: [TYPE]
Location: [CITY, STATE]
Post topic: [e.g. seasonal offer / new service / tip / event / announcement]
Key message: [ONE SENTENCE — what do you want people to know?]
Call to action: [e.g. Call us / Book online / Learn more / Get directions]
Link (if applicable): [URL]

Requirements:
- Under 300 words
- Local and specific — mention the city or service area
- End with the call to action
- Do not use hashtags',
  10
),
(
  'business',
  'Service Page Copy',
  'Write a full website service page — hero headline through CTA — that converts visitors.',
  'Write a service page for my website.

Business name: [YOUR BUSINESS NAME]
Service: [SERVICE NAME]
Target audience: [WHO THIS SERVICE IS FOR]
Their main problem before finding us: [DESCRIBE THE PAIN POINT]
What this service does: [DESCRIBE THE SERVICE]
What they get (deliverables or outcomes): [LIST 3-5]
Why choose us over competitors: [YOUR DIFFERENTIATOR]
Social proof available: [e.g. number of clients served / years in business / testimonials]
Primary keyword: [KEYWORD]
Location (if local): [CITY, STATE]
Call to action: [e.g. Book a free call / Get a quote / Contact us]

Structure the page with:
1. Hero headline (include keyword)
2. Sub-headline (speak to the pain point)
3. What this service is (brief)
4. What''s included
5. Who it''s for
6. Why [your business name]
7. Call to action

Write in second person (you/your). Keep sentences short. No jargon.',
  11
),

-- ===== BUSINESS (Proposals & Quotes) =====

(
  'business',
  'Full Client Proposal',
  'Write a professional service proposal with scope, timeline, investment, and next steps.',
  'Write a professional service proposal for a [TYPE OF BUSINESS] client.

About my business:
- Business name: [YOUR BUSINESS NAME]
- Service offered: [DESCRIBE THE SERVICE]
- My differentiator: [WHAT MAKES YOU DIFFERENT]
- Tone: [e.g. warm and professional / direct and confident / friendly but expert]

About the client:
- Client name/business: [CLIENT NAME]
- Their goal: [WHAT THEY WANT TO ACHIEVE]
- Their main concern or hesitation: [e.g. budget, timeline, past bad experience]

Project details:
- Scope of work: [LIST THE DELIVERABLES]
- Timeline: [START DATE TO COMPLETION]
- Investment: [PRICE OR PRICE RANGE]
- What''s included: [LIST INCLUSIONS]
- What''s not included: [LIST EXCLUSIONS]

Write the proposal with:
- A brief opening that acknowledges their goal
- A clear scope of work section
- A timeline section
- An investment section
- A next steps section
- A warm but confident closing

Do not use jargon. Write as if explaining to someone who is smart but not technical.',
  12
),
(
  'business',
  'Project Quote (Short Form)',
  'Send a quick, under-200-word project quote that is direct, clear, and confident.',
  'Write a short, clear project quote email for the following:

My business: [YOUR BUSINESS NAME]
Client: [CLIENT NAME]
Service requested: [WHAT THEY ASKED FOR]
Quote amount: [PRICE]
What''s included: [LIST 3-5 SPECIFIC DELIVERABLES]
Timeline: [HOW LONG IT WILL TAKE]
Quote valid until: [EXPIRY DATE]
Next step to proceed: [e.g. reply to this email / sign the attached agreement / pay the deposit]

Keep it under 200 words. Be direct and confident. Do not over-explain.',
  13
),
(
  'business',
  'Scope of Work Document',
  'Produce a standalone SOW with deliverables, exclusions, client responsibilities, and timeline.',
  'Write a clear scope of work document for the following project:

Client: [CLIENT NAME]
Project name: [PROJECT TITLE]
Project goal: [ONE SENTENCE DESCRIBING THE END RESULT]

Deliverables (list each one):
1. [DELIVERABLE 1]
2. [DELIVERABLE 2]
3. [DELIVERABLE 3]

Client responsibilities (what they need to provide):
- [ITEM 1]
- [ITEM 2]

Out of scope (what is NOT included):
- [ITEM 1]
- [ITEM 2]

Timeline:
- Project start: [DATE]
- Key milestones: [LIST IF APPLICABLE]
- Completion: [DATE]

Revision policy: [e.g. two rounds of revisions included]

Format this as a professional document with clear section headers. Use plain language. Avoid legal jargon.',
  14
),

-- ===== BUSINESS (Sales) =====

(
  'business',
  'Discovery Call Preparation',
  'Generate smart, open-ended questions and fit indicators before a sales or discovery call.',
  'Help me prepare for a discovery call with a prospective client.

My business: [YOUR BUSINESS NAME]
My service: [SERVICE]
Prospect info:
- Name: [FIRST NAME]
- Business: [THEIR BUSINESS NAME / TYPE]
- How they found me: [REFERRAL / AD / WEBSITE / etc.]
- What they said they need: [WHAT THEY MENTIONED IN THEIR INQUIRY]

Generate:
1. 5 open-ended questions to understand their situation
2. 3 questions to understand their budget and timeline
3. 2 questions to uncover their real priority (not just the stated problem)
4. The key things I should listen for that would indicate they are a good fit
5. Red flags that might indicate they are not a good fit for my service

Keep questions natural and conversational, not interrogation-style.',
  15
),
(
  'business',
  'Sales Objection Response',
  'Respond to price objections, "I need to think about it," and other pushback with confidence.',
  'Help me respond to a sales objection.

My service: [SERVICE]
My price: [PRICE OR RANGE]
The objection they raised: [PASTE THEIR EXACT WORDS OR DESCRIBE IT]

Write a response that:
- Acknowledges their concern genuinely (not dismissively)
- Addresses the real underlying worry (not just the surface objection)
- Does not discount the price or panic
- Reframes the value if appropriate
- Ends with a question that moves the conversation forward

Common objections to prepare responses for:
- "It''s too expensive"
- "I need to think about it"
- "I''m not ready yet"
- "I tried something like this before and it didn''t work"
- "I need to talk to my partner/spouse first"

Which objection am I responding to: [SELECT OR DESCRIBE]',
  16
),
(
  'business',
  'Post-Call Follow-Up Email',
  'Recap a sales call, restate the value, and propose one clear next step — under 150 words.',
  'Write a follow-up email after a sales call.

Prospect name: [FIRST NAME]
What we discussed: [BRIEF SUMMARY OF THE CALL]
What they said they need: [THEIR STATED GOAL OR PROBLEM]
What I''m proposing: [YOUR RECOMMENDED SERVICE OR NEXT STEP]
Next step: [e.g. I''ll send a proposal / Let''s schedule a follow-up / Here''s how to get started]
Deadline or urgency (if real): [e.g. this pricing is available until X date]

Tone: Warm, confident, and helpful. Not salesy.
Length: Under 150 words.
Do not summarize the entire call — just the key point and the next step.',
  17
),
(
  'business',
  'Lead Nurture Sequence (3 Emails)',
  'Build a 3-email nurture track that adds value, shares proof, and checks in respectfully.',
  'Write a 3-email nurture sequence for a prospect who is interested but not ready to buy.

My business: [YOUR BUSINESS NAME]
My service: [SERVICE]
Their situation: [WHAT THEY TOLD YOU ABOUT THEIR TIMING OR HESITATION]
Their goal: [WHAT THEY WANT TO ACHIEVE]

Email 1 (send 3-5 days after initial contact):
- Provide one genuinely useful tip related to their goal
- No hard sell
- Soft CTA: invite them to reply with a question

Email 2 (send 7-10 days later):
- Share a relevant case study or result (real or realistic example)
- One sentence about how your service achieves this
- Soft CTA: ask if this resonates

Email 3 (send 7-10 days later):
- Direct but respectful check-in
- Ask if the timing has changed
- Give them an easy out if it''s not the right fit

Tone across all three: helpful, not pushy. Assume they are a smart person with a busy life.',
  18
),

-- ===== BUSINESS (Social Media) =====

(
  'business',
  'Single Social Media Post',
  'Write one scroll-stopping post for Facebook, LinkedIn, or Google Business Profile.',
  'Write a social media post for [PLATFORM: Facebook / LinkedIn / Google Business Profile].

My brand voice template:
Business name: [YOUR BUSINESS NAME]
What I do: [ONE SENTENCE]
Who I serve: [DESCRIBE YOUR IDEAL CLIENT]
My tone is: [e.g. warm and encouraging / direct and no-nonsense / professional but approachable]
I never sound: [e.g. corporate / salesy / overly casual]
Words or phrases I use often: [LIST 3-5]
Words or phrases I avoid: [LIST 3-5]
My content goal: [e.g. build trust / educate / show behind the scenes / drive inquiries]

Topic: [WHAT THIS POST IS ABOUT]
The main point I want to make: [ONE SENTENCE]
Call to action: [e.g. visit the link in bio / send us a message / comment below / book a free call]

Format:
- Open with a hook — not with my business name
- Keep it under [150 words for Facebook/GBP / 200 words for LinkedIn]
- Use short paragraphs (1-2 sentences max)
- End with the call to action
- Do not use hashtags unless I ask',
  19
),
(
  'business',
  'Monthly Social Media Content Plan',
  'Plan a full month of posts across platforms — topics, content types, and publishing cadence.',
  'Create a social media content plan for one month.

My brand voice template:
Business name: [YOUR BUSINESS NAME]
What I do: [ONE SENTENCE]
Who I serve: [DESCRIBE YOUR IDEAL CLIENT]
My tone is: [e.g. warm and encouraging / direct and no-nonsense / professional but approachable]

Platform(s): [LIST PLATFORMS]
Posting frequency: [e.g. 3x per week / daily / weekdays only]
Content pillars (the types of content I post):
1. [e.g. Educational tips]
2. [e.g. Behind the scenes]
3. [e.g. Client results/stories]
4. [e.g. Promotional / offers]

This month''s focus or theme: [e.g. spring promotions / back to school / end of year]
Any upcoming events or dates to include: [LIST IF APPLICABLE]

Format the plan as a simple table:
- Week number
- Post topic
- Content type (from pillars above)
- Platform
- Brief description of the post angle

Do not write the actual posts — just the plan.',
  20
),
(
  'business',
  'Repurpose Blog Post → Social Posts',
  'Turn one blog post into multiple standalone social posts, each with a different angle.',
  'I have a blog post I want to repurpose into social media content.

My brand voice template:
Business name: [YOUR BUSINESS NAME]
What I do: [ONE SENTENCE]
Who I serve: [DESCRIBE YOUR IDEAL CLIENT]
My tone is: [e.g. warm and encouraging / direct and no-nonsense / professional but approachable]

Blog post title: [TITLE]
Blog post URL: [URL]
Main points of the post:
1. [POINT 1]
2. [POINT 2]
3. [POINT 3]

Create [NUMBER] social media posts from this content for [PLATFORM].

Each post should:
- Focus on one point from the article
- Stand alone (readers should get value without clicking the link)
- End with an optional link to read more
- Be under [WORD COUNT] words

Make each post feel different — vary the opening style.',
  21
);
