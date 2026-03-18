"use client";

import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sales analytics and reporting. Full dashboard coming soon.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">Analytics dashboard is coming soon.</p>
        <Link href="/settings" className="mt-4 inline-block text-sm text-primary hover:underline">
          Go to Settings → Apps to configure
        </Link>
      </div>
    </div>
  );
}
