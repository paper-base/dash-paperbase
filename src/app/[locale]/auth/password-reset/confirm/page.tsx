import { Suspense } from "react";

import PasswordResetConfirmContent from "./PasswordResetConfirmContent";

export default function PasswordResetConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-xl backdrop-blur">
            Loading…
          </div>
        }
      >
        <PasswordResetConfirmContent />
      </Suspense>
    </div>
  );
}
