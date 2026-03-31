import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default async function PasswordResetSentPage() {
  const t = await getTranslations("auth.passwordReset");

  return (
    <AuthPageShell headline={t("sentTitle")} description={t("sentBody")}>
      <div className="mx-auto w-11/12 max-w-sm space-y-6 sm:w-full">
        <Button asChild className="mt-2 w-full">
          <Link href="/login">{t("backToLogin")}</Link>
        </Button>
      </div>
    </AuthPageShell>
  );
}
