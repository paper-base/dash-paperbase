import { z } from "zod";

export const orderItemSchema = z.object({
  product_public_id: z.string().trim().min(1),
  /** Matches dashboard line items (`variant_public_id`). **/
  variant_public_id: z.string().trim().min(1).nullable(),
  quantity: z.number().int().min(1),
  unit_price: z.string().trim().min(1),
});

export type OrderCreateSchemaMessages = {
  shippingNameRequired: string;
  phoneRequired: string;
  emailInvalid: string;
  roadVillageRequired: string;
  thanaRequired: string;
  districtRequired: string;
  zoneRequired: string;
  itemsRequired: string;
};

const DEFAULT_EN_MESSAGES: OrderCreateSchemaMessages = {
  shippingNameRequired: "Name is required.",
  phoneRequired: "Phone is required.",
  emailInvalid: "Please enter a valid email address.",
  roadVillageRequired: "Road / village is required.",
  thanaRequired: "Thana is required.",
  districtRequired: "District is required.",
  zoneRequired: "Delivery zone is required.",
  itemsRequired: "Add at least one product to the order.",
};

export function buildOrderCreateSchema(msgs: OrderCreateSchemaMessages) {
  return z.object({
    shipping_name: z.string().trim().min(1, msgs.shippingNameRequired),
    phone: z.string().trim().min(1, msgs.phoneRequired),
    email: z
      .string()
      .trim()
      .email(msgs.emailInvalid)
      .optional()
      .or(z.literal("")),
    village: z.string().trim().min(1, msgs.roadVillageRequired),
    thana: z.string().trim().min(1, msgs.thanaRequired),
    district: z.string().trim().min(1, msgs.districtRequired),
    shipping_zone_public_id: z.string().trim().min(1, msgs.zoneRequired),
    shipping_method_public_id: z.string().optional(),
    items: z.array(orderItemSchema).min(1, msgs.itemsRequired),
  });
}

/** English defaults for unit tests and non-React callers. */
export const orderCreateSchema = buildOrderCreateSchema(DEFAULT_EN_MESSAGES);
