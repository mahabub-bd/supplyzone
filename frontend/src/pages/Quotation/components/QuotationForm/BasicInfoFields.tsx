import { Control, Controller, FieldErrors } from "react-hook-form";
import DatePicker from "../../../../components/form/date-picker";
import { FormField, SelectField } from "../../../../components/form/form-elements/SelectFiled";
import { useGetBranchesQuery } from "../../../../features/branch/branchApi";
import { useGetCustomersQuery } from "../../../../features/customer/customerApi";
import { QuotationStatus, QuotationStatusDescription } from "../../../../types/quotation";
import { QuotationFormValues } from "../quotationSchema";

interface BasicInfoFieldsProps {
  control: Control<QuotationFormValues>;
  errors: FieldErrors<QuotationFormValues>;
}

export function BasicInfoFields({ control, errors }: BasicInfoFieldsProps) {
  const { data: customerData } = useGetCustomersQuery();
  const { data: branchData } = useGetBranchesQuery();

  const customers = customerData?.data || [];
  const branches = branchData?.data || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Customer" error={errors.customer_id?.message}>
        <Controller
          name="customer_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label=""
              data={customers}
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              error={errors.customer_id?.message}
              placeholder="Select Customer"
            />
          )}
        />
      </FormField>

      <FormField label="Branch" error={errors.branch_id?.message}>
        <Controller
          name="branch_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label=""
              data={branches}
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              error={errors.branch_id?.message}
              placeholder="Select Branch"
            />
          )}
        />
      </FormField>

      <FormField label="Valid Until" error={errors.valid_until?.message}>
        <Controller
          name="valid_until"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="valid_until"
              value={field.value ? new Date(field.value) : null}
              onChange={(date) =>
                field.onChange(
                  date instanceof Date
                    ? date.toISOString().split("T")[0]
                    : ""
                )
              }
              placeholder="Select valid until date"
              error={!!errors.valid_until?.message}
            />
          )}
        />
      </FormField>

      <FormField label="Status" error={errors.status?.message}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <SelectField
              label=""
              data={Object.values(QuotationStatus).map((status) => ({
                id: status,
                name: QuotationStatusDescription[status],
              }))}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              error={errors.status?.message}
              placeholder="Select Status"
            />
          )}
        />
      </FormField>
    </div>
  );
}