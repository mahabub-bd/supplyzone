import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { Controller, Resolver, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { QuotationFormValues, quotationSchema } from "./quotationSchema";

import { ArrowLeft } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import { FormField, SelectField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Button from "../../../components/ui/button/Button";

import { useGetProductsQuery } from "../../../features/product/productApi";
import {
  useCreateQuotationMutation,
  useGetQuotationByIdQuery,
  useUpdateQuotationMutation,
} from "../../../features/quotation/quotationApi";
import { QuotationStatus } from "../../../types/quotation";

import { BasicInfoFields } from "./QuotationForm/BasicInfoFields";
import { QuotationItemRow } from "./QuotationForm/QuotationItemRow";
import { QuotationSummary } from "./QuotationForm/QuotationSummary";
import { useQuotationCalculations } from "./QuotationForm/useQuotationCalculations";

interface Props {
  mode: "create" | "edit";
  quotationId?: string;
}

export default function QuotationForm({ mode, quotationId }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = mode === "edit";
  const duplicateId = searchParams.get("duplicate");
  const [isFormReady, setIsFormReady] = useState(false);

  /** Fetch Data */
  const { data: productData, isLoading: isLoadingProducts } =
    useGetProductsQuery({});

  const products = productData?.data || [];

  /** Fetch Existing Quotation (edit mode) */
  const { data: editData, isLoading: isLoadingQuotation } =
    useGetQuotationByIdQuery(
      (isEdit && quotationId) || duplicateId
        ? Number(quotationId || duplicateId)
        : skipToken
    );

  const [createQuotation, { isLoading: isCreating }] =
    useCreateQuotationMutation();
  const [updateQuotation, { isLoading: isUpdating }] =
    useUpdateQuotationMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema) as Resolver<QuotationFormValues>,
    defaultValues: {
      items: [{ product_id: 0, quantity: 1 }],
      discount_type: "fixed",
      discount_value: 0,
      tax_percentage: 0,
      status: QuotationStatus.DRAFT,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const discountType = watch("discount_type");
  const discountValue = watch("discount_value");
  const taxPercentage = watch("tax_percentage");

  // Calculate totals using custom hook
  const { subtotal, discount, tax, total } = useQuotationCalculations(
    watchedItems,
    products,
    discountType,
    discountValue,
    taxPercentage
  );

  // Set form values when editing or duplicating
  useEffect(() => {
    if ((editData?.data || isLoadingQuotation === false) && !isFormReady) {
      const quotation = editData?.data;

      if (quotation) {
        const isDuplicate = duplicateId && !isEdit;

        reset({
          customer_id: isDuplicate
            ? quotation.customer.id
            : quotation.customer.id,
          branch_id: isDuplicate ? quotation.branch_id : quotation.branch_id,
          quotation_no: isDuplicate ? undefined : quotation.quotation_no,
          valid_until: isDuplicate
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            : quotation.valid_until,
          status: isDuplicate ? QuotationStatus.DRAFT : quotation.status,
          notes: quotation.notes,
          terms_and_conditions: quotation.terms_and_conditions,
          discount_type: "fixed",
          discount_value: isDuplicate
            ? 0
            : Number(quotation.manual_discount || quotation.discount || 0),
          tax_percentage: isDuplicate ? 0 : Number(quotation.tax || 0),
          items: quotation.items?.map((item: any) => ({
            product_id: item.product_id || item.productId,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            discount_percentage: Number(item.discount_percentage) || 0,
          })) || [{ product_id: 0, quantity: 1 }],
        });
      } else if (!isEdit && !duplicateId) {
        // Set default values for create mode
        setIsFormReady(true);
      }
    }
  }, [editData, isLoadingQuotation, isFormReady, reset, isEdit, duplicateId]);

  const onSubmit = async (data: QuotationFormValues) => {
    try {
      const payload = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          unit_price:
            item.unit_price ||
            Number(
              products.find((p) => p.id === item.product_id)?.selling_price
            ) ||
            0,
        })),
      };

      if (isEdit && quotationId) {
        await updateQuotation({
          id: Number(quotationId),
          body: payload,
        }).unwrap();
        toast.success("Quotation updated successfully!");
      } else {
        await createQuotation({ body: payload }).unwrap();
        toast.success("Quotation created successfully!");
      }

      navigate("/quotations");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save quotation");
    }
  };

  const addNewItem = () => {
    append({ product_id: 0, quantity: 1 });
  };

  if (isLoadingProducts) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageMeta
        title={isEdit ? "Edit Quotation" : "Create Quotation"}
        description={
          isEdit ? "Edit quotation details" : "Create a new quotation"
        }
      />

      <div className="flex items-center mb-6">
        <div className="flex items-center  gap-4 justify-end w-full">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/quotations")}
            className="p-2"
          >
            <ArrowLeft size={18} />
            Back List
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <BasicInfoFields control={control} errors={errors} />

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button
                type="button"
                onClick={addNewItem}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <QuotationItemRow
                  key={field.id}
                  index={index}
                  control={control}
                  errors={errors}
                  products={products}
                  remove={remove}
                  setValue={setValue}
                  fieldsLength={fields.length}
                />
              ))}
            </div>
          </div>

          {/* Discount and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Discount Type"
              error={errors.discount_type?.message}
            >
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label=""
                    data={[
                      { id: "fixed", name: "Fixed Amount" },
                      { id: "percentage", name: "Percentage" },
                    ]}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    error={errors.discount_type?.message}
                    placeholder="Select Discount Type"
                  />
                )}
              />
            </FormField>

            <FormField
              label="Discount Value"
              error={errors.discount_value?.message}
            >
              <Input
                {...register("discount_value", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="form-input"
              />
            </FormField>

            <FormField label="Tax %" error={errors.tax_percentage?.message}>
              <Input
                {...register("tax_percentage", { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="form-input"
              />
            </FormField>
          </div>

          {/* Summary */}
          <QuotationSummary
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
          />

          {/* Additional Fields */}
          <div className="space-y-4">
            <FormField label="Notes" error={errors.notes?.message}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextArea
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Additional notes..."
                    rows={3}
                    error={!!errors.notes?.message}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Terms & Conditions"
              error={errors.terms_and_conditions?.message}
            >
              <Controller
                name="terms_and_conditions"
                control={control}
                render={({ field }) => (
                  <TextArea
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Terms and conditions..."
                    rows={4}
                    error={!!errors.terms_and_conditions?.message}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/quotations")}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isEdit ? "Update Quotation" : "Create Quotation"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
