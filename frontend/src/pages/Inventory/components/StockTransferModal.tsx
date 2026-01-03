import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useTransferInventoryMutation } from "../../../features/inventory/inventoryApi";
import { useGetWarehousesQuery } from "../../../features/warehouse/warehouseApi";
import { Warehouse } from "../../../types/branch";

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  warehouses: Array<{
    id: number;
    warehouse_id: number;
    warehouse: {
      id: number;
      name: string;
    };
    remaining_quantity: number;
  }>;
}

// Zod Schema
const transferSchema = z
  .object({
    from_warehouse_id: z.number().min(1, "Please select source warehouse"),
    to_warehouse_id: z.number().min(1, "Please select destination warehouse"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    note: z.string().optional(),
  })
  .refine((data) => data.from_warehouse_id !== data.to_warehouse_id, {
    message: "Source and destination warehouses must be different",
    path: ["to_warehouse_id"],
  });

type TransferFormData = z.infer<typeof transferSchema>;

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  warehouses,
}) => {
  const { data: allWarehousesData } = useGetWarehousesQuery();
  const [transferInventory, { isLoading }] = useTransferInventoryMutation();

  const allWarehouses: Warehouse[] = allWarehousesData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_warehouse_id: 0,
      to_warehouse_id: 0,
      quantity: 0,
      note: "",
    },
  });

  const fromWarehouseId = watch("from_warehouse_id");
  const quantity = watch("quantity");

  // Get max quantity based on selected warehouse
  const maxQuantity =
    warehouses.find((w) => w.warehouse_id === fromWarehouseId)
      ?.remaining_quantity || 0;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: TransferFormData) => {
    // Additional validation for max quantity
    if (data.quantity > maxQuantity) {
      toast.error(`Quantity cannot exceed ${maxQuantity}`);
      return;
    }

    try {
      await transferInventory({
        product_id: productId,
        from_warehouse_id: data.from_warehouse_id,
        to_warehouse_id: data.to_warehouse_id,
        quantity: data.quantity,
        note: data.note,
      }).unwrap();

      toast.success("Stock transferred successfully");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to transfer stock");
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
      title="Stock Transfer"
      description={`Transfer stock for ${productName}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* From Warehouse */}
        <FormField
          label={
            <>
              From Warehouse <span className="text-red-500">*</span>
            </>
          }
          error={errors.from_warehouse_id?.message}
        >
          <select
            {...register("from_warehouse_id", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={0}>Select source warehouse</option>
            {warehouses.map((w) => (
              <option key={w.warehouse_id} value={w.warehouse_id}>
                {w.warehouse.name} (Available: {w.remaining_quantity})
              </option>
            ))}
          </select>
        </FormField>

        {/* To Warehouse */}
        <FormField
          label={
            <>
              To Warehouse <span className="text-red-500">*</span>
            </>
          }
          error={errors.to_warehouse_id?.message}
        >
          <select
            {...register("to_warehouse_id", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={0}>Select destination warehouse</option>
            {allWarehouses
              .filter((w) => w.id !== fromWarehouseId)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
          </select>
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
            max={maxQuantity || undefined}
            {...register("quantity", { valueAsNumber: true })}
            placeholder="Enter quantity to transfer"
          />
          {maxQuantity > 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Maximum available: {maxQuantity}
              {quantity > maxQuantity && (
                <span className="text-red-500 ml-2">
                  (Exceeds available stock)
                </span>
              )}
            </p>
          )}
        </FormField>

        {/* Note */}
        <FormField label="Note (Optional)">
          <textarea
            {...register("note")}
            placeholder="Add a note for this transfer"
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Transferring..." : "Transfer Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
