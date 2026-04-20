import { describe, expect, it } from "vitest";
import { accountSettingsSchema, storeCreateSchema } from "@/lib/validation/store";

describe("store validation", () => {
  it("validates store creation payload", () => {
    const result = storeCreateSchema.safeParse({
      name: "My Shop",
      store_type: "Fashion Retail",
      owner_first_name: "Mahi",
      owner_last_name: "Hasan",
      owner_email: "mahi@example.com",
      phone: "01712345678",
      contact_email: "support@example.com",
      address: "Dhaka",
    });
    expect(result.success).toBe(true);
  });

  it("rejects account settings with empty owner name", () => {
    const result = accountSettingsSchema.safeParse({
      ownerName: "",
    });
    expect(result.success).toBe(false);
  });
});
