import type { LucideIcon } from "lucide-react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { 
  PlugsIcon, 
  StorefrontIcon, 
  ShoppingCartIcon, 
  BellRingingIcon, 
  AppStoreLogoIcon,
} from "@phosphor-icons/react";

import {
  Layers,
  User,
  Shield,
  CreditCard,
  Palette,
  Users,
  Globe,
} from "lucide-react";

/** Lucide or Phosphor SVG icon used in settings nav (sidebar + in-page tabs). */
export type SettingsSectionIcon = LucideIcon | PhosphorIcon;

export type SettingsSection =
  | "account"
  | "store"
  | "customization"
  | "checkout"
  | "eav"
  | "apps"
  | "integrations"
  | "domains"
  | "notifications"
  | "team"
  | "security"
  | "billing";

export type SettingsSectionLabelKey =
  | "sectionStore"
  | "sectionCustomization"
  | "sectionEav"
  | "sectionApps"
  | "sectionIntegrations"
  | "sectionDomains"
  | "sectionNotifications"
  | "sectionAccount"
  | "sectionSecurity"
  | "sectionBilling";

/** Nav row: translated label key or literal label (checkout/team; English-only for now). */
export type SettingsSectionNavItem =
  | {
      id: Exclude<SettingsSection, "checkout" | "team">;
      labelKey: SettingsSectionLabelKey;
      icon: SettingsSectionIcon;
    }
  | { id: "checkout" | "team"; displayLabel: string; icon: SettingsSectionIcon };

/**
 * Sections gated by RBAC permission key(s); absent = visible to any staff.
 *
 * The key mirrors what the section's backend GET requires, so a role that can't
 * load a section never sees its nav row (fixes "shown but 403s" for staff). A
 * single string requires that key; an array requires ANY of the keys — used by
 * Integrations, which bundles marketing (integrations.*) + couriers (couriers.*).
 */
export const SECTION_PERMISSION: Partial<Record<SettingsSection, string | string[]>> = {
  store: "settings.view",
  customization: "theming.view",
  checkout: "settings.view",
  eav: "products.view",
  apps: "settings.view",
  integrations: ["integrations.view", "couriers.view"],
  domains: "domains.view",
  notifications: "settings.manage",
  team: "team.view",
  billing: "billing.view",
};

/** True if `has` satisfies a section's requirement (any-of for arrays; none = open). */
export function sectionMatchesPermission(
  required: string | string[] | undefined,
  has: (key: string) => boolean,
): boolean {
  if (!required) return true;
  return (Array.isArray(required) ? required : [required]).some((k) => has(k));
}

/** Sections only the store owner (or platform superuser) may see. */
export const SECTION_OWNER_ONLY: Partial<Record<SettingsSection, boolean>> = {
  security: true,
};

/** Every settings section that exists, before any feature-flag filtering. */
export const ALL_SECTIONS: SettingsSectionNavItem[] = [
  { id: "store", labelKey: "sectionStore", icon: StorefrontIcon },
  { id: "customization", labelKey: "sectionCustomization", icon: Palette },
  {
    id: "checkout",
    displayLabel: "Checkout",
    icon: ShoppingCartIcon,
  },
  { id: "eav", labelKey: "sectionEav", icon: Layers },
  { id: "apps", labelKey: "sectionApps", icon: AppStoreLogoIcon },
  { id: "integrations", labelKey: "sectionIntegrations", icon: PlugsIcon },
  { id: "domains", labelKey: "sectionDomains", icon: Globe },
  { id: "notifications", labelKey: "sectionNotifications", icon: BellRingingIcon },
  { id: "team", displayLabel: "Team", icon: Users },
  { id: "account", labelKey: "sectionAccount", icon: User },
  { id: "security", labelKey: "sectionSecurity", icon: Shield },
  { id: "billing", labelKey: "sectionBilling", icon: CreditCard },
];

/**
 * Custom domains stay hidden until the platform can actually serve them.
 *
 * With the API's TRAEFIK_CERT_PROVISIONING_ENABLED and HOST_STORE_ROUTING_ENABLED
 * off, connecting a domain still writes a real StoreDomain row and the background
 * verifier can flip it to active -- so the UI would badge it "Live" and tell the
 * merchant their store is at https://theirdomain.com while no certificate exists
 * and no hostname binds to a store. Pointing a live domain here on that promise
 * takes the shop down.
 *
 * Set NEXT_PUBLIC_DOMAINS_ENABLED=1 only once the shared storefront is serving
 * host-routed traffic and certificates are being issued.
 */
const DOMAINS_UI_ENABLED = process.env.NEXT_PUBLIC_DOMAINS_ENABLED === "1";

export const SECTIONS: SettingsSectionNavItem[] = ALL_SECTIONS.filter(
  (section) => section.id !== "domains" || DOMAINS_UI_ENABLED,
);
