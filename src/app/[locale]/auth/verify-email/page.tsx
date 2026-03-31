import { Suspense } from "react";

import VerifyEmailContent from "./VerifyEmailContent";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmailPage() {
  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="mx-auto w-11/12 max-w-sm text-center text-sm text-muted-foreground sm:w-full">
            <div className="inline-flex items-center gap-2">
              <Spinner />
              <span>Loading</span>
            </div>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthPageShell>
  );
}
