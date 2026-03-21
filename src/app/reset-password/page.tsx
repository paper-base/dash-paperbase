import { redirect } from "next/navigation";

/**
 * Legacy path from older backend password-reset links. Preserves uid + token query params.
 */
export default async function LegacyResetPasswordRedirect({
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
  redirect(
    qs ? `/auth/password-reset/confirm?${qs}` : "/auth/password-reset"
  );
}
