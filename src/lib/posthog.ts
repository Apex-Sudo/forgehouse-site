const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Capture a server-side PostHog event.
 * Returns a promise that resolves when the event is sent.
 * Callers in streaming routes should use `after()` from next/server
 * to ensure this completes before Vercel kills the function.
 */
export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!POSTHOG_API_KEY || !distinctId) return Promise.resolve();

  return fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_API_KEY,
      event,
      distinct_id: distinctId,
      properties: {
        ...properties,
        $lib: "forgehouse-server",
        $host: "forgehouse.io",
        source: "server",
      },
    }),
  })
    .then(() => {})
    .catch((err) => {
      console.error(`PostHog capture error (${event}):`, err);
    });
}
