export interface SupabasePublicEnv {
  url: string;
  publishableKey: string;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  return (
    (url.startsWith("https://") || url.startsWith("http://")) &&
    publishableKey.length > 0
  );
}

export function getSupabaseEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  if (
    (!url.startsWith("https://") && !url.startsWith("http://")) ||
    publishableKey.length === 0
  ) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local.",
    );
  }

  return { url, publishableKey };
}
