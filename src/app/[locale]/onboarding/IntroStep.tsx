import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface IntroStepProps {
  loading: boolean;
  onStart: () => void;
}

export function IntroStep({ loading, onStart }: IntroStepProps) {
  const t = useTranslations("auth.onboarding");

  return (
    <section className="space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("introBadge")}</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("introAppName")}</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">{t("introDescription")}</p>
      </div>

      <Button type="button" onClick={onStart} disabled={loading} className="w-full">
        {loading ? t("continuing") : t("introCta")}
      </Button>
    </section>
  );
}
