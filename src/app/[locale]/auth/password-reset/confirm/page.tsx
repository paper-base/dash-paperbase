import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import PasswordResetConfirmContent from "./PasswordResetConfirmContent";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Spinner } from "@/components/ui/spinner";

export default async function PasswordResetConfirmPage() {
  const tCommon = await getTranslations("common");

  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="mx-auto w-11/12 max-w-sm text-center text-sm text-muted-foreground sm:w-full">
            <div className="inline-flex items-center gap-2">
              <Spinner />
              <span>{tCommon("loading")}</span>
            </div>
          </div>
        }
      >
        <PasswordResetConfirmContent />
      </Suspense>
    </AuthPageShell>
  );
}
