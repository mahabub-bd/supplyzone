import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useCancelPurchaseReturnMutation } from "../../../features/purchase-return/purchaseReturnApi";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseReturn: {
    id: number;
    return_no: string;
    supplier_name?: string;
    total: string;
  } | null;
  onSuccess?: () => void;
}

export default function CancelModal({
  isOpen,
  onClose,
  purchaseReturn,
  onSuccess,
}: CancelModalProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      cancel_reason: "",
    },
  });

  const [cancelPurchaseReturn, { isLoading }] =
    useCancelPurchaseReturnMutation();

  const onSubmit = async () => {
    if (!purchaseReturn) return;

    try {
      await cancelPurchaseReturn(purchaseReturn.id).unwrap();
      toast.success(
        `Purchase return ${purchaseReturn.return_no} cancelled successfully`
      );
      reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to cancel purchase return");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-xl w-full"
      title="Cancel Purchase Return"
    >
      {purchaseReturn ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Return Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Return #{purchaseReturn.return_no}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              {purchaseReturn.supplier_name && (
                <p>
                  Supplier:{" "}
                  <span className="font-medium text-gray-900">
                    {purchaseReturn.supplier_name}
                  </span>
                </p>
              )}
              <p>
                Amount:{" "}
                <span className="font-medium text-gray-900">
                  {parseFloat(purchaseReturn.total).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason (Optional)
            </Label>
            <TextArea
              rows={3}
              {...register("cancel_reason")}
              className="w-full"
              placeholder="Enter reason for cancellation..."
              disabled={isLoading}
            />
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-1">Warning</p>
            <p className="text-sm text-red-700">
              Are you sure you want to cancel this purchase return? This action
              cannot be undone and the return will be marked as cancelled.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              No, Keep It
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {isLoading ? "Cancelling..." : "Yes, Cancel Return"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-gray-500">
          Loading purchase return details...
        </p>
      )}
    </Modal>
  );
}
