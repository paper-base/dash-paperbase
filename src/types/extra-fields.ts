export type ExtraFieldType = "text" | "number" | "boolean" | "dropdown";

export type ExtraFieldEntityType = "product";

export interface ExtraFieldDefinition {
  id: string;
  entityType: ExtraFieldEntityType;
  name: string;
  fieldType: ExtraFieldType;
  defaultValue?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export type ExtraFieldValues = Record<string, string | number | boolean>;
