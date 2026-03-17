"use client";

import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted/80 px-1 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Go back"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <Undo2 className="size-4" />
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your workspace, branding, and account preferences for your BaaS
              dashboard.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-background p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Settings sections will go here – for now this is a placeholder page so
          you can design and evolve the full SaaS experience.
        </p>
      </section>
    </div>
  );
}

