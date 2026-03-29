import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";

export default async function OrderSuccessPage() {
  const t = await getTranslations("orderSuccess");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <div className="w-full max-w-md border border-border bg-card p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("body")}</p>
        <Button asChild className="mt-8 w-full">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
