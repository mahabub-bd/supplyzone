import Label from "../Label";
import Select from "../Select";

// FormField helper
export function FormField({
  label,
  error,
  children,
}: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
export function SelectField({
  label,
  data,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  allowEmpty,
  emptyLabel,
}: {
  label: string;
  data?: { id: number | string; name: string }[];
  value?: number | string;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const options = data?.map((item) => ({
    value: item.id.toString(),
    label: item.name,
  })) ?? [];

  // Add empty option at the beginning if allowEmpty is true
  if (allowEmpty) {
    options.unshift({
      value: "",
      label: emptyLabel || "All",
    });
  }

  return (
    <FormField label={label} error={error}>
      <Select
        options={options}
        value={value?.toString()}
        onChange={(val) => {
          onChange(val);
        }}
        disabled={disabled}
        placeholder={placeholder}
      />
    </FormField>
  );
}
