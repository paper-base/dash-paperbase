import { Suspense } from "react";

import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-xl backdrop-blur">
            Loading…
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
