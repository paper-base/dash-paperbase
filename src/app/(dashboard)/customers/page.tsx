"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer accounts and profiles. Full management coming soon.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/customers/new">
            <Plus className="size-4" />
            Add Customer
          </Link>
        </Button>
      </header>
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">Customer management is coming soon.</p>
        <Link href="/settings" className="mt-4 inline-block text-sm text-primary hover:underline">
          Go to Settings → Dynamic Fields to configure extra customer fields
        </Link>
      </div>
    </div>
  );
}
