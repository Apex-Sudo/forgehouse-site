export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: string[];
  systemPromptAddition: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "diagnose-pipeline",
    title: "Diagnose my pipeline",
    description: "Walk through your pipeline stage by stage to find where deals are leaking.",
    icon: "🔍",
    questions: [
      "Let's diagnose your pipeline. First: how many active deals do you have right now, and what does your pipeline look like stage by stage?",
      "Got it. Now walk me through your typical deal flow - from first touch to close. Where do deals tend to stall or go dark?",
      "What does your follow-up cadence look like after that stall point? How many touches, what channels, what timing?",
      "Last question: what's your average deal cycle length, and how does that compare to what you'd expect for your price point and buyer type?",
    ],
    systemPromptAddition: `You are running a structured "Diagnose my pipeline" scenario. The user will answer questions about their pipeline one at a time. After all questions are answered, deliver a structured diagnosis with these sections:

## Pipeline Diagnosis

### Where Deals Are Leaking
(Identify the specific stage(s) where the biggest drop-off is happening)

### Root Cause Analysis
(Explain WHY deals are stalling at that stage based on what they told you)

### Fix Priority
(3 specific, actionable fixes ranked by impact. Be concrete - no generic advice)

### Quick Win
(One thing they can do THIS WEEK to see immediate improvement)

Keep it direct and specific to their situation. No fluff.`,
  },
  {
    id: "review-cold-email",
    title: "Review my cold email",
    description: "Get a line-by-line teardown of your outbound email with rewrites.",
    icon: "✉️",
    questions: [
      "Paste your cold email below - subject line and body. I'll give you a line-by-line teardown.",
      "Who exactly is this email going to? Give me the title, company size, and industry of your ideal recipient.",
      "What's the one specific action you want them to take after reading this? And what's in it for them?",
    ],
    systemPromptAddition: `You are running a structured "Review my cold email" scenario. The user will paste their cold email and answer questions about it. After all questions are answered, deliver a structured review with these sections:

## Cold Email Review

### Subject Line Verdict
(Rate it, explain why it works or doesn't, provide 2-3 alternatives)

### Line-by-Line Breakdown
(Go through each sentence/section. Flag what works, what doesn't, and why)

### Rewritten Version
(Complete rewrite incorporating all feedback, formatted as they'd send it)

### Key Principles Applied
(3 principles they should apply to every cold email going forward)

Be specific and direct. Show don't tell - the rewrite should demonstrate the principles.`,
  },
  {
    id: "stress-test-icp",
    title: "Stress-test my ICP",
    description: "Pressure-test your ideal customer profile to find blind spots.",
    icon: "🎯",
    questions: [
      "Describe your ICP as specifically as you can - company size, industry, role you're targeting, any other criteria you use.",
      "How did you arrive at this ICP? Was it data-driven, gut feel, or based on your current customer base?",
      "Who are your best 3 customers right now? What do they have in common - and what surprised you about them?",
      "Who have you tried to sell to that consistently doesn't convert? What patterns do you see in your losses?",
      "If you had to bet your next quarter's revenue on ONE segment of your ICP, which would it be and why?",
    ],
    systemPromptAddition: `You are running a structured "Stress-test my ICP" scenario. The user will answer questions about their ICP one at a time. After all questions are answered, deliver a structured analysis with these sections:

## ICP Stress Test Results

### Current ICP Assessment
(Rate their ICP specificity and accuracy based on evidence they provided)

### Blind Spots Identified
(Where their ICP assumptions don't match their actual data or experience)

### Refined ICP
(A sharper, evidence-based ICP definition incorporating their wins and losses)

### Anti-ICP
(Clearly define who they should STOP pursuing and why)

### Action Items
(3 specific next steps to validate and sharpen their ICP further)

Be direct and challenge their assumptions where the data contradicts them.`,
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
