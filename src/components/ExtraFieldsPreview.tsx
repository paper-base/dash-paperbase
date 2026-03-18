"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye } from "lucide-react";
import { ExtraFieldsFormSection } from "@/components/ExtraFieldsFormSection";
import { useExtraFieldsSchema } from "@/hooks/useExtraFieldsSchema";
import type { ExtraFieldEntityType } from "@/types/extra-fields";
import { cn } from "@/lib/utils";

/**
 * Preview mode showing how extra fields would appear for variants and SKUs.
 * Uses dummy values for display purposes.
 */
export function ExtraFieldsPreview({
  entityType = "product",
}: {
  entityType?: ExtraFieldEntityType;
}) {
  const [open, setOpen] = useState(false);
  const { schema } = useExtraFieldsSchema(entityType);

  const hasFields = schema.some((f) => f.name.trim());
  if (!hasFields) return null;

  const dummyValues: Record<string, string | number | boolean> = {};
  for (const f of schema.filter((f) => f.name.trim())) {
    if (f.fieldType === "text") dummyValues[f.name] = "Sample value";
    if (f.fieldType === "number") dummyValues[f.name] = 42;
    if (f.fieldType === "boolean") dummyValues[f.name] = true;
    if (f.fieldType === "dropdown" && f.options?.length)
      dummyValues[f.name] = f.options[0];
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
        >
          <Eye className="size-4" />
          Preview for variants / SKUs
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Preview: How extra fields would look in a variant or SKU row
          </p>
          <div className="rounded-lg border border-border bg-background p-4">
            <ExtraFieldsFormSection
              entityType={entityType}
              values={dummyValues}
              onChange={() => {}}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
