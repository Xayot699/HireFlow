export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !url ||
    !publishableKey ||
    url.includes("YOUR_") ||
    publishableKey.includes("YOUR_")
  ) {
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env."
    );
  }

  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.protocol !== "https:" ||
      !parsedUrl.hostname.includes(".")
    ) {
      throw new Error();
    }
  } catch {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Use the project URL from Supabase, such as https://<project-ref>.supabase.co."
    );
  }

  return { url, publishableKey };
}
