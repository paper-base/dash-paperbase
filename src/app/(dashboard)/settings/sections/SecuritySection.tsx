 "use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function SecuritySection({ hidden }: { hidden: boolean }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryRequestLoading, setRecoveryRequestLoading] = useState(false);
  const [recoveryVerifyLoading, setRecoveryVerifyLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hidden) return;
    void loadStatus();
  }, [hidden]);

  async function loadStatus() {
    try {
      const { data } = await api.get<{ is_enabled: boolean }>("auth/2fa/status/");
      setIsEnabled(!!data.is_enabled);
    } catch {
      setMessage("Failed to load 2FA status.");
    }
  }

  async function startSetup() {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.get<{ qr_code: string; secret: string }>("auth/2fa/setup/");
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setMessage("Scan the QR code, then enter the OTP to enable 2FA.");
    } catch {
      setMessage("Could not start 2FA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function verifySetup() {
    setLoading(true);
    setMessage("");
    try {
      await api.post("auth/2fa/verify/", { code: setupCode });
      setIsEnabled(true);
      setQrCode("");
      setSecret("");
      setSetupCode("");
      setMessage("2FA enabled successfully.");
    } catch {
      setMessage("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  }

  async function requestRecoveryCode() {
    setRecoveryRequestLoading(true);
    setRecoveryMessage("");
    try {
      await api.post("auth/2fa/recovery/request/");
      setRecoveryMessage("Recovery code sent to your email");
    } catch {
      setRecoveryMessage("Could not send recovery code. Try again later.");
    } finally {
      setRecoveryRequestLoading(false);
    }
  }

  async function verifyRecoveryAndDisable() {
    setRecoveryVerifyLoading(true);
    setRecoveryMessage("");
    try {
      const { data } = await api.post<{
        is_enabled: boolean;
        detail?: string;
      }>("auth/2fa/recovery/verify/", { code: recoveryCode });
      setIsEnabled(!!data.is_enabled);
      setRecoveryCode("");
      setDisablePassword("");
      setDisableCode("");
      setRecoveryMessage("");
      toast.success(
        data.detail ?? "2FA has been disabled successfully."
      );
    } catch {
      setRecoveryMessage("Invalid or expired recovery code.");
    } finally {
      setRecoveryVerifyLoading(false);
    }
  }

  async function disable2FA() {
    setLoading(true);
    setMessage("");
    try {
      await api.post("auth/2fa/disable/", {
        password: disablePassword,
        code: disableCode,
      });
      setIsEnabled(false);
      setDisablePassword("");
      setDisableCode("");
      setMessage("");
      toast.success("2FA disabled. Confirmation email sent.");
    } catch {
      setMessage("Failed to disable 2FA. Check password and OTP code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="panel-security"
      role="tabpanel"
      aria-labelledby="tab-security"
      hidden={hidden}
      className="rounded-xl border border-dashed border-border bg-background p-4 md:p-6"
    >
      <h2 className="text-lg font-medium text-foreground">Security</h2>
      <p className="mb-4 text-sm text-muted-foreground">Manage your authenticator-based 2FA.</p>

      <div className="w-full max-w-6xl space-y-4">
        <div className="text-sm">
          Status:{" "}
          <span className={isEnabled ? "text-emerald-500" : "text-muted-foreground"}>
            {isEnabled ? "2FA Enabled" : "2FA Disabled"}
          </span>
        </div>

        {!isEnabled ? (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Button type="button" onClick={startSetup} disabled={loading}>
              Enable 2FA
            </Button>
            {qrCode ? <img src={qrCode} alt="2FA QR Code" className="h-44 w-44 border border-border" /> : null}
            {secret ? <p className="text-xs text-muted-foreground">Secret (shown once): {secret}</p> : null}
            {qrCode ? (
              <div className="flex gap-2">
                <Input
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  placeholder="Enter OTP from app"
                />
                <Button type="button" onClick={verifySetup} disabled={loading}>
                  Verify
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                To disable 2FA, confirm with your password and current OTP.
              </p>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Current password"
              />
              <Input
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="Current OTP code"
              />
              <Button type="button" variant="destructive" onClick={disable2FA} disabled={loading}>
                Disable 2FA
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <h3 className="text-sm font-medium text-foreground">
                Can&apos;t access your 2FA device?
              </h3>
              <p className="text-sm text-muted-foreground">
                If you cannot access your authenticator device, you can request a recovery code via
                email.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={requestRecoveryCode}
                disabled={recoveryRequestLoading || recoveryVerifyLoading}
              >
                {recoveryRequestLoading ? "Sending…" : "Send recovery code"}
              </Button>
              <div className="space-y-2">
                <Input
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Recovery code"
                  autoComplete="one-time-code"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={verifyRecoveryAndDisable}
                  disabled={recoveryVerifyLoading || !recoveryCode.trim()}
                >
                  {recoveryVerifyLoading ? "Verifying…" : "Verify & Disable 2FA"}
                </Button>
              </div>
              {recoveryMessage ? (
                <p className="text-sm text-muted-foreground">{recoveryMessage}</p>
              ) : null}
            </div>
          </div>
        )}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </section>
  );
}

