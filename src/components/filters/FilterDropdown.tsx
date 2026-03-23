import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type FilterOption = {
  value: string;
  label: string;
};

export function FilterDropdown({
  value,
  onChange,
  placeholder,
  options,
  className = "",
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  className?: string;
}) {
  return (
    <Combobox
      value={value || ""}
      onValueChange={(next) => {
        if (next === null) return;
        onChange(next);
      }}
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear={false}
        className={className || "w-[160px]"}
        inputClassName="cursor-pointer caret-transparent text-xs font-medium"
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="">
            <span className="text-xs font-medium">{placeholder}</span>
          </ComboboxItem>
          {options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              <span className="text-xs font-medium">{option.label}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
