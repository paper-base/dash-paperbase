/**
 * Thin wrapper over @simplewebauthn/browser.
 *
 * The backend returns WebAuthn options as a JSON object already in the
 * SimpleWebAuthn "optionsJSON" shape (py_webauthn's options_to_json), so we pass
 * them straight through. These functions trigger the OS passkey UI (Touch ID /
 * Windows Hello / security key) and return the authenticator's response, which
 * we hand back to the server to verify.
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";

export { browserSupportsWebAuthn };

/**
 * True when this device has a usable built-in platform authenticator
 * (Touch ID / Face ID / Windows Hello / Android biometrics). Used to decide
 * whether to offer on-device passkey enrollment. Never throws.
 */
export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!browserSupportsWebAuthn()) return false;
  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}

/** True if the user cancelled/dismissed the OS passkey prompt (not a real error). */
export function isPasskeyCancellation(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name;
  return name === "NotAllowedError" || name === "AbortError";
}

export async function createPasskey(
  optionsJSON: PublicKeyCredentialCreationOptionsJSON
): Promise<RegistrationResponseJSON> {
  return startRegistration({ optionsJSON });
}

export async function getPasskeyAssertion(
  optionsJSON: PublicKeyCredentialRequestOptionsJSON
): Promise<AuthenticationResponseJSON> {
  return startAuthentication({ optionsJSON });
}
