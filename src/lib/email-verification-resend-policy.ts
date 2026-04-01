/**
 * Must stay in sync with
 * api-paperbase/engine/core/rate_limit_service.py → RATE_LIMITS["email_verification_resend"]["cooldown"].
 */
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 120;

/**
 * Seconds left in the resend cooldown window from a signup timestamp.
 * Clamped to [0, EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS] (handles clock skew).
 */
export function remainingResendCooldownSeconds(
  signupTimeMs: number,
  nowMs: number = Date.now()
): number {
  const cap = EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS;
  if (!Number.isFinite(signupTimeMs) || signupTimeMs <= 0) return 0;
  const elapsed = Math.floor((nowMs - signupTimeMs) / 1000);
  const raw = cap - elapsed;
  return Math.max(0, Math.min(cap, raw));
}
