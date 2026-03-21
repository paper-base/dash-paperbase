import { redirect } from "next/navigation";

/**
 * Legacy path from older backend email links. Preserves query string (uid, token, email).
 */
export default async function LegacyVerifyEmailRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    q.set(key, Array.isArray(value) ? value[0] : value);
  }
  const qs = q.toString();
  redirect(qs ? `/auth/verify-email?${qs}` : "/auth/verify-email");
}
