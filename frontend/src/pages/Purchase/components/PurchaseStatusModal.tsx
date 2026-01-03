import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import { useUpdatePurchaseStatusMutation } from "../../../features/purchases/purchasesApi";
import { Purchase, PurchaseOrderStatus } from "../../../types/purchase";

interface PurchaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase;
}

const statusSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus),
  reason: z.string().optional(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

export default function PurchaseStatusModal({
  isOpen,
  onClose,
  purchase,
}: PurchaseStatusModalProps) {
  const [updateStatus, { isLoading }] = useUpdatePurchaseStatusMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: purchase.status as PurchaseOrderStatus,
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        status: purchase.status as PurchaseOrderStatus,
        reason: "",
      });
    }
  }, [isOpen, purchase, reset]);

  const onSubmit = async (data: StatusFormValues) => {
    try {
      await updateStatus({
        id: purchase.id,
        body: {
          status: data.status,
          reason: data.reason,
        },
      }).unwrap();
      toast.success("Purchase status updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update status");
    }
  };

  const statusOptions = Object.values(PurchaseOrderStatus).map((status) => ({
    value: status,
    label: status.replace(/_/g, " ").toUpperCase(),
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status - ${purchase.po_no}`}
      className="max-w-lg p-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={statusOptions}
                placeholder="Select Status"
                value={field.value}
                onChange={(value: string) =>
                  field.onChange(value as PurchaseOrderStatus)
                }
              />
            )}
          />
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (Optional)
          </label>
          <Input
            type="textarea"
            placeholder="Enter reason for status change..."
            error={!!errors.reason}
            hint={errors.reason?.message}
            {...register("reason")}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button size="sm" variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
