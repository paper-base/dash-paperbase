"use client";

import { useTranslations } from "next-intl";
import { SettingsSectionBody, settingsSectionSurfaceClassName } from "../SettingsSectionBody";
import CourierIntegration from "./CourierIntegration";
import MarketingIntegration from "./MarketingIntegration";

export default function IntegrationsSection({
  hidden,
}: {
  hidden: boolean;
}) {
  const t = useTranslations("settings");
  return (
    <section
      id="panel-integrations"
      role="tabpanel"
      aria-labelledby="tab-integrations"
      hidden={hidden}
      className={settingsSectionSurfaceClassName}
    >
      <SettingsSectionBody gap="compact">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground">{t("integrations.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("integrations.subtitle")}</p>
        </div>

        <div className="space-y-4">
          <MarketingIntegration />
          <CourierIntegration />
        </div>
      </SettingsSectionBody>
    </section>
  );
}
