import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useGetAccountsQuery } from "../../../features/accounts/accountsApi";
import { useRefundPurchaseReturnMutation } from "../../../features/purchase-return/purchaseReturnApi";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseReturn: {
    id: number;
    return_no: string;
    supplier_name?: string;
    total: string;
    status: string;
  } | null;
  onSuccess?: () => void;
}

export default function RefundModal({
  isOpen,
  onClose,
  purchaseReturn,
  onSuccess,
}: RefundModalProps) {
  const [refundPurchaseReturn, { isLoading }] =
    useRefundPurchaseReturnMutation();

  const { data: accountsData } = useGetAccountsQuery({
    type: "asset",
    isCash: true,
    isBank: true,
  });
  const accounts = accountsData?.data || [];

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      refund_amount: 0,
      payment_method: "bank",
      refund_reference: "",
      debit_account_code: "",
      refund_notes: "",
    },
  });
  const selectedPaymentMethod = watch("payment_method");
  const refundAmount = watch("refund_amount");
  const totalAmount = purchaseReturn ? parseFloat(purchaseReturn.total) : 0;

  const filteredAccounts = accounts.filter((acc: any) =>
    selectedPaymentMethod === "cash"
      ? acc.isCash
      : selectedPaymentMethod === "bank"
      ? acc.isBank
      : false
  );

  const onSubmit = async (data: any) => {
    if (!purchaseReturn) return;

    try {
      const payload = {
        refund_amount: data.refund_amount,
        payment_method: data.payment_method,
        debit_account_code: data.debit_account_code,
        refund_reference: data.refund_reference.trim() || undefined,
        refund_notes: data.refund_notes.trim() || undefined,
      };

      await refundPurchaseReturn({
        id: purchaseReturn.id,
        body: payload,
      }).unwrap();

      toast.success(
        `Refund of ${refundAmount.toLocaleString()} processed successfully`
      );
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to process refund");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-xl w-full max-h-[90vh] overflow-y-auto"
      title="Process Refund"
    >
      {purchaseReturn ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Return Information */}
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">
              Return #{purchaseReturn.return_no}
            </h3>
            <div className="space-y-0.5 text-sm text-gray-600 grid grid-cols-2 gap-3">
              {purchaseReturn.supplier_name && (
                <p>
                  Supplier:{" "}
                  <span className="font-medium text-gray-900">
                    {purchaseReturn.supplier_name}
                  </span>
                </p>
              )}
              <p>
                Total:{" "}
                <span className="font-medium text-gray-900">
                  {totalAmount.toLocaleString()}
                </span>
              </p>
              <p className="col-span-2">
                Status:{" "}
                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {purchaseReturn.status}
                </span>
              </p>
            </div>
          </div>

          {/* Refund Details */}
          <div className="space-y-3 mb-4">
            {/* Refund Amount */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount *
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter refund amount"
                max={totalAmount}
                {...register("refund_amount", {
                  required: "Refund amount is required",
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
                  max: {
                    value: totalAmount,
                    message: "Amount cannot exceed total",
                  },
                })}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-0.5">
                Max: {totalAmount.toLocaleString()}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </Label>
              <Controller
                name="payment_method"
                control={control}
                rules={{ required: "Payment method is required" }}
                render={({ field }) => (
                  <Select
                    options={[
                      { value: "cash", label: "Cash" },
                      { value: "bank", label: "Bank Transfer" },
                    ]}
                    placeholder="Select payment method"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("debit_account_code", ""); // reset account selection
                    }}
                  />
                )}
              />
            </div>

            {/* Debit Account */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Debit From Account *
              </Label>
              <Controller
                name="debit_account_code"
                control={control}
                rules={{ required: "Account selection is required" }}
                render={({ field }) => (
                  <Select
                    options={filteredAccounts.map((acc: any) => ({
                      value: acc.code,
                      label: `${acc.name} - ${acc.code || ""}`,
                    }))}
                    placeholder="Select account to debit from"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
              {filteredAccounts.length === 0 &&
                selectedPaymentMethod !== "check" && (
                  <p className="text-xs text-red-600 mt-0.5">
                    No accounts available
                  </p>
                )}
              <p className="text-xs text-gray-500 mt-0.5">
                Account to debit for this refund
              </p>
            </div>

            {/* Refund Reference */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Reference
              </Label>
              <Input
                type="text"
                placeholder="Transaction reference"
                {...register("refund_reference")}
                disabled={isLoading}
              />
            </div>

            {/* Refund Notes */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Notes
              </Label>
              <TextArea
                rows={2}
                className="w-full"
                {...register("refund_notes")}
                placeholder="Notes about this refund..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Will refund{" "}
              <strong>{refundAmount.toLocaleString()}</strong> to supplier.
              This cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !refundAmount || refundAmount <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Processing..." : "Process Refund"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Loading purchase return details...
        </p>
      )}
    </Modal>
  );
}
