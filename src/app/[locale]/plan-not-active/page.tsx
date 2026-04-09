"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { getAccessToken } from "@/lib/auth";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import api from "@/lib/api";

/**
 * Smart redirect hub for users without an active subscription.
 * - No pending payment  →  /plans  (select a plan)
 * - Pending payment exists  →  /checkout  (submit / review transaction)
 */
export default function PlanNotActivePage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<{ pending: boolean }>(
          "billing/payment/pending/"
        );
        if (cancelled) return;
        if (data.pending) {
          router.replace("/checkout");
        } else {
          router.replace("/plans");
        }
      } catch {
        if (!cancelled) {
          // Fall back to plan selection on any API error.
          router.replace("/plans");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AuthPageShell>
      <div className="mx-auto flex w-full max-w-sm items-center justify-center py-6 sm:py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </AuthPageShell>
  );
}
