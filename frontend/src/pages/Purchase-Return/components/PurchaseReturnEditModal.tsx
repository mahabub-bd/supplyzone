import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { FormField } from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useCancelPurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
} from "../../../features/purchase-return/purchaseReturnApi";
import { PurchaseReturn, PurchaseReturnItem } from "../../../types/purchase-return";
import ApprovalModal from "./ApprovalModal";
import ProcessingModal from "./ProcessingModal";
import PurchaseReturnStatusBadge from "./PurchaseReturnStatusBadge";

interface PurchaseReturnEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseReturn: PurchaseReturn | null;
  onUpdated?: () => void;
}

interface FormData {
  reason: string;
  items: PurchaseReturnItem[];
}

export default function PurchaseReturnEditModal({
  isOpen,
  onClose,
  purchaseReturn,
  onUpdated,
}: PurchaseReturnEditModalProps) {
  const [updatePurchaseReturn, { isLoading: isUpdating }] =
    useUpdatePurchaseReturnMutation();
  const [cancelPurchaseReturn, { isLoading: isCancelling }] =
    useCancelPurchaseReturnMutation();

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      reason: "",
      items: [],
    },
  });

  const returnItems = watch("items");

  // Initialize form when purchaseReturn changes
  useEffect(() => {
    if (purchaseReturn && isOpen) {
      setValue("items", purchaseReturn.items);
      setValue("reason", purchaseReturn.reason || "");
    }
  }, [purchaseReturn, isOpen, setValue]);

  if (!isOpen) return null;

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseInt(value) || 0;
    const currentItems = [...returnItems];
    const originalItem = purchaseReturn?.items[index];

    // Get the original quantity from purchase_item if available
    const maxQuantity =
      originalItem?.purchase_item?.quantity ||
      originalItem?.returned_quantity ||
      currentItems[index].returned_quantity;

    currentItems[index].returned_quantity = Math.min(qty, maxQuantity);
    setValue("items", currentItems);
  };

  const getTotalReturnAmount = () => {
    return returnItems.reduce(
      (total, item) =>
        total +
        item.returned_quantity *
          (typeof item.price === "string"
            ? parseFloat(item.price)
            : item.price),
      0
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!purchaseReturn) return;

    try {
      await updatePurchaseReturn({
        id: purchaseReturn.id,
        body: {
          items: data.items.map((item) => ({
            product_id: item.product_id,
            purchase_item_id: item.purchase_item_id,
            returned_quantity: item.returned_quantity,
            price:
              typeof item.price === "string"
                ? parseFloat(item.price)
                : item.price,
          })),
          reason: data.reason.trim(),
        },
      }).unwrap();

      toast.success("Purchase return updated successfully");
      reset();
      onUpdated?.();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update purchase return");
    }
  };

  const handleApprove = () => {
    setIsApprovalModalOpen(true);
  };

  const handleProcess = () => {
    setIsProcessingModalOpen(true);
  };

  const handleCancel = async () => {
    if (!purchaseReturn) return;

    try {
      await cancelPurchaseReturn(purchaseReturn.id).unwrap();
      toast.success("Purchase return cancelled successfully");
      onUpdated?.();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to cancel purchase return");
    }
  };

  const isDraft = purchaseReturn?.status === "draft";
  const isApproved = purchaseReturn?.status === "approved";
  const isProcessed = purchaseReturn?.status === "processed";
  const isCancelled = purchaseReturn?.status === "cancelled";

  const isLoading = isUpdating || isCancelling;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full max-h-[90vh] "
      title={`Edit Purchase Return - ${purchaseReturn?.return_no}`}
    >
      {purchaseReturn ? (
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-end">
            <PurchaseReturnStatusBadge status={purchaseReturn.status} />
          </div>

          {/* Purchase Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Purchase Order</p>
              <p className="font-medium mt-1">
                {purchaseReturn.purchase?.po_no ||
                  `PO #${purchaseReturn.purchase_id}`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Supplier</p>
              <p className="font-medium mt-1">
                {purchaseReturn.supplier?.name}
              </p>
            </div>
          </div>

          {/* Approval Information (shown for approved returns) */}
          {isApproved && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Approval Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Approved At: </span>
                  <span className="font-medium">
                    {purchaseReturn.approved_at
                      ? new Date(purchaseReturn.approved_at).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Approved By: </span>
                  <span className="font-medium">
                    {purchaseReturn.approved_by
                      ? `User ID: ${purchaseReturn.approved_by}`
                      : "-"}
                  </span>
                </div>
                {purchaseReturn.approval_notes && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Approval Notes: </span>
                    <p className="font-medium mt-1">
                      {purchaseReturn.approval_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form for editing (only if draft status) */}
          {isDraft && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Reason */}
              <FormField label="Reason for Return *">
                <TextArea
                  {...register("reason")}
                  rows={3}
                  className="w-full"
                  placeholder="Enter reason for return..."
                />
              </FormField>

              {/* Items Table */}
              <FormField label="Return Items">
                <div className="border rounded-lg overflow-hidden">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableCell isHeader>Product</TableCell>
                        <TableCell isHeader className="text-center">
                          Original Qty
                        </TableCell>
                        <TableCell isHeader className="text-center">
                          Return Qty
                        </TableCell>
                        <TableCell isHeader className="text-right">
                          Price
                        </TableCell>
                        <TableCell isHeader className="text-right">
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y">
                      {returnItems.map((item, index) => (
                        <TableRow
                          key={item.id || index}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">
                              SKU: {item.product?.sku}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.purchase_item?.quantity ||
                              item.returned_quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="0"
                              max={
                                item.purchase_item?.quantity ||
                                item.returned_quantity
                              }
                              value={item.returned_quantity}
                              onChange={(e) =>
                                handleQuantityChange(index, e.target.value)
                              }
                              className="w-20 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {(typeof item.price === "string"
                              ? parseFloat(item.price)
                              : item.price
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(
                              item.returned_quantity *
                              (typeof item.price === "string"
                                ? parseFloat(item.price)
                                : item.price)
                            ).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </FormField>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-medium">Total Return Amount</span>
                <span className="text-xl font-bold text-orange-600">
                  {getTotalReturnAmount().toLocaleString()}
                </span>
              </div>

              {/* Update Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Return"}
                </Button>
              </div>
            </form>
          )}

          {/* Action Buttons for Draft Returns */}
          {isDraft && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Approve Return
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Return"}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons for Approved Returns */}
          {!isDraft && !isCancelled && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {isApproved && (
                  <Button
                    type="button"
                    onClick={handleProcess}
                    disabled={isProcessed}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Process Return
                  </Button>
                )}
                {!isProcessed && (
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Return"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Status Message */}
          {isProcessed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                This purchase return has been processed and cannot be modified.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                This purchase return has been cancelled.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Loading purchase return details...
        </p>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        purchaseReturn={
          purchaseReturn
            ? {
                id: purchaseReturn.id,
                return_no: purchaseReturn.return_no,
                supplier_name: purchaseReturn.supplier?.name,
                total: purchaseReturn.total || "0",
              }
            : null
        }
        onSuccess={() => {
          onUpdated?.();
          onClose();
        }}
      />

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={isProcessingModalOpen}
        onClose={() => setIsProcessingModalOpen(false)}
        purchaseReturn={
          purchaseReturn
            ? {
                id: purchaseReturn.id,
                return_no: purchaseReturn.return_no,
                supplier_name: purchaseReturn.supplier?.name,
                total: purchaseReturn.total || "0",
              }
            : null
        }
        onSuccess={() => {
          onUpdated?.();
          onClose();
        }}
      />
    </Modal>
  );
}
