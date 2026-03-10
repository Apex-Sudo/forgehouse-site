# Analytics & Usage Tracking

## Overview

ForgeHouse uses PostHog for product analytics. Client-side events (pageviews, clicks, funnel) are captured via the PostHog JS snippet. Server-side events (chat messages, API calls, retention) are captured via a custom `captureServerEvent` function.

## PostHog Setup

- **Project**: 246820 (Default project)
- **Project token** (capture): `phc_uJOopGcIoW4caqPea4fZ8NtAvao3N5Zgb7KgTSorMIl`
- **Personal API key** (query): `phx_RCzJekjKVO38OrWuMOLldhFSH9SAkqs4iGaCOczYQi56jW4` (read-only)
- **Capture host**: `https://us.i.posthog.com`
- **Query endpoint**: `https://us.posthog.com/api/projects/246820/query/`

### Env vars (Vercel)

```
NEXT_PUBLIC_POSTHOG_KEY=phc_uJOopGcIoW4caqPea4fZ8NtAvao3N5Zgb7KgTSorMIl
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

> **Important**: These values must NOT have trailing whitespace or newlines. The server-side capture silently fails if the API key or host URL is malformed. The code applies `.trim()` defensively but keep the source clean.

## Architecture

```
Client (browser)                    Server (Vercel serverless)
─────────────────                   ──────────────────────────
PostHog JS snippet                  captureServerEvent() in src/lib/posthog.ts
  → pageview                          → message_sent
  → autocapture                       → message_received
  → gate_hit                          → conversation_returned
  → paywall_hit                       → api_message_sent
  → checkout_started                  → api_message_received
  → subscription_started
  → tool_started / tool_completed
```

### Server-side capture with `after()`

Server-side events use `after()` from `next/server` to ensure PostHog capture completes before Vercel terminates the serverless function. Without `after()`, fire-and-forget fetch calls get killed when the response stream closes.

```typescript
import { after } from "next/server";
import { captureServerEvent } from "@/lib/posthog";

// Inside route handler:
after(async () => {
  await captureServerEvent(distinctId, "message_sent", { ... });
});
```

This applies to both `/api/mentor-chat` (web chat) and `/api/v1/chat` (MCP/API).

## Events Reference

### Client-side events

| Event | Source | Properties |
|---|---|---|
| `gate_hit` | Chat page | `mentor`, `trigger` (preemptive / message_blocked / recheck) |
| `paywall_hit` | Chat page | `mentor`, `trigger` |
| `checkout_started` | Pricing | — |
| `subscription_started` | Webhook | — |
| `tool_started` | Free tools | — |
| `tool_completed` | Free tools | — |
| `tool_path_selected` | Free tools | — |

### Server-side events (web chat)

| Event | Properties |
|---|---|
| `message_sent` | `mentor_slug`, `conversation_id`, `is_authenticated`, `is_invited`, `message_length`, `message_number` |
| `message_received` | `mentor_slug`, `conversation_id`, `response_length`, `message_number` |
| `conversation_returned` | `mentor_slug`, `conversation_id`, `hours_since_last_message` |

### Server-side events (MCP/API)

| Event | Properties |
|---|---|
| `api_message_sent` | `mentor_slug`, `via: "api_v1"`, `message_count` |
| `api_message_received` | `mentor_slug`, `via: "api_v1"`, `response_length` |

### Common properties (all server events)

| Property | Value |
|---|---|
| `$lib` | `forgehouse-server` |
| `$host` | `forgehouse.io` |
| `source` | `server` |

### Distinct ID

- Authenticated users: email address
- Anonymous users: `anon:<ip>`
- API users: email from API key lookup

## Key files

- `src/lib/posthog.ts` — server-side capture function
- `src/app/api/mentor-chat/route.ts` — web chat route (message_sent, message_received, conversation_returned)
- `src/app/api/v1/chat/route.ts` — MCP/API route (api_message_sent, api_message_received)
- `src/app/chat/colin-chapman/page.tsx` — client-side gate_hit, paywall_hit
- `src/app/layout.tsx` — PostHog JS snippet initialization

## Querying

Use HogQL via the PostHog API:

```python
import requests

API_KEY = "phx_RCzJekjKVO38OrWuMOLldhFSH9SAkqs4iGaCOczYQi56jW4"
URL = "https://us.posthog.com/api/projects/246820/query/"

r = requests.post(URL,
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={"query": {"kind": "HogQLQuery", "query": "SELECT event, count() FROM events WHERE event = 'message_sent' AND timestamp >= now() - interval 7 day GROUP BY event"}},
    timeout=30)
print(r.json().get("results", []))
```

> **Note**: PostHog free tier has query execution time limits. Keep queries narrow (short time ranges, specific event filters). Broad scans across all events will timeout.

## What you can learn

- **Conversation depth**: `message_number` shows if users go deep or bounce after 2 messages
- **Retention**: `conversation_returned` with `hours_since_last_message` shows who comes back
- **Channel split**: `via: "api_v1"` separates MCP/API usage from web chat
- **Funnel**: gate_hit → paywall_hit → checkout_started → subscription_started
- **Tool engagement**: which free tools get used, completion rates

## Privacy

No message content is logged to PostHog. Only behavioral metadata (lengths, counts, timestamps). Conversation content is stored in Supabase for authenticated users only (see SETUP-RETENTION.md).
