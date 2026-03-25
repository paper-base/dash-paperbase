"use client";

import { SettingsSectionBody, settingsSectionSurfaceClassName } from "../SettingsSectionBody";
import CourierIntegration from "./CourierIntegration";
import MarketingIntegration from "./MarketingIntegration";

export default function IntegrationsSection({
  hidden,
}: {
  hidden: boolean;
}) {
  return (
    <section
      id="panel-integrations"
      role="tabpanel"
      aria-labelledby="tab-integrations"
      hidden={hidden}
      className={settingsSectionSurfaceClassName}
    >
      <SettingsSectionBody>
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect marketing and delivery tools to your store. More integrations are added over time.
          </p>
        </div>

        <div className="space-y-6">
          <MarketingIntegration />
          <CourierIntegration />
        </div>
      </SettingsSectionBody>
    </section>
  );
}
