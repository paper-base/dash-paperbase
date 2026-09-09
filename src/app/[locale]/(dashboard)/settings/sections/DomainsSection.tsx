"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ClipboardTextIcon } from "@phosphor-icons/react";
import { Check, Globe, Plus, RefreshCcw, Star, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDashboardDateTime } from "@/lib/datetime-display";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/context/ConfirmDialogContext";
import { usePermissions } from "@/context/PermissionsContext";
import { notify } from "@/notifications";
import {
  SettingsSectionBody,
  settingsInvertedButtonClassName,
  settingsSectionSurfaceClassName,
} from "../SettingsSectionBody";
import {
  useConnectDomain,
  useDomainsQuery,
  useRemoveDomain,
  useSetPrimaryDomain,
  useVerifyDomain,
} from "@/lib/domains/hooks";
import type {
  StoreDomain,
  StoreDomainDnsRecord,
  StoreDomainStatus,
} from "@/lib/domains/api";

/** Colour per lifecycle state, mirroring the order-status badge conventions. */
function statusBadgeClassName(status: StoreDomainStatus): string {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
    case "verifying":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100";
    case "failed":
      return "border-destructive/35 bg-destructive/5 text-destructive";
    case "disabled":
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}


/** Mirrors the server's canonical URL rule: https everywhere but local suffixes. */
function storefrontUrlFor(hostname: string): string {
  const isLocal =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".test");
  return `${isLocal ? "http" : "https"}://${hostname}`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0"
      aria-label={label}
      onClick={() => {
        void navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          })
          .catch(() => setCopied(false));
      }}
    >
      {copied ? (
        <Check className="size-4 animate-pulse text-emerald-600" />
      ) : (
        <ClipboardTextIcon className="size-4" />
      )}
    </Button>
  );
}

function DnsRecords({ records }: { records: StoreDomainDnsRecord[] }) {
  const t = useTranslations("settings");
  if (records.length === 0) return null;
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {t("domains.dnsHeading")}
      </p>
      {records.map((record) => (
        <div
          key={`${record.type}:${record.name}:${record.value}`}
          className="rounded-ui border border-border bg-background px-3 py-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-ui border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
              {record.type}
            </span>
            <code className="min-w-0 break-all text-xs text-muted-foreground">{record.name}</code>
          </div>
          <div className="mt-2 flex items-start justify-between gap-2">
            <code className="min-w-0 break-all rounded-ui bg-muted px-2 py-1 text-sm">
              {record.value}
            </code>
            <CopyButton value={record.value} label={t("domains.copyRecordAria")} />
          </div>
          {record.note ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{record.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function DomainsSection({ hidden }: { hidden: boolean }) {
  const locale = useLocale();
  const t = useTranslations("settings");
  const tPages = useTranslations("pages");
  const confirm = useConfirm();
  const { has } = usePermissions();

  const canManage = has("domains.manage");

  const [newHostname, setNewHostname] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: allDomains = [], isLoading, isError } = useDomainsQuery({ enabled: !hidden });
  // Removed domains are retained server-side for audit; showing them here
  // would leave dead rows with live-looking controls.
  const domains = allDomains.filter((d) => d.status !== "disabled");
  // The address to show the merchant: their canonical one, falling back to any
  // live address so a store is never told it has none while it is serving.
  const liveDomain =
    domains.find((d) => d.is_primary && d.status === "active") ??
    domains.find((d) => d.status === "active") ??
    null;
  const connect = useConnectDomain();
  const verify = useVerifyDomain();
  const setPrimary = useSetPrimaryDomain();
  const remove = useRemoveDomain();

  const busy =
    connect.isPending || verify.isPending || setPrimary.isPending || remove.isPending;

  function statusLabel(status: StoreDomainStatus): string {
    switch (status) {
      case "active":
        return t("domains.statusActive");
      case "verifying":
        return t("domains.statusVerifying");
      case "pending":
        return t("domains.statusPending");
      case "failed":
        return t("domains.statusFailed");
      case "disabled":
      default:
        return t("domains.statusDisabled");
    }
  }

  async function handleConnect() {
    const hostname = newHostname.trim();
    if (!hostname || busy || !canManage) return;
    try {
      const created = await connect.mutateAsync(hostname);
      setNewHostname("");
      setExpanded(created.public_id);
      notify.success(t("domains.msgConnected"), { title: t("domains.heading") });
    } catch (error) {
      notify.error(error, {
        title: t("domains.heading"),
        fallbackMessage: t("domains.msgConnectFailed"),
      });
    }
  }

  async function handleVerify(domain: StoreDomain) {
    if (busy || !canManage) return;
    try {
      const result = await verify.mutateAsync(domain.public_id);
      if (result.verified) {
        notify.success(t("domains.msgVerified"), { title: t("domains.heading") });
      } else {
        // Not an error: DNS simply has not propagated yet. The server's message
        // says exactly which record is still missing.
        notify.info(result.message || t("domains.msgNotReady"), {
          title: t("domains.heading"),
        });
      }
    } catch (error) {
      notify.error(error, {
        title: t("domains.heading"),
        fallbackMessage: t("domains.msgVerifyFailed"),
      });
    }
  }

  async function handleSetPrimary(domain: StoreDomain) {
    if (busy || !canManage) return;
    const ok = await confirm({
      title: t("domains.setPrimary"),
      message: t("domains.confirmSetPrimary", { hostname: domain.hostname }),
      variant: "default",
    });
    if (!ok) return;
    try {
      await setPrimary.mutateAsync(domain.public_id);
      notify.success(t("domains.msgPrimaryUpdated"), { title: t("domains.heading") });
    } catch (error) {
      notify.error(error, {
        title: t("domains.heading"),
        fallbackMessage: t("domains.msgPrimaryFailed"),
      });
    }
  }

  async function handleRemove(domain: StoreDomain) {
    if (busy || !canManage) return;
    const ok = await confirm({
      title: t("domains.remove"),
      message: t("domains.confirmRemove", { hostname: domain.hostname }),
      variant: "danger",
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(domain.public_id);
      notify.success(t("domains.msgRemoved"), { title: t("domains.heading") });
    } catch (error) {
      notify.error(error, {
        title: t("domains.heading"),
        fallbackMessage: t("domains.msgRemoveFailed"),
      });
    }
  }

  return (
    <section
      id="panel-domains"
      role="tabpanel"
      aria-labelledby="tab-domains"
      hidden={hidden}
      className={settingsSectionSurfaceClassName}
    >
      <SettingsSectionBody>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{t("domains.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("domains.subtitle")}</p>
        </div>

        {liveDomain ? (
          <div className="rounded-card border border-primary/40 bg-primary/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("domains.liveAt")}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <a
                href={storefrontUrlFor(liveDomain.hostname)}
                target="_blank"
                rel="noreferrer noopener"
                className="min-w-0 break-all text-sm font-medium text-primary underline underline-offset-4"
              >
                {storefrontUrlFor(liveDomain.hostname)}
              </a>
              <CopyButton
                value={storefrontUrlFor(liveDomain.hostname)}
                label={t("domains.copyUrlAria")}
              />
            </div>
          </div>
        ) : null}

        {isError ? (
          <p
            role="status"
            className="rounded-card border border-destructive/35 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {t("domains.loadFailed")}
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("domains.loading")}</p>
        ) : (
          <div className="space-y-3">
            {domains.map((domain) => {
              const isOpen = expanded === domain.public_id;
              const records = domain.dns_records ?? [];
              const showRecords =
                domain.kind === "custom" &&
                domain.status !== "active" &&
                domain.status !== "disabled";
              return (
                <div
                  key={domain.public_id}
                  className="rounded-card border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        <p className="break-all font-medium text-foreground">{domain.hostname}</p>
                        <span
                          className={cn(
                            "rounded-ui border px-1.5 py-0.5 text-xs font-medium",
                            statusBadgeClassName(domain.status),
                          )}
                        >
                          {statusLabel(domain.status)}
                        </span>
                        {domain.is_primary ? (
                          <span className="rounded-ui border border-primary/40 bg-primary/5 px-1.5 py-0.5 text-xs font-medium text-primary">
                            {t("domains.primaryBadge")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
                        {domain.kind === "subdomain"
                          ? t("domains.kindSubdomain")
                          : t("domains.kindCustom")}
                        {domain.verified_at
                          ? ` · ${t("domains.verifiedAt")} ${formatDashboardDateTime(domain.verified_at, locale)}`
                          : ""}
                      </p>
                      {domain.check_error ? (
                        <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                          {domain.check_error}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {showRecords ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={settingsInvertedButtonClassName}
                          disabled={busy || !canManage}
                          onClick={() => void handleVerify(domain)}
                        >
                          <RefreshCcw className="mr-1 size-4" />
                          {t("domains.verifyNow")}
                        </Button>
                      ) : null}
                      {!domain.is_primary && domain.status === "active" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={settingsInvertedButtonClassName}
                          disabled={busy || !canManage}
                          onClick={() => void handleSetPrimary(domain)}
                        >
                          <Star className="mr-1 size-4" />
                          {t("domains.setPrimary")}
                        </Button>
                      ) : null}
                      {domain.removable ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          aria-label={t("domains.removeAria")}
                          disabled={busy || !canManage}
                          onClick={() => void handleRemove(domain)}
                        >
                          <Trash className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {showRecords && records.length > 0 ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setExpanded(isOpen ? null : domain.public_id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? t("domains.hideRecords") : t("domains.showRecords")}
                      </Button>
                      {isOpen ? <DnsRecords records={records} /> : null}
                    </>
                  ) : null}
                </div>
              );
            })}

            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("domains.empty")}</p>
            ) : null}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="domains_new_hostname" className="text-sm font-medium text-foreground">
            {t("domains.connectHeading")}
          </label>
          <p className="text-sm text-muted-foreground">{t("domains.connectHint")}</p>
          <div className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="domains_new_hostname"
              name="domains_new_hostname"
              type="text"
              inputMode="url"
              placeholder={t("domains.hostnamePlaceholder")}
              value={newHostname}
              onChange={(e) => setNewHostname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleConnect();
                }
              }}
              disabled={busy || !canManage}
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              data-bwignore
              className="sm:flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn("shrink-0", settingsInvertedButtonClassName)}
              loading={connect.isPending}
              disabled={busy || !canManage || newHostname.trim().length === 0}
              onClick={() => void handleConnect()}
            >
              <Plus className="mr-2 size-4" />
              {t("domains.connectButton")}
            </Button>
          </div>
        </div>
      </SettingsSectionBody>
    </section>
  );
}
