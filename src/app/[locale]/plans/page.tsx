"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Zap } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { logout, getAccessToken } from "@/lib/auth";
import api from "@/lib/api";

interface Plan {
  public_id: string;
  name: string;
  price: string;
  billing_cycle: "monthly" | "yearly";
  features: {
    limits?: Record<string, number>;
    features?: Record<string, boolean>;
  };
  is_default: boolean;
}

type PageState = "loading" | "ready" | "error";

export default function PlansPage() {
  const t = useTranslations("plansPage");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    api
      .get<Plan[]>("billing/plans/")
      .then(({ data }) => {
        setPlans(data);
        setPageState("ready");
      })
      .catch(() => setPageState("error"));
  }, [router]);

  async function handleSelectPlan(plan: Plan) {
    setSelectingId(plan.public_id);
    setSelectError(null);
    try {
      await api.post("billing/payment/initiate/", {
        plan_public_id: plan.public_id,
      });
      router.push("/checkout");
    } catch (err: unknown) {
      let msg = t("initiateError");
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data?: unknown }).data;
        if (typeof data === "string") msg = data;
        else if (
          data &&
          typeof data === "object" &&
          "non_field_errors" in data &&
          Array.isArray((data as Record<string, unknown>).non_field_errors)
        ) {
          msg = ((data as Record<string, unknown[]>).non_field_errors as string[])[0] ?? msg;
        } else if (
          data &&
          typeof data === "object" &&
          "detail" in data &&
          typeof (data as Record<string, unknown>).detail === "string"
        ) {
          msg = (data as Record<string, string>).detail;
        }
      }
      setSelectError(msg);
      setSelectingId(null);
    }
  }

  function formatPrice(plan: Plan) {
    const price = parseFloat(plan.price);
    const suffix = plan.billing_cycle === "yearly" ? t("perYear") : t("perMonth");
    return `${t("currency")} ${price.toLocaleString()}${suffix}`;
  }

  const spinner = (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-1 text-sm font-semibold tracking-wide text-foreground/70">Paperbase</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
        </div>

        {/* Error loading */}
        {pageState === "error" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
            {t("errorLoad")}
          </div>
        )}

        {/* Loading */}
        {pageState === "loading" && spinner}

        {/* Plans grid */}
        {pageState === "ready" && plans.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">{t("empty")}</p>
        )}

        {pageState === "ready" && plans.length > 0 && (
          <>
            {selectError && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
                {selectError}
              </div>
            )}

            <div className="flex w-full flex-wrap justify-center gap-6 lg:gap-8">
              {plans.map((plan) => {
                const featureEntries = Object.entries(plan.features?.features ?? {}).filter(
                  ([, v]) => v === true
                );
                const limitEntries = Object.entries(plan.features?.limits ?? {});
                const isSelecting = selectingId === plan.public_id;

                return (
                  <div
                    key={plan.public_id}
                    className={`flex w-full max-w-sm flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
                      plan.is_default ? "border-primary/60 ring-1 ring-primary/30" : "border-border"
                    }`}
                  >
                    {/* Card header */}
                    <div className="border-b border-border px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" aria-hidden />
                        <h2 className="text-base font-semibold text-foreground">{plan.name}</h2>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {formatPrice(plan)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {plan.billing_cycle === "yearly" ? t("yearly") : t("monthly")}
                      </p>
                    </div>

                    {/* Features & limits */}
                    <div className="flex-1 space-y-4 px-6 py-5">
                      {featureEntries.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t("featuresLabel")}
                          </p>
                          <ul className="space-y-2.5">
                            {featureEntries.map(([key]) => (
                              <li key={key} className="flex items-start gap-3 text-sm text-foreground">
                                <span
                                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/20"
                                  aria-hidden
                                >
                                  <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                                </span>
                                <span className="min-w-0 pt-0.5 capitalize leading-snug">
                                  {key.replace(/_/g, " ")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {limitEntries.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t("limitsLabel")}
                          </p>
                          <ul className="space-y-1.5">
                            {limitEntries.map(([key, val]) => (
                              <li key={key} className="flex items-center justify-between text-sm">
                                <span className="capitalize text-muted-foreground">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="font-medium text-foreground">{val}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6">
                      <LoadingButton
                        className="w-full"
                        isLoading={isSelecting}
                        loadingText={t("initiating")}
                        disabled={selectingId !== null}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        {t("selectPlan")}
                      </LoadingButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Sign-out link */}
        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => logout()}
          >
            {tCommon("signOut")}
          </Button>
        </div>
      </div>
    </div>
  );
}
