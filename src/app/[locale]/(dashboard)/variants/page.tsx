import { Suspense } from "react";
import VariantsPageClient from "./variants-client";

export default function VariantsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading…</div>
      }
    >
      <VariantsPageClient />
    </Suspense>
  );
}
