const POSTHOG_API_KEY = "phc_uJOopGcIoW4caqPea4fZ8NtAvao3N5Zgb7KgTSorMIl";
const POSTHOG_HOST = "https://us.i.posthog.com";

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
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
        },
      }),
    });
  } catch (err) {
    console.error(`PostHog capture error (${event}):`, err);
  }
}
