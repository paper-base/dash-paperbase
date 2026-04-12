import type { MeForRouting, SubscriptionStatus } from "@/lib/subscription-access";

export type LatestPaymentStatus = "REJECTED" | "PENDING_REVIEW" | null;

/**
 * Single dashboard subscription banner lane (mutually exclusive).
 * `none` = no subscription strip (e.g. ACTIVE).
 */
export type SubscriptionUIState =
  | "rejected"
  | "pending_review"
  | "grace"
  | "expired"
  | "inactive"
  | "none";

/**
 * Strict priority: latest payment signal first, then candidate subscription_status.
 */
export function resolveSubscriptionUIState(
  subscriptionStatus: SubscriptionStatus,
  latestPaymentStatus: LatestPaymentStatus | undefined | null
): SubscriptionUIState {
  const lps = latestPaymentStatus ?? null;
  if (lps === "REJECTED") return "rejected";
  if (lps === "PENDING_REVIEW") return "pending_review";
  if (subscriptionStatus === "REJECTED") return "rejected";
  if (subscriptionStatus === "PENDING_REVIEW") return "pending_review";
  if (subscriptionStatus === "GRACE") return "grace";
  if (subscriptionStatus === "EXPIRED") return "expired";
  if (subscriptionStatus === "NONE") return "inactive";
  return "none";
}

export function resolveSubscriptionUIStateFromMe(me: MeForRouting): SubscriptionUIState {
  return resolveSubscriptionUIState(
    me.subscription.subscription_status,
    me.latest_payment_status ?? null
  );
}

/** Networking: store/API keys under review (includes EXPIRED + latest PENDING_REVIEW). */
export function isNetworkingStoreUnderReview(me: MeForRouting): boolean {
  return resolveSubscriptionUIStateFromMe(me) === "pending_review";
}

export type BillingSettingsStatusKey =
  | "statusActive"
  | "statusInactive"
  | "statusGrace"
  | "statusExpired"
  | "statusPendingReview"
  | "statusRejected";

/** Settings billing row label key under `settings.billing.*`. */
export function billingSettingsStatusKey(
  ui: SubscriptionUIState,
  subscriptionStatus: SubscriptionStatus
): BillingSettingsStatusKey {
  switch (ui) {
    case "rejected":
      return "statusRejected";
    case "pending_review":
      return "statusPendingReview";
    case "grace":
      return "statusGrace";
    case "expired":
      return "statusExpired";
    case "inactive":
      return "statusInactive";
    case "none":
    default:
      return subscriptionStatus === "ACTIVE" ? "statusActive" : "statusInactive";
  }
}
