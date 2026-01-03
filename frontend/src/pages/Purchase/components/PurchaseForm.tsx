import { zodResolver } from "@hookform/resolvers/zod";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { Controller, Resolver, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PurchaseFormValues, purchaseSchema } from "./purchaseSchema";

import PageHeader from "../../../components/common/PageHeader";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "../../../components/form/date-picker";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import {
  useCreatePurchaseMutation,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
} from "../../../features/purchases/purchasesApi";

import { useGetProductsQuery } from "../../../features/product/productApi";
import { useGetSuppliersQuery } from "../../../features/suppliers/suppliersApi";
import { useGetWarehousesQuery } from "../../../features/warehouse/warehouseApi";
import { PaymentTerm, PaymentTermDescription } from "../../../types";
import {
  PurchaseOrderStatus,
  PurchaseOrderStatusDescription,
  PurchaseStatus,
} from "../../../types/purchase";

interface Props {
  mode: "create" | "edit";
  purchaseId?: string;
}

export default function PurchaseForm({ mode, purchaseId }: Props) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const [isFormReady, setIsFormReady] = useState(false);

  /** Fetch Data */
  const { data: supplierData, isLoading: isLoadingSuppliers } =
    useGetSuppliersQuery();
  const { data: productData, isLoading: isLoadingProducts } =
    useGetProductsQuery({});
  const { data: warehouseData, isLoading: isLoadingWarehouses } =
    useGetWarehousesQuery();

  const suppliers = supplierData?.data || [];
  const products = productData?.data || [];
  const warehouses = warehouseData?.data || [];

  /** Fetch Existing Purchase (edit mode) */
  const { data: editData, isLoading: isLoadingPurchase } =
    useGetPurchaseByIdQuery(
      isEdit && purchaseId ? Number(purchaseId) : skipToken
    );

  const [createPurchase, { isLoading: isCreating }] =
    useCreatePurchaseMutation();
  const [updatePurchase, { isLoading: isUpdating }] =
    useUpdatePurchaseMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema) as Resolver<PurchaseFormValues>,
    defaultValues: {
      supplier_id: 0,
      warehouse_id: 0,
      expected_delivery_date: "",
      terms_and_conditions: "",
      notes: "",
      payment_term: PaymentTerm.NET_30,
      custom_payment_days: 0,
      status: PurchaseOrderStatus.DRAFT,
      tax_amount: 0,
      discount_amount: 0,
      items: [
        {
          product_id: 0,
          quantity: 1,
          unit_price: 0,
          discount_per_unit: 0,
          tax_rate: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  /** Prefill Edit Data - Enhanced with better data loading check */
  useEffect(() => {
    if (!isEdit) {
      setIsFormReady(true);
      return;
    }

    // Check if all required data is loaded
    const isDataLoaded =
      editData?.data &&
      suppliers.length > 0 &&
      warehouses.length > 0 &&
      products.length > 0 &&
      !isLoadingSuppliers &&
      !isLoadingWarehouses &&
      !isLoadingProducts &&
      !isLoadingPurchase;

    if (isDataLoaded) {
      const p = editData.data;

      const formData = {
        supplier_id: Number(p.supplier_id) || 0,
        warehouse_id: Number(p.warehouse_id) || 0,
        expected_delivery_date: p.expected_delivery_date || "",
        terms_and_conditions: p.terms_and_conditions || "",
        notes: p.notes || "",
        payment_term: (p.payment_term as PaymentTerm) || PaymentTerm.NET_30,
        custom_payment_days: Number(p.custom_payment_days) || 0,
        status: (p.status as PurchaseOrderStatus) || PurchaseOrderStatus.DRAFT,
        tax_amount: Number(p.tax_amount) || 0,
        discount_amount: Number(p.discount_amount) || 0,
        items: p.items.map((i: any) => ({
          product_id: Number(i.product_id) || 0,
          quantity: Number(i.quantity) || 0,
          unit_price: Number(i.unit_price || i.price) || 0,
          discount_per_unit: Number(i.discount_per_unit) || 0,
          tax_rate: Number(i.tax_rate) || 0,
        })),
      };

      reset(formData);
      setIsFormReady(true);
    }
  }, [
    isEdit,
    editData,
    suppliers,
    warehouses,
    products,
    isLoadingSuppliers,
    isLoadingWarehouses,
    isLoadingProducts,
    isLoadingPurchase,
    reset,
  ]);

  // Loading states
  if (isEdit && (isLoadingPurchase || !isFormReady)) {
    return <p className="p-6">Loading purchase data...</p>;
  }

  if (isLoadingSuppliers || isLoadingProducts || isLoadingWarehouses) {
    return <p className="p-6">Loading form data...</p>;
  }

  /** Submit */
  const onSubmit = async (values: PurchaseFormValues) => {
    const payload = {
      supplier_id: Number(values.supplier_id),
      warehouse_id: Number(values.warehouse_id),
      expected_delivery_date: values.expected_delivery_date || undefined,
      terms_and_conditions: values.terms_and_conditions || undefined,
      notes: values.notes || undefined,
      payment_term: values.payment_term || PaymentTerm.NET_30,
      custom_payment_days: Number(values.custom_payment_days) || 0,
      status: values.status as PurchaseStatus,
      tax_amount: Number(values.tax_amount) || 0,
      discount_amount: Number(values.discount_amount) || 0,
      items: values.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_per_unit: Number(item.discount_per_unit) || 0,
        tax_rate: Number(item.tax_rate) || 0,
      })),
    };

    try {
      if (isEdit && purchaseId) {
        await updatePurchase({ id: purchaseId, body: payload }).unwrap();
        toast.success("Purchase updated successfully");
      } else {
        await createPurchase(payload).unwrap();
        toast.success("Purchase created successfully");
      }

      navigate("/purchase");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save purchase");
    }
  };

  const items = watch("items");
  const supplierId = watch("supplier_id");
  const warehouseId = watch("warehouse_id");
  const status = watch("status");
  const paymentTerm = watch("payment_term");
  const taxAmount: number = Number(watch("tax_amount")) || 0;
  const discountAmount: number = Number(watch("discount_amount")) || 0;

  return (
    <div>
      <PageMeta
        title={isEdit ? "Edit Purchase" : "Create Purchase"}
        description="Manage purchase orders"
      />
      <PageHeader title={isEdit ? "Edit Purchase" : "Add New Purchase"} />

      <div className="p-6 bg-white rounded-xl shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Purchase Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Supplier"
                data={suppliers.map((s: any) => {
                  const id =
                    typeof s.id === "string" ? Number(s.id) : Number(s.id);
                  return {
                    id: id,
                    name: s.name,
                  };
                })}
                value={supplierId ? Number(supplierId) : undefined}
                error={errors.supplier_id?.message}
                onChange={(val) => {
                  setValue("supplier_id", Number(val), {
                    shouldValidate: true,
                  });
                }}
              />

              <SelectField
                label="Warehouse"
                data={warehouses.map((w: any) => {
                  const id =
                    typeof w.id === "string" ? Number(w.id) : Number(w.id);
                  return {
                    id: id,
                    name: w.name,
                  };
                })}
                value={warehouseId ? Number(warehouseId) : undefined}
                error={errors.warehouse_id?.message}
                onChange={(val) => {
                  setValue("warehouse_id", Number(val), {
                    shouldValidate: true,
                  });
                }}
              />

              <Controller
                name="expected_delivery_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery Date
                    </label>
                    <DatePicker
                      id="expected-delivery-date"
                      mode="single"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        field.onChange(
                          date && date instanceof Date
                            ? date.toISOString().split("T")[0]
                            : ""
                        );
                      }}
                      placeholder="Select delivery date"
                      disableFuture={false}
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-500">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <SelectField
                label="Status"
                data={
                  isEdit
                    ? Object.values(PurchaseOrderStatus).map((statusValue) => ({
                        id: statusValue,
                        name: PurchaseOrderStatusDescription[
                          statusValue
                        ].description.split(" - ")[0],
                      }))
                    : [
                        {
                          id: PurchaseOrderStatus.DRAFT,
                          name: "Draft",
                        },
                      ]
                }
                value={status}
                error={errors.status?.message}
                onChange={(val) =>
                  setValue("status", val as PurchaseOrderStatus)
                }
                disabled={!isEdit}
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Payment Term"
                data={Object.values(PaymentTerm).map((term) => ({
                  id: term,
                  name: PaymentTermDescription[term],
                }))}
                value={paymentTerm}
                error={errors.payment_term?.message}
                onChange={(val) => setValue("payment_term", val as PaymentTerm)}
              />

              <FormField
                label="Custom Payment Days"
                error={errors.custom_payment_days?.message}
              >
                <Input
                  type="number"
                  min="0"
                  {...register("custom_payment_days", { valueAsNumber: true })}
                />
              </FormField>

              <FormField label="Tax Amount" error={errors.tax_amount?.message}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("tax_amount", { valueAsNumber: true })}
                />
              </FormField>

              <FormField
                label="Discount Amount"
                error={errors.discount_amount?.message}
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("discount_amount", { valueAsNumber: true })}
                />
              </FormField>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Additional Information
            </h3>
            <div className="space-y-4">
              <FormField
                label="Terms and Conditions"
                error={errors.terms_and_conditions?.message}
              >
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("terms_and_conditions")}
                />
              </FormField>

              <FormField label="Notes" error={errors.notes?.message}>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("notes")}
                />
              </FormField>
            </div>
          </div>

          {/* Purchase Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Purchase Items</h2>

              <Button
                type="button"
                size="sm"
                onClick={() =>
                  append({
                    product_id: 0,

                    quantity: 1,
                    unit_price: 0,
                    discount_per_unit: 0,
                    tax_rate: 0,
                  })
                }
              >
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader={true}>Product</TableCell>
                    <TableCell isHeader={true}>Qty</TableCell>
                    <TableCell isHeader={true}>Unit Price</TableCell>
                    <TableCell isHeader={true}>Discount</TableCell>
                    <TableCell isHeader={true}>Tax Rate</TableCell>
                    <TableCell isHeader={true}>Subtotal</TableCell>
                    <TableCell isHeader={true}>{""}</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fields.map((field, index) => {
                    const item = items[index];
                    const qty = Number(item?.quantity) || 0;
                    const unitPrice = Number(item?.unit_price) || 0;
                    const discountPerUnit =
                      Number(item?.discount_per_unit) || 0;
                    const taxRate = Number(item?.tax_rate) || 0;
                    const productId = item?.product_id
                      ? Number(item.product_id)
                      : undefined;

                    // Calculate subtotal: (unit_price - discount_per_unit) * quantity * (1 + tax_rate)
                    const subtotal =
                      (unitPrice - discountPerUnit) * qty * (1 + taxRate / 100);

                    return (
                      <TableRow key={field.id}>
                        {/* Product */}
                        <TableCell>
                          <SelectField
                            label=""
                            data={products.map((p: any) => {
                              const id =
                                typeof p.id === "string"
                                  ? Number(p.id)
                                  : Number(p.id);
                              return {
                                id: id,
                                name: p.name,
                              };
                            })}
                            value={productId}
                            error={errors.items?.[index]?.product_id?.message}
                            onChange={(val) => {
                              const pid = Number(val);
                              setValue(`items.${index}.product_id`, pid, {
                                shouldValidate: true,
                              });

                              const product = products.find(
                                (p: any) => Number(p.id) === pid
                              );
                              if (product?.purchase_price) {
                                setValue(
                                  `items.${index}.unit_price`,
                                  Number(product.purchase_price),
                                  { shouldValidate: true }
                                );
                              }
                            }}
                          />
                        </TableCell>

                        {/* Quantity */}
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </TableCell>

                        {/* Unit Price */}
                        <TableCell>
                          <Input
                            step="0.01"
                            type="number"
                            min="0"
                            {...register(`items.${index}.unit_price`, {
                              valueAsNumber: true,
                            })}
                          />
                          {errors.items?.[index]?.unit_price && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.items[index]?.unit_price?.message}
                            </p>
                          )}
                        </TableCell>

                        {/* Discount Per Unit */}
                        <TableCell>
                          <Input
                            step="0.01"
                            type="number"
                            min="0"
                            {...register(`items.${index}.discount_per_unit`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>

                        {/* Tax Rate */}
                        <TableCell>
                          <Input
                            step="0.1"
                            type="number"
                            min="0"
                            max="100"
                            {...register(`items.${index}.tax_rate`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>

                        {/* Subtotal */}
                        <TableCell className="font-semibold">
                          ৳{subtotal.toFixed(2)}
                        </TableCell>

                        {/* Remove */}
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => remove(index)}
                            className="text-red-600"
                            disabled={fields.length === 1}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-red-500 text-sm mt-2">
                {errors.items.message}
              </p>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              <div className="text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="ml-2 font-semibold">
                  ৳
                  {items
                    .reduce((sum, item) => {
                      const qty = Number(item?.quantity) || 0;
                      const unitPrice = Number(item?.unit_price) || 0;
                      const discountPerUnit =
                        Number(item?.discount_per_unit) || 0;
                      return sum + (unitPrice - discountPerUnit) * qty;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Discount Amount:</span>
                <span className="ml-2 font-semibold">
                  ৳{discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Tax Amount:</span>
                <span className="ml-2 font-semibold">
                  ৳{taxAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-right">
              Total: ৳
              {items
                .reduce((sum, item) => {
                  const qty = Number(item?.quantity) || 0;
                  const unitPrice = Number(item?.unit_price) || 0;
                  const discountPerUnit = Number(item?.discount_per_unit) || 0;
                  const taxRate = Number(item?.tax_rate) || 0;
                  const subtotal =
                    (unitPrice - discountPerUnit) * qty * (1 + taxRate / 100);
                  return sum + subtotal;
                }, 0)
                .toFixed(2)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchase")}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isCreating || isUpdating}>
              {isEdit ? "Update Purchase" : "Create Purchase"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
