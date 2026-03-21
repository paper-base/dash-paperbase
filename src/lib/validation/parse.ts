import type { z } from "zod";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function parseValidation<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown
): ValidationResult<z.infer<TSchema>> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key =
      issue.path.length === 0
        ? "form"
        : issue.path
            .map((segment) => (typeof segment === "number" ? String(segment) : segment))
            .join(".");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return { success: false, errors };
}
