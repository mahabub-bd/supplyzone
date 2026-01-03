import { Control, Controller, UseFieldArrayRemove, UseFormSetValue } from "react-hook-form";
import { FormField, SelectField } from "../../../../components/form/form-elements/SelectFiled";
import Input from "../../../../components/form/input/InputField";
import Button from "../../../../components/ui/button/Button";
import { QuotationFormValues } from "../quotationSchema";

interface QuotationItemRowProps {
  index: number;
  control: Control<QuotationFormValues>;
  errors: any;
  products: any[];
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<QuotationFormValues>;
  fieldsLength: number;
}

export function QuotationItemRow({
  index,
  control,
  errors,
  products,
  remove,
  setValue,
  fieldsLength,
}: QuotationItemRowProps) {
  const getProductPrice = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return Number(product?.selling_price) || 0;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField
          label="Product"
          error={errors.items?.[index]?.product_id?.message}
        >
          <Controller
            name={`items.${index}.product_id`}
            control={control}
            render={({ field }) => (
              <SelectField
                label=""
                data={products}
                value={field.value ? field.value.toString() : ""}
                onChange={(value) => {
                  const productId = value ? Number(value) : 0;
                  field.onChange(productId);
                  if (productId > 0) {
                    setValue(
                      `items.${index}.unit_price`,
                      getProductPrice(productId)
                    );
                  }
                }}
                error={errors.items?.[index]?.product_id?.message}
                placeholder="Select Product"
                allowEmpty
                emptyLabel="Select Product"
              />
            )}
          />
        </FormField>

        <FormField
          label="Quantity"
          error={errors.items?.[index]?.quantity?.message}
        >
          <Input
            {...control.register(`items.${index}.quantity`, {
              valueAsNumber: true,
            })}
            type="number"
            min="1"
            className="form-input"
          />
        </FormField>

        <FormField
          label="Unit Price"
          error={errors.items?.[index]?.unit_price?.message}
        >
          <Input
            {...control.register(`items.${index}.unit_price`, {
              valueAsNumber: true,
            })}
            type="number"
            min="0"
            step="0.01"
            className="form-input"
            placeholder="Auto-filled"
          />
        </FormField>

        <FormField
          label="Discount %"
          error={errors.items?.[index]?.discount_percentage?.message}
        >
          <Input
            {...control.register(`items.${index}.discount_percentage`, {
              valueAsNumber: true,
            })}
            type="number"
            min="0"
            max="100"
            step="0.1"
            className="form-input"
          />
        </FormField>
      </div>

      {fieldsLength > 1 && (
        <div className="mt-2">
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            Remove Item
          </Button>
        </div>
      )}
    </div>
  );
}