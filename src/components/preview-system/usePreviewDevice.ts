"use client";

import { useState } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  mobile: "320px",
  tablet: "768px",
  desktop: "100%",
};

export function usePreviewDevice(initial: DeviceType = "desktop") {
  const [device, setDevice] = useState<DeviceType>(initial);
  return { device, setDevice, width: DEVICE_WIDTHS[device] };
}
