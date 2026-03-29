import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import PasswordResetConfirmContent from "./PasswordResetConfirmContent";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default async function PasswordResetConfirmPage() {
  const tCommon = await getTranslations("common");

  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="mx-auto w-11/12 max-w-sm text-center text-sm text-muted-foreground sm:w-full">
            {tCommon("loading")}
          </div>
        }
      >
        <PasswordResetConfirmContent />
      </Suspense>
    </AuthPageShell>
  );
}
