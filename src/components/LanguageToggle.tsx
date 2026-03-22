"use client";

import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  CORE_LOCALE_STORAGE_KEY,
  setLocalePreferenceCookie,
} from "@/lib/locale-storage";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  className?: string;
  variant?: "default" | "compact";
};

export default function LanguageToggle({
  className,
  variant = "default",
}: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const nextLocale = locale === "bn" ? "en" : "bn";
  const label = locale === "bn" ? t("switchToEnglish") : t("switchToBengali");

  return (
    <Button
      type="button"
      variant="ghost"
      size={variant === "compact" ? "sm" : "default"}
      aria-label={t("toggleAria")}
      className={cn(
        "shrink-0 text-muted-foreground hover:text-foreground",
        variant === "compact" && "h-8 px-2 text-xs font-medium",
        className
      )}
      onClick={() => {
        localStorage.setItem(CORE_LOCALE_STORAGE_KEY, nextLocale);
        setLocalePreferenceCookie(nextLocale);
        router.replace(pathname, { locale: nextLocale });
      }}
    >
      {label}
    </Button>
  );
}
