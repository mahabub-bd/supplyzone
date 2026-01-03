import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { Modal } from "../../../components/ui/modal";
import { useAdjustInventoryMutation } from "../../../features/inventory/inventoryApi";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryId: number;
  productName: string;
  warehouseName: string;
  currentStock: number;
}

// Zod Schema
const adjustmentSchema = z.object({
  adjustmentType: z.enum(["increase", "decrease"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  note: z.string().min(1, "Reason/Note is required"),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  inventoryId,
  productName,
  warehouseName,
  currentStock,
}) => {
  const [adjustInventory, { isLoading }] = useAdjustInventoryMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: "increase",
      quantity: 0,
      note: "",
    },
  });

  const adjustmentType = watch("adjustmentType");
  const quantity = watch("quantity");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const projectedStock =
    adjustmentType === "increase"
      ? currentStock + quantity
      : currentStock - quantity;

  const onSubmit = async (data: AdjustmentFormData) => {
    // Additional validation for decrease
    if (data.adjustmentType === "decrease" && data.quantity > currentStock) {
      toast.error(`Cannot decrease more than current stock (${currentStock})`);
      return;
    }

    try {
      const adjustmentQuantity =
        data.adjustmentType === "decrease" ? -data.quantity : data.quantity;

      await adjustInventory({
        id: inventoryId,
        body: {
          quantity: adjustmentQuantity,
          note: data.note,
        },
      }).unwrap();

      toast.success("Stock adjusted successfully");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to adjust stock");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Stock Adjustment"
      description={`Adjust stock for ${productName} in ${warehouseName}`}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Stock Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Current Stock:</span>{" "}
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {currentStock}
            </span>
          </p>
        </div>

        {/* Adjustment Type */}
        <FormField
          label={
            <>
              Adjustment Type <span className="text-red-500">*</span>
            </>
          }
          error={errors.adjustmentType?.message}
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("adjustmentType", "increase")}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                adjustmentType === "increase"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Increase Stock
            </button>
            <button
              type="button"
              onClick={() => setValue("adjustmentType", "decrease")}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                adjustmentType === "decrease"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Decrease Stock
            </button>
          </div>
        </FormField>

        {/* Quantity */}
        <FormField
          label={
            <>
              Quantity <span className="text-red-500">*</span>
            </>
          }
          error={errors.quantity?.message}
        >
          <Input
            type="number"
            min={1}
            max={adjustmentType === "decrease" ? currentStock : undefined}
            {...register("quantity", { valueAsNumber: true })}
            placeholder="Enter quantity"
          />
          {adjustmentType === "decrease" && quantity > currentStock && (
            <p className="mt-1 text-sm text-red-500">
              Cannot decrease more than current stock ({currentStock})
            </p>
          )}
        </FormField>

        {/* Projected Stock */}
        {quantity > 0 && (
          <div
            className={`p-4 rounded-lg ${
              adjustmentType === "increase"
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Projected Stock:</span>{" "}
              <span
                className={`text-lg font-semibold ${
                  adjustmentType === "increase"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {projectedStock}
              </span>
              <span className="ml-2 text-xs">
                ({adjustmentType === "increase" ? "+" : "-"}
                {quantity})
              </span>
            </p>
          </div>
        )}

        {/* Note */}
        <FormField
          label={
            <>
              Reason/Note <span className="text-red-500">*</span>
            </>
          }
          error={errors.note?.message}
        >
          <textarea
            {...register("note")}
            placeholder="e.g., Damaged during transport, Stock count correction, etc."
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className={
              adjustmentType === "decrease"
                ? "bg-red-600 hover:bg-red-700"
                : ""
            }
          >
            {isLoading
              ? "Adjusting..."
              : adjustmentType === "increase"
              ? "Increase Stock"
              : "Decrease Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
