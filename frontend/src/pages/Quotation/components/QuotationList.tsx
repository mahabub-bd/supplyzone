import {
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
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
import {
  useDeleteQuotationMutation,
  useGetQuotationsQuery,
} from "../../../features/quotation/quotationApi";
import { QuotationStatus } from "../../../types/quotation";
import { formatDateTime } from "../../../utlis";
import QuotationStatusBadge from "./QuotationStatusBadge";

export default function QuotationList() {
  const { data, isLoading, isError } = useGetQuotationsQuery({});
  const navigate = useNavigate();
  const [deleteQuotation] = useDeleteQuotationMutation();
  const [activeDropdown, setActiveDropdown] = useState<string | number | null>(
    null
  );

  const quotations = data?.data || [];

  const handleDelete = async (id: number, quotationNo: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete quotation ${quotationNo}?`
      )
    ) {
      try {
        await deleteQuotation(id).unwrap();
        // Toast is typically handled by RTK Query middleware
      } catch (error) {
        console.error("Failed to delete quotation:", error);
      }
    }
  };

  if (isLoading) return <Loading message="Loading Quotations..." />;
  if (isError)
    return <p className="p-6 text-red-500">Failed to fetch quotations.</p>;

  return (
    <>
      <PageHeader
        title="Quotation List"
        icon={<Plus size={16} />}
        addLabel="Add Quotation"
        onAdd={() => navigate("/quotations/create")}
        permission="quotation.create"
      />

      {/* Analytics Section */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Quotation No</TableCell>
                <TableCell isHeader>Customer</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Tax</TableCell>
                <TableCell isHeader>Net Total</TableCell>
                <TableCell isHeader>Valid Until</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader>Created At</TableCell>
                <TableCell isHeader className="text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {quotations.length > 0 ? (
                quotations.map((q) => {
                  const total = Number(q.total || 0);
                  const tax = Number(q.tax || 0);
                  const netTotal = total + tax;
                  const isDraft = q.status === QuotationStatus.DRAFT;
                  const isSent = q.status === QuotationStatus.SENT;
                  const isAccepted = q.status === QuotationStatus.ACCEPTED;
                  const isRejected = q.status === QuotationStatus.REJECTED;
                  const isConverted = q.status === QuotationStatus.CONVERTED;

                  // Calculate if quotation is expired
                  const isExpiredDate = new Date(q.valid_until) < new Date();

                  return (
                    <TableRow key={q.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link to={`/quotations/${q.id}`}>{q.quotation_no}</Link>
                      </TableCell>
                      <TableCell>
                        {q.customer?.name || `Customer #${q.customer.id}`}
                      </TableCell>

                      {/* Total */}
                      <TableCell className="font-medium">
                        ৳{total.toLocaleString()}
                      </TableCell>

                      {/* Tax */}
                      <TableCell className="text-blue-600 font-medium">
                        ৳{tax.toLocaleString()}
                      </TableCell>

                      {/* Net Total */}
                      <TableCell className="font-semibold text-green-600">
                        ৳{netTotal.toLocaleString()}
                      </TableCell>

                      {/* Valid Until */}
                      <TableCell>
                        <span
                          className={`${
                            isExpiredDate ? "text-red-500 font-medium" : ""
                          }`}
                        >
                          {formatDateTime(q.valid_until)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="capitalize">
                        <QuotationStatusBadge status={q.status} />
                      </TableCell>

                      {/* Created Date */}
                      <TableCell>{formatDateTime(q.created_at)}</TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === q.id ? null : q.id
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-600" />
                          </button>

                          <Dropdown
                            isOpen={activeDropdown === q.id}
                            onClose={() => setActiveDropdown(null)}
                            className="min-w-45"
                          >
                            {/* View Details */}
                            <DropdownItem
                              onClick={() => {
                                navigate(`/quotations/${q.id}`);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View Details
                            </DropdownItem>

                            {/* Edit Quotation - Only for draft and sent status, not converted */}
                            {(isDraft || isSent) && !isConverted && (
                              <DropdownItem
                                onClick={() => {
                                  navigate(`/quotations/edit/${q.id}`);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Pencil size={14} />
                                Edit Quotation
                              </DropdownItem>
                            )}

                            {/* Send Quotation - Only for draft status */}
                            {isDraft && (
                              <DropdownItem
                                onClick={() => {
                                  // TODO: Implement send quotation functionality
                                  console.log("Send quotation:", q.id);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Send size={14} />
                                Send to Customer
                              </DropdownItem>
                            )}

                            {/* Convert to Sale - Only for accepted status, not already converted */}
                            {isAccepted && !isConverted && (
                              <DropdownItem
                                onClick={() => {
                                  navigate(`/quotations/${q.id}?convert=true`);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center gap-2"
                              >
                                <ShoppingBag size={14} />
                                Convert to Sale
                              </DropdownItem>
                            )}

                            {/* Duplicate Quotation */}
                            <DropdownItem
                              onClick={() => {
                                navigate(
                                  `/quotations/create?duplicate=${q.id}`
                                );
                                setActiveDropdown(null);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FileText size={14} />
                              Duplicate
                            </DropdownItem>

                            {/* Delete Quotation - Only for draft and rejected status, not converted */}
                            {(isDraft || isRejected) && !isConverted && (
                              <DropdownItem
                                onClick={() => {
                                  handleDelete(q.id, q.quotation_no);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
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
                    className="text-center py-8 text-gray-500"
                  >
                    No quotations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
