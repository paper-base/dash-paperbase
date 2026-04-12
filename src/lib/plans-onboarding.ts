import type { MeForRouting } from "@/lib/subscription-access";

/** Set when the user opens /plans (once-per-browser; avoids dashboard redirect loops). */
export const HAS_VISITED_PLANS_STORAGE_KEY = "paperbase_has_visited_plans";

export function markPlansVisited(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HAS_VISITED_PLANS_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function hasVisitedPlans(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(HAS_VISITED_PLANS_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function hasStoreContext(me: MeForRouting): boolean {
  return Boolean(
    (me.active_store_public_id && String(me.active_store_public_id).trim()) ||
      me.store?.public_id
  );
}

/**
 * First-time plan selection: owner has a store but no subscription row yet (NONE).
 * Pending / rejected / expired flows stay on the dashboard with banners only.
 */
export function shouldOfferInitialPlanSelection(me: MeForRouting): boolean {
  if (!hasStoreContext(me)) return false;
  return me.subscription?.subscription_status === "NONE";
}
