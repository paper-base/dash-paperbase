"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { verifyTwoFactorChallenge } from "@/lib/auth";
import { CATALOG_INCLUDED_APP_IDS, OPTIONAL_APP_IDS } from "@/config/apps";
import { parseValidation, storeCreateSchema } from "@/lib/validation";
import { clearPendingVerificationEmail } from "@/lib/verification-state";
import { notify, normalizeError } from "@/notifications";

const STORAGE_KEY = "core_enabled_apps";

export interface StoreFormData {
  name: string;
  store_type: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  phone: string;
  contact_email: string;
  address: string;
}

type StoreFormErrors = Partial<Record<keyof StoreFormData, string>>;
export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

/** POST /stores/ — no api_key; keys are created in Settings → Networking. */
type StoreCreateResponse = { public_id: string };

interface MeResponse {
  active_store_public_id: string | null;
  email?: string;
  first_name?: string;
  last_name?: string;
  stores: { public_id: string; name: string; role: string }[];
}

export function useOnboarding() {
  const router = useRouter();
  const t = useTranslations("auth.onboarding");
  const tPages = useTranslations("pages");
  const searchParams = useSearchParams();
  const isAddMode = searchParams.get("add") === "1";
  const { isAuthenticated, isLoading: authLoading, authHydrated } = useAuth();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<StoreFormErrors>({});

  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    store_type: "",
    owner_first_name: "",
    owner_last_name: "",
    owner_email: "",
    phone: "",
    contact_email: "",
    address: "",
  });

  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    () => new Set(OPTIONAL_APP_IDS)
  );

  useEffect(() => {
    if (!authHydrated) return;
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    async function checkStore() {
      try {
        const { data } = await api.get<MeResponse>("auth/me/");
        const hasStores = (data.stores?.length ?? 0) > 0;
        if (data.active_store_public_id && hasStores && !isAddMode) {
          router.replace("/");
          return;
        }
        setFormData((prev) => ({
          ...prev,
          owner_email: data.email || prev.owner_email,
          owner_first_name: prev.owner_first_name || data.first_name || "",
          owner_last_name: prev.owner_last_name || data.last_name || "",
        }));
        setChecking(false);
      } catch {
        setChecking(false);
      }
    }
    checkStore();
  }, [isAuthenticated, authLoading, authHydrated, router, isAddMode]);

  function updateField<K extends keyof StoreFormData>(
    key: K,
    value: StoreFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function toggleApp(appId: string) {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  }

  const STEP_FIELDS: Record<2 | 3 | 4, Array<keyof StoreFormData>> = {
    2: ["owner_first_name", "owner_last_name"],
    3: ["name", "store_type", "contact_email"],
    4: ["owner_email", "phone", "address"],
  };
  const STEP_SCHEMAS = {
    2: storeCreateSchema.pick({ owner_first_name: true, owner_last_name: true }),
    3: storeCreateSchema.pick({ name: true, store_type: true, contact_email: true }),
    4: storeCreateSchema.pick({ owner_email: true, phone: true, address: true }),
  } as const;

  function validateCurrentStep(currentStep: OnboardingStep): boolean {
    if (currentStep === 1 || currentStep === 5) return true;

    const validation = parseValidation(STEP_SCHEMAS[currentStep], formData);
    if (validation.success) {
      setFieldErrors({});
      setError("");
      return true;
    }

    const stepFields = STEP_FIELDS[currentStep];
    const nextFieldErrors: StoreFormErrors = {};

    for (const key of stepFields) {
      if (validation.errors[key]) {
        nextFieldErrors[key] = validation.errors[key];
      }
    }

    setFieldErrors(nextFieldErrors);
    setError(
      stepFields.map((key) => validation.errors[key]).find(Boolean) ??
        tPages("formFixHighlighted")
    );
    return false;
  }

  async function nextStep() {
    if (step === 5 || stepLoading || loading) return;
    if (!validateCurrentStep(step)) return;

    setStepLoading(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 220));
    setStep((prev) => (prev < 5 ? ((prev + 1) as OnboardingStep) : prev));
    setStepLoading(false);
  }

  async function prevStep() {
    if (step === 1 || stepLoading || loading) return;
    setStepLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setStep((prev) => (prev > 1 ? ((prev - 1) as OnboardingStep) : prev));
    setStepLoading(false);
  }

  async function submitFinalStep(e: React.FormEvent) {
    e.preventDefault();
    if (stepLoading || loading) return;
    if (!validateCurrentStep(4)) return;
    setError("");
    setLoading(true);
    try {
      const modules_enabled: Record<string, boolean> = {};
      for (const id of CATALOG_INCLUDED_APP_IDS) {
        modules_enabled[id] = true;
      }
      for (const id of OPTIONAL_APP_IDS) {
        modules_enabled[id] = selectedApps.has(id);
      }
      const { data: store } = await api.post<StoreCreateResponse>("stores/", {
        name: formData.name.trim(),
        store_type: formData.store_type.trim() || undefined,
        owner_first_name: formData.owner_first_name.trim(),
        owner_last_name: formData.owner_last_name.trim(),
        owner_email: formData.owner_email.trim(),
        contact_email: formData.contact_email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        modules_enabled,
      });

      const { data: switchData } = await api.post<{
        access: string;
        refresh: string;
        active_store_public_id?: string;
        ["2fa_required"]?: boolean;
        challenge_public_id?: string;
      }>("auth/switch-store/", { store_public_id: store.public_id });

      if ("2fa_required" in switchData && switchData["2fa_required"] && switchData.challenge_public_id) {
        const promptResult = await notify.prompt({
          title: t("prompt2fa"),
          confirmLabel: { key: "common.next" },
          cancelLabel: { key: "common.cancel" },
          required: true,
          level: "warning",
        });
        if (!promptResult.confirmed || !promptResult.value) {
          setError(t("twoFaRequired"));
          return;
        }
        await verifyTwoFactorChallenge(switchData.challenge_public_id, promptResult.value);
      } else {
        localStorage.setItem("access_token", switchData.access);
        localStorage.setItem("refresh_token", switchData.refresh);
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          [...selectedApps].filter((id) =>
            OPTIONAL_APP_IDS.includes(id as (typeof OPTIONAL_APP_IDS)[number])
          )
        )
      );

      clearPendingVerificationEmail();
      router.push("/");
    } catch (err: unknown) {
      const normalized = normalizeError(err, t("createStoreFailed"));
      setError(normalized.message);
      notify.error(normalized.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    isAddMode,
    isReady: authHydrated && !authLoading && !checking,
    step,
    loading,
    stepLoading,
    error,
    fieldErrors,
    formData,
    selectedApps,
    updateField,
    toggleApp,
    nextStep,
    prevStep,
    submitFinalStep,
  };
}
