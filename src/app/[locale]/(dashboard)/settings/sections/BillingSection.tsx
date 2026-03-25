"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { SettingsSectionBody, settingsSectionSurfaceClassName } from "../SettingsSectionBody";

interface MeSubscription {
  active: boolean;
  plan: string | null;
  end_date: string | null;
}

export default function BillingSection({ hidden }: { hidden: boolean }) {
  const [subscription, setSubscription] = useState<MeSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<{ subscription?: MeSubscription }>("auth/me/")
      .then(({ data }) => {
        if (cancelled) return;
        setSubscription(data.subscription ?? null);
      })
      .catch(() => {
        if (!cancelled) setSubscription(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hidden]);

  const planLabel = loading ? "Loading…" : subscription?.plan ?? "—";
  const statusLabel = loading
    ? "…"
    : subscription == null
      ? "—"
      : subscription.active
        ? "Active"
        : "Inactive";
  const endLabel = loading ? "…" : subscription?.end_date ?? "—";

  return (
    <section
      id="panel-billing"
      role="tabpanel"
      aria-labelledby="tab-billing"
      hidden={hidden}
      className={settingsSectionSurfaceClassName}
    >
      <SettingsSectionBody gap="compact">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground">Billing & Plan</h2>
          <p className="text-sm text-muted-foreground">Current plan and subscription period from your account.</p>
        </div>

        <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Current Plan</label>
          <Input value={planLabel} readOnly className="bg-muted/50" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Subscription status</label>
          <Input value={statusLabel} readOnly className="bg-muted/50" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Current period ends</label>
          <Input value={endLabel} readOnly className="bg-muted/50" />
        </div>
        </div>
      </SettingsSectionBody>
    </section>
  );
}
