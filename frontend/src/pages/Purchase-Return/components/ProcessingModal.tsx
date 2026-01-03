import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useGetAccountsQuery } from "../../../features/accounts/accountsApi";
import { useProcessPurchaseReturnMutation } from "../../../features/purchase-return/purchaseReturnApi";

interface ProcessingModalProps {
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

export default function ProcessingModal({
  isOpen,
  onClose,
  purchaseReturn,
  onSuccess,
}: ProcessingModalProps) {
  const [processPurchaseReturn, { isLoading }] =
    useProcessPurchaseReturnMutation();

  const { data: accountsData } = useGetAccountsQuery({
    type: "asset",
    isCash: true,
    isBank: true,
  });
  const accounts = accountsData?.data || [];

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      processing_notes: "",
      refund_to_supplier: false,
      refund_later: false,
      refund_amount: 0,
      refund_payment_method: "bank",
      refund_reference: "",
      debit_account_code: "",
    },
  });
  const selectedRefundMethod = watch("refund_payment_method");

  const filteredRefundAccounts = accounts.filter((acc: any) =>
    selectedRefundMethod === "cash"
      ? acc.isCash
      : selectedRefundMethod === "bank"
      ? acc.isBank
      : false
  );
  const refundToSupplier = watch("refund_to_supplier");
  const refundLater = watch("refund_later");
  const refundAmount = watch("refund_amount");
  const totalAmount = purchaseReturn ? parseFloat(purchaseReturn.total) : 0;

  const onSubmit = async (data: any) => {
    if (!purchaseReturn) return;

    try {
      const payload: any = {
        processing_notes: data.processing_notes.trim() || undefined,
      };

      // Add refund data if refund is enabled
      if (data.refund_to_supplier || data.refund_later) {
        if (data.refund_to_supplier) {
          payload.refund_to_supplier = true;
          payload.refund_amount = data.refund_amount;
          payload.refund_payment_method = data.refund_payment_method;

          if (data.debit_account_code) {
            payload.debit_account_code = data.debit_account_code;
          }

          if (data.refund_reference.trim()) {
            payload.refund_reference = data.refund_reference.trim();
          }
        } else if (data.refund_later) {
          payload.refund_later = true;
        }
      }

      await processPurchaseReturn({
        id: purchaseReturn.id,
        body: payload,
      }).unwrap();

      toast.success(
        `Purchase return ${purchaseReturn.return_no} processed successfully`
      );
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to process purchase return");
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
      className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      title="Process Purchase Return"
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
                Total Amount:{" "}
                <span className="font-medium text-gray-900">
                  {totalAmount.toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Processing Notes */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Notes (Optional)
            </Label>
            <TextArea
              {...register("processing_notes")}
              rows={3}
              className="w-full"
              placeholder="Add any notes about this processing..."
              disabled={isLoading}
            />
          </div>

          {/* Refund Section */}
          <div className="mb-6 border-t pt-6">
            <div className="mb-4">
              <p className="font-medium text-gray-900 mb-3">Refund Options</p>

              <div className="space-y-3">
                {/* Refund Now Option */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="refund_to_supplier"
                    checked={refundToSupplier}
                    onChange={(e) => {
                      setValue("refund_to_supplier", e.target.checked);
                      if (e.target.checked) {
                        setValue("refund_later", false); // Uncheck refund later
                      }
                    }}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="refund_to_supplier"
                    className="font-medium text-gray-900"
                  >
                    Process refund now to supplier
                  </label>
                </div>

                {/* Refund Later Option */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="refund_later"
                    checked={refundLater}
                    onChange={(e) => {
                      setValue("refund_later", e.target.checked);
                      if (e.target.checked) {
                        setValue("refund_to_supplier", false); // Uncheck refund now
                      }
                    }}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="refund_later"
                    className="font-medium text-gray-900"
                  >
                    Mark for refund later
                  </label>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Choose whether to process refund immediately or mark for later
                processing
              </p>
            </div>

            {/* Refund Now Form */}
            {refundToSupplier && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 gap-4">
                {/* Refund Amount */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter refund amount"
                    max={totalAmount}
                    {...register("refund_amount", { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum refundable amount: {totalAmount.toLocaleString()}
                  </p>
                </div>

                {/* Refund Payment Method */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Payment Method
                  </Label>
                  <Controller
                    name="refund_payment_method"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={[
                          { value: "cash", label: "Cash" },
                          { value: "bank", label: "Bank & MFS" },
                        ]}
                        placeholder="Select refund method"
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
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Debit From Account
                  </Label>

                  <Controller
                    name="debit_account_code"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={filteredRefundAccounts.map((acc: any) => ({
                          value: acc.code,
                          label: `${acc.name} - ${acc.code || ""}`,
                        }))}
                        placeholder="Select account to debit from"
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />

                  {filteredRefundAccounts.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      No accounts available for the selected method.
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Select the account to debit for this refund
                  </p>
                </div>

                {/* Refund Reference */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Reference (Optional)
                  </Label>
                  <Input
                    type="text"
                    placeholder="Transaction reference number"
                    value={watch("refund_reference")}
                    onChange={(e) =>
                      setValue("refund_reference", e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Transaction ID, check number, or other reference
                  </p>
                </div>
              </div>
            )}

            {/* Refund Later Info */}
            {refundLater && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> The purchase return will be processed
                  and inventory updated, but the refund will need to be
                  processed separately later from the purchase return details
                  page.
                </p>
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {refundToSupplier
                ? `This will process the purchase return and refund ${refundAmount.toLocaleString()} to the supplier. This action cannot be undone.`
                : refundLater
                ? "This will process the purchase return and update inventory levels. The refund can be processed later. This action cannot be undone."
                : "This will process the purchase return and update inventory levels. This action cannot be undone."}
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (refundToSupplier && !refundAmount)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading
                ? "Processing..."
                : `Process${
                    refundToSupplier
                      ? " & Refund"
                      : refundLater
                      ? " (Refund Later)"
                      : ""
                  }`}
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
