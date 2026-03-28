"use client";

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
          <h2 className="text-lg font-medium text-foreground">Dynamic Fields</h2>
          <p className="text-sm text-muted-foreground">
            Define custom extra fields for products. They appear on product create and edit forms and are stored in
            each product&apos;s extra data via the API.
          </p>
        </div>
        <DynamicFieldsPanel message={message} onMessage={onMessage} />
      </SettingsSectionBody>
    </section>
  );
}

