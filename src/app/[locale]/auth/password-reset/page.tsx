"use client";

import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { requestPasswordReset } from "@/lib/auth-email";
import { useRateLimitCooldown, extractRateLimitInfo } from "@/hooks/useRateLimitCooldown";
import { emailSchema } from "@/lib/validation";

export default function PasswordResetRequestPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cooldown = useRateLimitCooldown();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(parsed.data, logoutAllDevices);
      router.push("/auth/password-reset/sent");
    } catch (err: unknown) {
      const info = extractRateLimitInfo(err);
      if (info) {
        cooldown.startCooldown(info.retryAfter);
        setError("");
      } else {
        setError("Could not send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Reset password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter your account email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-11/12 max-w-sm space-y-6 sm:w-full">
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="form-field">
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. you@example.com"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={logoutAllDevices}
            onChange={(e) => setLogoutAllDevices(e.target.checked)}
            className="form-checkbox"
          />
          <span>Log out from all other devices</span>
        </label>
        <Button type="submit" className="mt-2 w-full" disabled={loading || cooldown.isLimited}>
          {cooldown.isLimited
            ? `Retry in ${cooldown.remaining}s`
            : loading
              ? "Please wait…"
              : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </p>
    </AuthPageShell>
  );
}
