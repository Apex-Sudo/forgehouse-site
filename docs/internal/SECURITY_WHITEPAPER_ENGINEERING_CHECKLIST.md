# Security whitepaper — engineering accuracy checklist

**Internal use only. Do not link from the public website or customer-facing materials.**

Use this checklist before publishing a new version of [SECURITY-WHITEPAPER.md](../SECURITY-WHITEPAPER.md). Verify each **public claim** against production configuration and contracts.

| # | Whitepaper claim (summary) | Verify against | Last verified (date) | OK? |
|---|----------------------------|----------------|----------------------|-----|
| 1 | TLS for user ↔ app and app ↔ major subprocessors | `next.config.ts` CSP/connect-src; HTTPS on Vercel; outbound HTTPS to Supabase, Stripe, Anthropic, etc. | | |
| 2 | No full card numbers stored | Stripe Checkout; no local PAN fields | | |
| 3 | Server-side enforcement for user data access | RLS policies + API routes using session / service role appropriately | | |
| 4 | Mentor knowledge isolated per mentor / server-side retrieval scope | Knowledge retrieval path only uses mentor context from authorized request | | |
| 5 | Embeddings are retrieval aids, not encryption | Ingestion uses embedding provider; stored vectors are not marketed as encryption | | |
| 6 | “Do not use conversations to train” | Privacy Policy + Anthropic / other DPAs or account settings | | |
| 7 | Subprocessors list matches Privacy Policy | Same vendors and purposes as [privacy/page.tsx](../../src/app/privacy/page.tsx) | | |
| 8 | Free vs paid conversation retention | Product behavior + Privacy Policy wording | | |
| 9 | API credentials issued server-side | Account/API key flows | | |
| 10 | Secrets in env, not client bundles | No `NEXT_PUBLIC_` leakage for service keys | | |

## Notes (internal)

- If any row fails, **update the whitepaper** or **fix the product** before external publish.
- Do **not** copy this table or internal file paths into the public whitepaper.
