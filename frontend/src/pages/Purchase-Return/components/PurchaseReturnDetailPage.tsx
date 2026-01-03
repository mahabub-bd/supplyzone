import { ArrowLeft, FileText, MapPin, Package, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Info from "../../../components/common/Info";
import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { useGetPurchaseReturnByIdQuery } from "../../../features/purchase-return/purchaseReturnApi";
import { formatDateTime } from "../../../utlis";
import ApprovalModal from "./ApprovalModal";
import CancelModal from "./CancelModal";
import ProcessingModal from "./ProcessingModal";
import PurchaseReturnStatusBadge from "./PurchaseReturnStatusBadge";
import RefundModal from "./RefundModal";

export default function PurchaseReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetPurchaseReturnByIdQuery(
    id!
  );

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const purchaseReturn = data?.data;

  if (isLoading) {
    return <div className="p-6">Loading purchase return details...</div>;
  }

  if (isError || !purchaseReturn) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">Purchase return not found</p>
        <Button onClick={() => navigate("/purchase-returns")} variant="outline">
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-end mb-4">
          <Button
            size="sm"
            onClick={() => navigate("/purchase-returns")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to list
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Purchase Return #{purchaseReturn.return_no}
            </h1>
            <p className="text-gray-500 mt-1">
              Created on{" "}
              {new Date(purchaseReturn.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            {purchaseReturn.status === "draft" && (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="border-red-300 text-red-600"
                >
                  Cancel
                </Button>
              </>
            )}

            {purchaseReturn.status === "approved" && (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsProcessingModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Process
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="border-red-300 text-red-600"
                >
                  Cancel
                </Button>
              </>
            )}

            {purchaseReturn.status === "processed" &&
              !purchaseReturn.refund_to_supplier && (
                <Button
                  size="sm"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Process Refund
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Return Info */}
          <Section
            title="Purchase Return Information"
            icon={<FileText size={18} />}
          >
            <Grid>
              <Info label="Return No" value={purchaseReturn.return_no} />
              <Info
                label="Total Amount"
                value={Number(purchaseReturn.total || 0).toLocaleString()}
              />
              <Info
                label="Return Date"
                value={formatDateTime(purchaseReturn.created_at)}
              />
              <Info label="Reason" value={purchaseReturn.reason} />
            </Grid>
          </Section>

          {/* Original Purchase */}
          <Section
            title="Original Purchase Details"
            icon={<Package size={18} />}
          >
            <Grid cols="md:grid-cols-3">
              <Info label="PO No" value={purchaseReturn.purchase?.po_no} />
              <Info
                label="Purchase Total"
                value={Number(
                  purchaseReturn.purchase?.total || 0
                ).toLocaleString()}
              />
              <Info
                label="Paid Amount"
                value={Number(
                  purchaseReturn.purchase?.paid_amount || 0
                ).toLocaleString()}
              />
              <Info
                label="Due Amount"
                value={Number(
                  purchaseReturn.purchase?.due_amount || 0
                ).toLocaleString()}
              />
              <Info label="Status" value={purchaseReturn.purchase?.status} />
              <Info
                label="Created At"
                value={
                  purchaseReturn.purchase?.created_at
                    ? formatDateTime(purchaseReturn.purchase.created_at)
                    : "-"
                }
              />
            </Grid>
          </Section>

          {/* Approval Status */}
          <Section title="Approval Status" icon={<FileText size={18} />}>
            <Grid>
              <Info
                label="Status"
                value={
                  <PurchaseReturnStatusBadge status={purchaseReturn.status} />
                }
              />
              <Info
                label="Approved At"
                value={
                  purchaseReturn.approved_at
                    ? formatDateTime(purchaseReturn.approved_at)
                    : "-"
                }
              />
              <Info
                label="Approved By"
                value={purchaseReturn.approved_user?.full_name}
              />
              <Info
                label="Processed By"
                value={purchaseReturn.processed_user?.full_name}
              />
              <Info
                label="Processed At"
                value={
                  purchaseReturn.processed_at
                    ? formatDateTime(purchaseReturn.processed_at)
                    : "-"
                }
              />
              <Info
                label="Approval Notes"
                value={purchaseReturn.approval_notes}
                className="col-span-2"
              />
            </Grid>
          </Section>

          {/* Returned Items */}
          <Section title="Returned Items" icon={<Package size={18} />}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Product</TableCell>
                    <TableCell isHeader className="text-center">
                      Qty
                    </TableCell>
                    <TableCell isHeader className="text-right">
                      Price
                    </TableCell>
                    <TableCell isHeader className="text-right">
                      Total
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {purchaseReturn.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell className="text-center">
                        {item.returned_quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(item.price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {Number(item.line_total).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right text-lg font-bold text-orange-600">
                      {Number(purchaseReturn.total).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Section title="Supplier Information" icon={<User size={18} />}>
            <div className="space-y-3">
              <Info label="Name" value={purchaseReturn.supplier?.name} />
              <Info
                label="Supplier Code"
                value={purchaseReturn.supplier?.supplier_code}
              />
              <Info
                label="Contact Person"
                value={purchaseReturn.supplier?.contact_person}
              />
              <Info label="Phone" value={purchaseReturn.supplier?.phone} />
              <Info label="Email" value={purchaseReturn.supplier?.email} />
              <Info label="Address" value={purchaseReturn.supplier?.address} />
            </div>
          </Section>

          <Section title="Warehouse Information" icon={<MapPin size={18} />}>
            <div className="space-y-3">
              <Info label="Name" value={purchaseReturn.warehouse?.name} />
              <Info
                label="Location"
                value={purchaseReturn.warehouse?.location}
              />
              <Info label="Address" value={purchaseReturn.warehouse?.address} />
            </div>
          </Section>
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        purchaseReturn={purchaseReturn}
        onSuccess={refetch}
      />

      <ProcessingModal
        isOpen={isProcessingModalOpen}
        onClose={() => setIsProcessingModalOpen(false)}
        purchaseReturn={purchaseReturn}
        onSuccess={refetch}
      />

      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        purchaseReturn={purchaseReturn}
        onSuccess={refetch}
      />

      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        purchaseReturn={purchaseReturn}
        onSuccess={refetch}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helper Components                                                           */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({
  children,
  cols = "sm:grid-cols-2",
}: {
  children: React.ReactNode;
  cols?: string;
}) {
  return <div className={`grid grid-cols-1 ${cols} gap-4`}>{children}</div>;
}
