"use client";

import { useTranslations } from "next-intl";
import { DynamicFieldsPanel, type DynamicFieldsMessage } from "@/components/DynamicFieldsPanel";
import { SettingsSectionBody, settingsSectionSurfaceClassName } from "../SettingsSectionBody";

export default function DynamicFieldsSection({
  hidden,
  message,
  onMessage,
}: {
  hidden: boolean;
  message: DynamicFieldsMessage;
  onMessage: (msg: DynamicFieldsMessage) => void;
}) {
  const t = useTranslations("settings");
  return (
    <section
      id="panel-eav"
      role="tabpanel"
      aria-labelledby="tab-eav"
      hidden={hidden}
      className={settingsSectionSurfaceClassName}
    >
      <SettingsSectionBody>
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground">{t("dynamicFields.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("dynamicFields.subtitle")}</p>
        </div>
        <DynamicFieldsPanel message={message} onMessage={onMessage} />
      </SettingsSectionBody>
    </section>
  );
}

