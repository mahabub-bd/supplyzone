import {
  Eye,
  FileCheck,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import PageHeader from "../../../components/common/PageHeader";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useGetPurchasesQuery } from "../../../features/purchases/purchasesApi";
import { useModal } from "../../../hooks/useModal";
import { formatDateTime } from "../../../utlis";
import PurchaseReturnModal from "../../Purchase-Return/components/PurchaseReturnModal";
import PurchaseStatusBadge from "./PurchaseStatusBadge";

export default function PurchaseList() {
  const { data, isLoading, isError } = useGetPurchasesQuery();
  const navigate = useNavigate();

  // 🔹 Use the useModal hook for modal state management
  const returnModal = useModal();

  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(
    null
  );

  const purchases = data?.data?.purchases || [];

  if (isLoading) return <Loading message="Loading Purchases..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch purchases.</p>;

  return (
    <>
      <PageHeader
        title="Purchase Management"
        icon={<Plus size={16} />}
        addLabel="Add Purchase"
        onAdd={() => navigate("/purchases/create")}
        permission="purchase.create"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableCell isHeader>PO No</TableCell>
                <TableCell isHeader>Supplier</TableCell>
                <TableCell isHeader>Warehouse</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Paid</TableCell>
                <TableCell isHeader>Due</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Created At</TableCell>
                <TableCell isHeader className="text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {purchases.length > 0 ? (
                purchases.map((p) => {
                  const total = Number(p.total_amount || p.total || 0);
                  const paid = Number(p.paid_amount || 0);
                  const due = Number(p.due_amount || 0);
                  const isFullyPaid = due === 0;
                  const isReceived =
                    p.status === "fully_received" ||
                    p.status === "partial_received";
                  const canReturn =
                    p.status === "fully_received" ||
                    p.status === "partial_received";
                  const isDraft = p.status === "draft";
                  const canEdit = isDraft && !isReceived;
                  const shouldHideEditAndPayment =
                    isFullyPaid && p.status === "fully_received";

                  return (
                    <TableRow key={p.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link to={`/purchases/${p.id}`}>{p.po_no}</Link>
                      </TableCell>
                      <TableCell>
                        {p.supplier?.name || `Supplier #${p.supplier_id}`}
                      </TableCell>
                      <TableCell>
                        {p.warehouse?.name || `Warehouse #${p.warehouse_id}`}
                      </TableCell>

                      {/* Total */}
                      <TableCell className="font-medium">
                        ৳{total.toLocaleString()}
                      </TableCell>

                      {/* Paid */}
                      <TableCell className="text-green-600 font-medium">
                        ৳{paid.toLocaleString()}
                      </TableCell>

                      {/* Due */}
                      <TableCell
                        className={`font-medium ${
                          due > 0 ? "text-red-500" : "text-gray-500"
                        }`}
                      >
                        ৳{due.toLocaleString()}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="capitalize">
                        <PurchaseStatusBadge status={p.status} />
                      </TableCell>

                      {/* Created Date */}
                      <TableCell>{formatDateTime(p.created_at)}</TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === p.id ? null : p.id
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>

                          <Dropdown
                            isOpen={activeDropdown === p.id}
                            onClose={() => setActiveDropdown(null)}
                            className="min-w-45"
                          >
                            {/* View Details */}
                            <DropdownItem
                              onClick={() => {
                                navigate(`/purchases/${p.id}`);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View Details
                            </DropdownItem>

                            {/* Receive Items - Only show when not received */}
                            {!isReceived && (
                              <DropdownItem
                                onClick={() => {
                                  navigate(`/purchases/${p.id}?receive=true`);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center gap-2"
                              >
                                <FileCheck size={14} />
                                Receive Items
                              </DropdownItem>
                            )}

                            {/* Make Payment - Only show when due > 0 or not fully received */}
                            {!shouldHideEditAndPayment && (
                              <DropdownItem
                                onClick={() => {
                                  navigate(`/purchases/${p.id}?payment=true`);
                                  setActiveDropdown(null);
                                }}
                                disabled={isFullyPaid}
                                className="flex items-center gap-2"
                              >
                                <Wallet size={14} />
                                Make Payment
                              </DropdownItem>
                            )}

                            {/* Purchase Return */}
                            <DropdownItem
                              onClick={() => {
                                setSelectedPurchase(p);
                                returnModal.openModal();
                                setActiveDropdown(null);
                              }}
                              disabled={!canReturn}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw size={14} />
                              Purchase Return
                            </DropdownItem>

                            {/* Edit Purchase - Only for draft status and not received, or when not fully paid and received */}
                            {!shouldHideEditAndPayment && (
                              <DropdownItem
                                onClick={() => {
                                  navigate(`/purchases/edit/${p.id}`);
                                  setActiveDropdown(null);
                                }}
                                disabled={!canEdit}
                                className="flex items-center gap-2"
                              >
                                <Pencil size={14} />
                                Edit
                              </DropdownItem>
                            )}
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-6 text-center text-gray-500"
                  >
                    No purchases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Purchase Return Modal */}
      <PurchaseReturnModal
        isOpen={returnModal.isOpen}
        onClose={() => {
          returnModal.closeModal();
          setSelectedPurchase(null);
        }}
        purchase={selectedPurchase}
      />
    </>
  );
}
