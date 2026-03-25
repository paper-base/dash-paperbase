import { z } from "zod";
import { emailSchema, maxWords, phoneSchema, requiredString } from "./common";

export const storeCreateSchema = z.object({
  name: requiredString("Store name"),
  store_type: z
    .string()
    .trim()
    .refine((value) => value === "" || maxWords(value, 4), "Store type must be at most 4 words."),
  owner_first_name: requiredString("First name"),
  owner_last_name: requiredString("Last name"),
  owner_email: emailSchema,
  phone: phoneSchema.optional(),
  contact_email: z
    .string()
    .trim()
    .refine((value) => value === "" || emailSchema.safeParse(value).success, {
      message: "Please enter a valid contact email.",
    })
    .optional(),
  address: z.string().trim().optional(),
});

export const storeUpdateSchema = z.object({
  storeName: requiredString("Store name"),
  storeType: z
    .string()
    .trim()
    .refine((value) => value === "" || maxWords(value, 4), "Store type must be at most 4 words."),
  contactEmail: z
    .string()
    .trim()
    .refine((value) => value === "" || emailSchema.safeParse(value).success, {
      message: "Please enter a valid contact email.",
    }),
  phone: phoneSchema,
  address: z.string().trim(),
});

export const accountSettingsSchema = z.object({
  ownerName: requiredString("Owner name"),
});

/** Exact phrase required in the delete-store confirmation modal (trimmed before compare). */
export const DELETE_STORE_CONFIRM_PHRASE = "delete my store";

export function isDeleteStoreModalPhraseConfirmed(value: string): boolean {
  return value.trim() === DELETE_STORE_CONFIRM_PHRASE;
}

/** Must match the active store name exactly (same rules as backend `store.name` vs request body). */
export function isDeleteStoreModalStoreNameConfirmed(
  value: string,
  expectedStoreName: string,
): boolean {
  const expected = expectedStoreName.trim();
  if (!expected) return false;
  return value.trim() === expected;
}
