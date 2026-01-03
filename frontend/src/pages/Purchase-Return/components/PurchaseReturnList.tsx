import { Check, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import { useGetPurchaseReturnsQuery } from "../../../features/purchase-return/purchaseReturnApi";
import ApprovalModal from "./ApprovalModal";
import PurchaseReturnEditModal from "./PurchaseReturnEditModal";
import PurchaseReturnStatusBadge from "./PurchaseReturnStatusBadge";

import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useModal } from "../../../hooks/useModal";

export default function PurchaseReturnList() {
  const { data, isLoading, isError, refetch } = useGetPurchaseReturnsQuery();
  const navigate = useNavigate();

  // 🔹 Use the useModal hook for modal state management
  const editModal = useModal();
  const approvalModal = useModal();

  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [selectedApproveReturn, setSelectedApproveReturn] = useState<any>(null);

  const purchaseReturns = data?.data || [];

  const handleApproveClick = (purchaseReturn: any) => {
    setSelectedApproveReturn({
      id: purchaseReturn.id,
      return_no: purchaseReturn.return_no,
      supplier_name: purchaseReturn.supplier?.name,
      total: purchaseReturn.total || "0",
    });
    approvalModal.openModal();
  };

  if (isLoading) return <Loading message="Loading Purchase Returns..." />;
  if (isError)
    return (
      <p className="p-6 text-red-500">Failed to fetch purchase returns.</p>
    );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Return No</TableCell>
                <TableCell isHeader>Purchase No</TableCell>
                <TableCell isHeader>Supplier</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Created At</TableCell>
                <TableCell isHeader className="text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {purchaseReturns.length > 0 ? (
                purchaseReturns.map((pr) => (
                  <TableRow
                    key={pr.id}
                    className={`hover:bg-gray-50 ${
                      pr.status === "approved" ? "bg-blue-50" : ""
                    }`}
                  >
                    <TableCell className="font-medium">
                      <Link to={`/purchase-returns/${pr.id}`}>
                        {pr.return_no}
                      </Link>
                    </TableCell>

                    <TableCell className="font-medium">
                      {pr.purchase?.po_no || `PO #${pr.purchase_id}`}
                    </TableCell>

                    <TableCell>
                      {pr.supplier?.name || `Supplier #${pr.supplier_id}`}
                    </TableCell>

                    <TableCell className="font-medium">
                      {parseFloat(pr.total || "0").toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <PurchaseReturnStatusBadge status={pr.status} />
                    </TableCell>

                    <TableCell>
                      {new Date(pr.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* Approve */}
                        {pr.status === "draft" && (
                          <IconButton
                            icon={Check}
                            color="green"
                            tooltip="Approve"
                            onClick={() => handleApproveClick(pr)}
                          />
                        )}
                        {/* Edit */}
                        {(pr.status === "draft" ||
                          pr.status === "approved") && (
                          <IconButton
                            icon={Edit}
                            color="blue"
                            tooltip="Edit"
                            onClick={() => {
                              setSelectedReturn(pr);
                              editModal.openModal();
                            }}
                          />
                        )}
                        {/* View */}
                        <IconButton
                          icon={Eye}
                          color="gray"
                          tooltip="View"
                          onClick={() => navigate(`/purchase-returns/${pr.id}`)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-gray-500"
                  >
                    No purchase returns found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Purchase Return Edit Modal */}
      <PurchaseReturnEditModal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.closeModal();
          setSelectedReturn(null);
        }}
        purchaseReturn={selectedReturn}
        onUpdated={() => {
          refetch();
        }}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => {
          approvalModal.closeModal();
          setSelectedApproveReturn(null);
        }}
        purchaseReturn={selectedApproveReturn}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
}
