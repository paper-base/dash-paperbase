import { redirect } from "next/navigation";

/**
 * Legacy path from older backend password-reset links. Preserves uid + token query params.
 */
export default async function LegacyResetPasswordRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    q.set(key, Array.isArray(value) ? value[0] : value);
  }
  const qs = q.toString();
  redirect(
    qs
      ? `/${locale}/auth/password-reset/confirm?${qs}`
      : `/${locale}/auth/password-reset`
  );
}
