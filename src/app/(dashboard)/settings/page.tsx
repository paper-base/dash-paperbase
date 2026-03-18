"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Undo2,
  User,
  Store,
  Plug,
  Key,
  Bell,
  Shield,
  CreditCard,
  Database,
  ChevronDown,
  Layers,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import api from "@/lib/api";
import { useBranding, defaultBranding } from "@/context/BrandingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useEnabledApps } from "@/hooks/useEnabledApps";
import { APP_CONFIG, ESSENTIAL_APP_IDS, OPTIONAL_APP_IDS } from "@/config/apps";

type SettingsSection =
  | "account"
  | "store"
  | "eav"
  | "apps"
  | "integrations"
  | "api"
  | "notifications"
  | "security"
  | "billing"
  | "data";

const SECTIONS: { id: SettingsSection; label: string; icon: LucideIcon }[] = [
  { id: "store", label: "Store Info", icon: Store },
  { id: "eav", label: "EAV", icon: Layers },
  { id: "apps", label: "Apps", icon: LayoutGrid },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "api", label: "API & Developers", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "data", label: "Data & Export", icon: Database },
];

function logoUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base ? `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}` : url;
}

const NOTIFICATION_PREFS_KEY = "gadzillabd_notification_prefs";

type NotificationPrefs = {
  orders: boolean;
  carts: boolean;
  wishlist: boolean;
  contacts: boolean;
};

const defaultPrefs: NotificationPrefs = {
  orders: true,
  carts: true,
  wishlist: true,
  contacts: true,
};

function SectionNav({
  activeSection,
  onSelect,
  onNavigate,
  className,
  variant = "vertical",
}: {
  activeSection: SettingsSection;
  onSelect: (id: SettingsSection) => void;
  onNavigate?: () => void;
  className?: string;
  variant?: "vertical" | "horizontal";
}) {
  return (
    <nav
      className={cn(
        variant === "vertical" ? "flex flex-col gap-0.5" : "flex flex-row gap-2 flex-nowrap",
        className
      )}
      role="tablist"
      aria-label="Settings sections"
    >
      {SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeSection === id}
          aria-controls={`panel-${id}`}
          id={`tab-${id}`}
          onClick={() => {
            onSelect(id);
            onNavigate?.();
          }}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors shrink-0",
            variant === "vertical" && "rounded-lg px-3 py-2.5 text-left",
            variant === "horizontal" && "rounded-none border px-4 py-2.5 text-center text-sm whitespace-nowrap",
            variant === "vertical" &&
              (activeSection === id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"),
            variant === "horizontal" &&
              (activeSection === id
                ? "border-border bg-foreground text-background"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground")
          )}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function DesktopSectionNav({
  activeSection,
  onSelect,
}: {
  activeSection: SettingsSection;
  onSelect: (id: SettingsSection) => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-hide scroll-smooth">
      <SectionNav
        activeSection={activeSection}
        onSelect={onSelect}
        variant="horizontal"
      />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { branding, isLoading, refetch } = useBranding();
  const enabledApps = useEnabledApps();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [adminName, setAdminName] = useState(defaultBranding.admin_name);
  const [adminSubtitle, setAdminSubtitle] = useState(defaultBranding.admin_subtitle);
  const [currencySymbol, setCurrencySymbol] = useState(defaultBranding.currency_symbol);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [storeSaving, setStoreSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [storeMessage, setStoreMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(defaultPrefs);

  useEffect(() => {
    if (branding) {
      setAdminName(branding.admin_name);
      setAdminSubtitle(branding.admin_subtitle);
      setCurrencySymbol(branding.currency_symbol ?? defaultBranding.currency_symbol);
    }
  }, [branding]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
      setNotificationPrefs({ ...defaultPrefs, ...parsed });
    } catch {
      // ignore and keep defaults
    }
  }, []);

  function updateNotificationPref(key: keyof NotificationPrefs, value: boolean) {
    setNotificationPrefs((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
      }
      return next;
    });
  }

  const currentLogoUrl = logoUrl(branding?.logo_url ?? null);
  const previewUrl = logoFile ? URL.createObjectURL(logoFile) : currentLogoUrl;

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAccountSaving(true);
    setAccountMessage(null);
    try {
      // TODO: wire up to owner profile API when available
      setAccountMessage({ type: "success", text: "Profile saved." });
    } catch {
      setAccountMessage({ type: "error", text: "Failed to save profile." });
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleStoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStoreSaving(true);
    setStoreMessage(null);
    try {
      const formData = new FormData();
      formData.append("admin_name", adminName || defaultBranding.admin_name);
      formData.append("admin_subtitle", adminSubtitle || defaultBranding.admin_subtitle);
      formData.append(
        "currency_symbol",
        (currencySymbol || defaultBranding.currency_symbol).trim().slice(0, 10)
      );
      if (logoFile) formData.append("logo", logoFile);
      if (clearLogo) formData.append("clear_logo", "true");

      await api.patch("/api/admin/branding/", formData);
      await refetch();
      setLogoFile(null);
      setClearLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStoreMessage({ type: "success", text: "Store settings saved." });
    } catch {
      setStoreMessage({ type: "error", text: "Failed to save store settings." });
    } finally {
      setStoreSaving(false);
    }
  }

  const activeSectionMeta = SECTIONS.find((s) => s.id === activeSection);
  const activeLabel = activeSectionMeta?.label ?? "Settings";
  const ActiveIcon = activeSectionMeta?.icon;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted/80 px-1 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Go back"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <Undo2 className="size-4" />
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your control center for store owners. Manage your store identity, products, orders,
              integrations, and more.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* Mobile: in-place expandable section picker */}
        <div className="lg:hidden">
          <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span className="flex items-center gap-2">
                  {ActiveIcon && <ActiveIcon className="size-4" />}
                  {activeLabel}
                </span>
                <ChevronDown
                  className={cn("size-4 shrink-0 transition-transform", mobileNavOpen && "rotate-180")}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
                <SectionNav
                  activeSection={activeSection}
                  onSelect={(id) => {
                    setActiveSection(id);
                    setMobileNavOpen(false);
                  }}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop: horizontal nav at top */}
        <div className="hidden lg:block" aria-label="Settings navigation">
          <DesktopSectionNav activeSection={activeSection} onSelect={setActiveSection} />
        </div>

        {/* Content area */}
        <main className="min-w-0 flex-1">
          {/* Account section */}
          <section
            id="panel-account"
            role="tabpanel"
            aria-labelledby="tab-account"
            hidden={activeSection !== "account"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <form onSubmit={handleAccountSubmit} className="w-full max-w-6xl space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="first_name"
                      className="text-sm font-medium leading-normal text-foreground"
                    >
                      First name
                    </label>
                    <Input
                      id="first_name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="last_name"
                      className="text-sm font-medium leading-normal text-foreground"
                    >
                      Last name
                    </label>
                    <Input
                      id="last_name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-normal text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full max-w-md"
                  />
                </div>

                {accountMessage && (
                  <p
                    className={
                      accountMessage.type === "success"
                        ? "text-sm text-green-600"
                        : "text-sm text-destructive"
                    }
                  >
                    {accountMessage.text}
                  </p>
                )}

                <Button type="submit" disabled={accountSaving}>
                  {accountSaving ? "Saving…" : "Save account settings"}
                </Button>
              </form>
            )}
          </section>

          {/* Store Info section */}
          <section
            id="panel-store"
            role="tabpanel"
            aria-labelledby="tab-store"
            hidden={activeSection !== "store"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">Store Info</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Your store identity. Powers frontend, invoices, and emails.
            </p>
            <form onSubmit={handleStoreSubmit} className="w-full max-w-6xl space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Logo
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {previewUrl && !clearLogo ? (
                    <div className="relative size-20 overflow-hidden rounded-full border border-border bg-muted">
                      <img src={previewUrl} alt="Logo preview" className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-border bg-muted text-muted-foreground">
                      No logo
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setLogoFile(f || null);
                        if (f) setClearLogo(false);
                      }}
                    />
                    {currentLogoUrl && (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={clearLogo}
                          onChange={(e) => {
                            setClearLogo(e.target.checked);
                            if (e.target.checked) setLogoFile(null);
                          }}
                        />
                        Remove logo
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="store_admin_name"
                  className="text-sm font-medium leading-normal text-foreground"
                >
                  Store name
                </label>
                <Input
                  id="store_admin_name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Gadzilla"
                  className="w-full max-w-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="store_admin_subtitle"
                  className="text-sm font-medium leading-normal text-foreground"
                >
                  Store category and type
                </label>
                <Input
                  id="store_admin_subtitle"
                  value={adminSubtitle}
                  onChange={(e) => setAdminSubtitle(e.target.value)}
                  placeholder="e.g. Electronics, Gadgets & accessories"
                  className="w-full max-w-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Store Description</label>
                <Input placeholder="Brief description of your store" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Contact Email</label>
                <Input placeholder="contact@yourstore.com" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <Input placeholder="+880 1XXX-XXXXXX" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Address</label>
                <Input placeholder="Store address" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Currency</label>
                <Input placeholder="BDT, USD, etc." disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="store_currency_symbol"
                  className="text-sm font-medium leading-normal text-foreground"
                >
                  Currency symbol
                </label>
                <Input
                  id="store_currency_symbol"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="e.g. ৳, $, €"
                  className="w-full max-w-[8rem]"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Used in front of all prices across the dashboard (orders, products, etc.).
                </p>
              </div>

              {storeMessage && (
                <p
                  className={
                    storeMessage.type === "success"
                      ? "text-sm text-green-600"
                      : "text-sm text-destructive"
                  }
                >
                  {storeMessage.text}
                </p>
              )}

              <Button type="submit" disabled={storeSaving}>
                {storeSaving ? "Saving…" : "Save store settings"}
              </Button>
            </form>
          </section>

          {/* EAV section */}
          <section
            id="panel-eav"
            role="tabpanel"
            aria-labelledby="tab-eav"
            hidden={activeSection !== "eav"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">EAV Attributes</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Define custom attributes per entity type. Each store can add flexible fields for
              products, variants, categories, customers, and orders.
            </p>
            <div className="w-full max-w-6xl space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Entity Type</label>
                <Input
                  placeholder="Product, Variant, Category, Customer, Order"
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Select which entity to configure attributes for.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Attribute Key</label>
                  <Input placeholder="e.g. color, size, warranty" disabled />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Field Type</label>
                  <Input placeholder="text, number, select, date" disabled />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Attribute Label</label>
                <Input placeholder="Human-readable label for dashboards" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Options (for select/multiselect)</label>
                <Input placeholder="Comma-separated or JSON options" disabled />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" disabled className="rounded" />
                  <span className="text-muted-foreground">Required</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" disabled className="rounded" />
                  <span className="text-muted-foreground">Filterable</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" disabled className="rounded" />
                  <span className="text-muted-foreground">Active</span>
                </label>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Entity types supported</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• Product — Size, Color, Material, etc.</li>
                  <li>• Variant — Per-variant attributes (SKU-level)</li>
                  <li>• Category — Category-specific metadata</li>
                  <li>• Customer — Custom customer fields (company, VAT, etc.)</li>
                  <li>• Order — Order metadata (source, campaign, notes)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Apps section */}
          <section
            id="panel-apps"
            role="tabpanel"
            aria-labelledby="tab-apps"
            hidden={activeSection !== "apps"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">Apps</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Control which data models and features are available in your store. Essential apps
              are always enabled.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Essential
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ESSENTIAL_APP_IDS.map((id) => {
                    const app = APP_CONFIG[id];
                    const Icon = app.icon;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                      >
                        <Icon className="size-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{app.label}</p>
                          <p className="text-xs text-muted-foreground">{app.description}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                          Always on
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Optional
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {OPTIONAL_APP_IDS.map((id) => {
                    const app = APP_CONFIG[id];
                    const Icon = app.icon;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                      >
                        <Icon className="size-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{app.label}</p>
                          <p className="text-xs text-muted-foreground">{app.description}</p>
                        </div>
                        <label className="flex shrink-0 cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={enabledApps.isEnabled(id)}
                            onChange={() => enabledApps.toggleApp(id)}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-muted-foreground">
                            {enabledApps.isEnabled(id) ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Integrations section */}
          <section
            id="panel-integrations"
            role="tabpanel"
            aria-labelledby="tab-integrations"
            hidden={activeSection !== "integrations"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">Integrations</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Connect payment gateways, SMS, email, AI, and analytics. Uses your API key system.
            </p>
            <div className="w-full max-w-6xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Payment Gateways</label>
                <Input placeholder="Stripe, SSLCommerz, etc." disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">SMS API</label>
                <Input placeholder="Configure SMS provider" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Email Service</label>
                <Input placeholder="Configure email provider" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">AI API</label>
                <Input placeholder="OpenAI, etc." disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Analytics Tools</label>
                <Input placeholder="Connect analytics" disabled />
              </div>
            </div>
          </section>

          {/* API & Developers section */}
          <section
            id="panel-api"
            role="tabpanel"
            aria-labelledby="tab-api"
            hidden={activeSection !== "api"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">API & Developer Settings</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate API keys, configure webhooks, and view API usage. Your BaaS core.
            </p>
            <div className="w-full max-w-6xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">API Keys</label>
                <Input placeholder="Generate or regenerate keys" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Webhooks</label>
                <Input placeholder="Configure webhook endpoints" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">API Usage Logs</label>
                <Input placeholder="View usage and limits" disabled />
              </div>
            </div>
          </section>

          {/* Notifications section */}
          <section
            id="panel-notifications"
            role="tabpanel"
            aria-labelledby="tab-notifications"
            hidden={activeSection !== "notifications"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <div className="w-full max-w-6xl space-y-6">
              <div>
                <h2 className="text-lg font-medium text-foreground">Notification preferences</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose which events should generate notifications in the top bar.
                </p>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground">Orders</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.orders}
                    onChange={(e) => updateNotificationPref("orders", e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground">Cart items</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.carts}
                    onChange={(e) => updateNotificationPref("carts", e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground">Wishlist items</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.wishlist}
                    onChange={(e) => updateNotificationPref("wishlist", e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground">Contact form submissions</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.contacts}
                    onChange={(e) => updateNotificationPref("contacts", e.target.checked)}
                  />
                </label>
              </div>
              <div className="border-t border-border pt-4">
                <label className="text-sm font-medium text-foreground">Delivery preference</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Choose how to receive notifications (coming soon).
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="radio" name="delivery" disabled />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="radio" name="delivery" disabled />
                    In-app
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Security section */}
          <section
            id="panel-security"
            role="tabpanel"
            aria-labelledby="tab-security"
            hidden={activeSection !== "security"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">Security</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Change password, manage 2FA, active sessions, and login activity.
            </p>
            <div className="w-full max-w-6xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Change Password</label>
                <Input type="password" placeholder="••••••••" disabled />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled className="rounded" />
                <label className="text-sm text-muted-foreground">Two-factor authentication (2FA)</label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Active Sessions</label>
                <Input placeholder="View and manage sessions" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Login Activity</label>
                <Input placeholder="View login history" disabled />
              </div>
            </div>
          </section>

          {/* Billing section */}
          <section
            id="panel-billing"
            role="tabpanel"
            aria-labelledby="tab-billing"
            hidden={activeSection !== "billing"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">Billing & Plan</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Current plan, upgrade/downgrade, usage (API, storage), and payment history.
            </p>
            <div className="w-full max-w-6xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Current Plan</label>
                <Input placeholder="View your plan" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Usage</label>
                <Input placeholder="API calls, storage, etc." disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Payment History</label>
                <Input placeholder="View invoices and payments" disabled />
              </div>
            </div>
          </section>

          {/* Data & Export section */}
          <section
            id="panel-data"
            role="tabpanel"
            aria-labelledby="tab-data"
            hidden={activeSection !== "data"}
            className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
          >
            <h2 className="text-lg font-medium text-foreground">Data & Export</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Export products, orders, backup your data, or delete your store.
            </p>
            <div className="w-full max-w-6xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Export Products</label>
                <Input placeholder="CSV / JSON" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Export Orders</label>
                <Input placeholder="Download order data" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Backup Download</label>
                <Input placeholder="Full store backup" disabled />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-destructive">Delete Store</label>
                <Input placeholder="Permanently delete store and all data" disabled />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
