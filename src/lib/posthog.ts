const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  if (!POSTHOG_API_KEY || !distinctId) return;

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
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
    });
  } catch (err) {
    console.error(`PostHog capture error (${event}):`, err);
  }
}
