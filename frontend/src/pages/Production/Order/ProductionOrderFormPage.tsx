import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import Loading from "../../../components/common/Loading";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import DatePicker from "../../../components/form/date-picker";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";

import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import { useGetBrandsQuery } from "../../../features/brand/brandApi";
import { useGetProductsQuery } from "../../../features/product/productApi";
import {
  useCreateProductionOrderMutation,
  useGetProductionOrderByIdQuery,
  useUpdateProductionOrderMutation,
} from "../../../features/production/productionApi";
import { useGetWarehousesQuery } from "../../../features/warehouse/warehouseApi";
import { ProductionOrderPriority } from "../../../types/production";

// Zod schema for production order items
const productionOrderItemSchema = z.object({
  product_id: z.number("Product is required"),
  planned_quantity: z.number("Quantity must be greater than 0").min(1),
  estimated_unit_cost: z.number("Unit cost must be greater than 0").min(0),
  notes: z.string().optional(),
});

// Zod schema for form validation
const productionOrderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  brand_id: z.number("Brand is required"),
  warehouse_id: z.number("Warehouse is required"),
  priority: z.nativeEnum(ProductionOrderPriority),
  planned_start_date: z.string().min(1, "Start date is required"),
  planned_completion_date: z.string().min(1, "Completion date is required"),
  notes: z.string().optional(),
  items: z
    .array(productionOrderItemSchema)
    .min(1, "At least one item is required"),
});

type ProductionOrderFormData = z.infer<typeof productionOrderSchema>;

export default function ProductionOrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      brand_id: 0,
      warehouse_id: 0,
      priority: ProductionOrderPriority.NORMAL,
      planned_start_date: "",
      planned_completion_date: "",
      notes: "",
      items: [
        {
          product_id: 0,
          planned_quantity: 1,
          estimated_unit_cost: 0,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // API hooks
  const { data: productionOrderData, isLoading: isLoadingOrder } =
    useGetProductionOrderByIdQuery(id as string, { skip: !isEditing });
  const { data: brands } = useGetBrandsQuery();
  const { data: warehouses } = useGetWarehousesQuery();
  const { data: products } = useGetProductsQuery({ limit: 1000 });

  const [createOrder] = useCreateProductionOrderMutation();
  const [updateOrder] = useUpdateProductionOrderMutation();

  // Load order data for editing
  useEffect(() => {
    if (isEditing && productionOrderData?.data) {
      const order = productionOrderData.data;
      reset({
        title: order.title,
        description: order.description || "",
        brand_id: order.brand_id,
        warehouse_id: order.warehouse_id,
        priority: order.priority,
        planned_start_date: order.planned_start_date
          ? new Date(order.planned_start_date).toISOString().split("T")[0]
          : "",
        planned_completion_date: order.planned_completion_date
          ? new Date(order.planned_completion_date).toISOString().split("T")[0]
          : "",
        notes: order.notes || "",
        items: order.items || [
          {
            product_id: 0,
            planned_quantity: 1,
            estimated_unit_cost: 0,
            notes: "",
          },
        ],
      });
    }
  }, [isEditing, productionOrderData, reset]);

  // Handle form submission
  const onSubmit = async (data: ProductionOrderFormData) => {
    try {
      if (isEditing && id) {
        await updateOrder({ id, body: data }).unwrap();
        toast.success("Production order updated successfully");
      } else {
        await createOrder(data).unwrap();
        toast.success("Production order created successfully");
      }
      navigate("/production/orders");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to save production order");
    }
  };

  // Add new item
  const addItem = () => {
    append({
      product_id: 0,
      planned_quantity: 1,
      estimated_unit_cost: 0,
      notes: "",
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Loading state
  if (isEditing && isLoadingOrder) {
    return <Loading message="Loading production order details..." />;
  }

  return (
    <>
      <PageBreadcrumb
        pageTitle={
          isEditing ? "Edit Production Order" : "Create Production Order"
        }
      />

      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Order Title" error={errors.title?.message}>
                <Input
                  {...register("title")}
                  placeholder="Enter production order title"
                />
              </FormField>

              <SelectField
                label="Priority"
                value={watch("priority")}
                onChange={(value) =>
                  setValue("priority", value as ProductionOrderPriority)
                }
                data={[
                  { id: "low", name: "Low" },
                  { id: "normal", name: "Normal" },
                  { id: "high", name: "High" },
                  { id: "urgent", name: "Urgent" },
                ]}
                error={errors.priority?.message}
              />

              <SelectField
                label="Brand"
                value={watch("brand_id")?.toString()}
                onChange={(value) => setValue("brand_id", parseInt(value))}
                data={[
                  { id: "", name: "Select Brand" },
                  ...(brands?.data || []).map((m) => ({
                    id: m.id.toString(),
                    name: m.name,
                  })),
                ]}
                error={errors.brand_id?.message}
              />

              <SelectField
                label="Warehouse"
                value={watch("warehouse_id")?.toString()}
                onChange={(value) =>
                  setValue("warehouse_id", parseInt(value))
                }
                data={[
                  { id: "", name: "Select Warehouse" },
                  ...(warehouses?.data || []).map((w) => ({
                    id: w.id.toString(),
                    name: w.name,
                  })),
                ]}
                error={errors.warehouse_id?.message}
              />
            </div>

            <div className="mt-6">
              <FormField
                label="Description"
                error={errors.description?.message}
              >
                <TextArea
                  {...register("description")}
                  rows={3}
                  placeholder="Enter order description (optional)"
                />
              </FormField>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DatePicker
                  id="planned_start_date"
                  label="Planned Start Date"
                  placeholder="Select start date"
                  mode="single"
                  disableFuture={false}
                  value={
                    watch("planned_start_date")
                      ? new Date(watch("planned_start_date"))
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date) {
                      setValue(
                        "planned_start_date",
                        date.toISOString().split("T")[0]
                      );
                    }
                  }}
                  error={!!errors.planned_start_date}
                  hint={errors.planned_start_date?.message}
                  isRequired
                />
              </div>

              <div>
                <DatePicker
                  id="planned_completion_date"
                  label="Planned Completion Date"
                  placeholder="Select completion date"
                  mode="single"
                  disableFuture={false}
                  value={
                    watch("planned_completion_date")
                      ? new Date(watch("planned_completion_date"))
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date) {
                      setValue(
                        "planned_completion_date",
                        date.toISOString().split("T")[0]
                      );
                    }
                  }}
                  error={!!errors.planned_completion_date}
                  hint={errors.planned_completion_date?.message}
                  isRequired
                />
              </div>
            </div>

            <div className="mt-6">
              <FormField label="Notes" error={errors.notes?.message}>
                <TextArea
                  {...register("notes")}
                  rows={2}
                  placeholder="Enter additional notes (optional)"
                />
              </FormField>
            </div>
          </div>

          {/* Production Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Production Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            {errors.items?.message && (
              <p className="text-red-500 text-sm mb-4">
                {errors.items.message}
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Item {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectField
                      label="Product"
                      value={watch(`items.${index}.product_id`)?.toString()}
                      onChange={(value) =>
                        setValue(`items.${index}.product_id`, parseInt(value))
                      }
                      data={[
                        { id: "", name: "Select Product" },
                        ...(products?.data || []).map((p) => ({
                          id: p.id.toString(),
                          name: p.name,
                        })),
                      ]}
                      error={errors.items?.[index]?.product_id?.message}
                    />

                    <FormField
                      label="Planned Quantity"
                      error={errors.items?.[index]?.planned_quantity?.message}
                    >
                      <Input
                        {...register(`items.${index}.planned_quantity`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="1"
                        placeholder="0"
                      />
                    </FormField>

                    <FormField
                      label="Unit Cost"
                      error={
                        errors.items?.[index]?.estimated_unit_cost?.message
                      }
                    >
                      <Input
                        {...register(`items.${index}.estimated_unit_cost`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </FormField>

                    <FormField
                      label="Notes"
                      error={errors.items?.[index]?.notes?.message}
                    >
                      <Input
                        {...register(`items.${index}.notes`)}
                        placeholder="Optional notes"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/production/orders")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Order"
                : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
