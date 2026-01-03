import {
  ArrowLeft,
  Edit,
  FileDown,
  FileText,
  Send,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../../components/common/Loading";
import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useLazyGetInvoicePdfQuery } from "../../../features/invoice/invoiceApi";
import {
  useDeleteQuotationMutation,
  useGetQuotationByIdQuery,
  useUpdateQuotationStatusMutation,
} from "../../../features/quotation/quotationApi";
import { QuotationItem, QuotationStatus } from "../../../types/quotation";
import {
  formatCurrencyEnglish as formatCurrency,
  formatDateTime,
} from "../../../utlis";
import ConvertToSaleModal from "./ConvertToSaleModal";
import { QuotationStatusBadge } from "./QuotationStatusBadge";

export default function QuotationDetail({ id }: { id: string }) {
  const {
    data: quotation,
    isLoading,
    error,
  } = useGetQuotationByIdQuery(Number(id));
  const navigate = useNavigate();
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [getInvoicePdf, { isLoading: isDownloadingPdf }] =
    useLazyGetInvoicePdfQuery();

  const [updateQuotationStatus, { isLoading: isSending }] =
    useUpdateQuotationStatusMutation();
  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationMutation();

  const handleDownloadPdf = async () => {
    try {
      const blob = await getInvoicePdf({
        type: "quotation",
        id: Number(id),
      }).unwrap();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Clean up the object URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      toast.error("Failed to open PDF");
      console.error("PDF open error:", error);
    }
  };

  if (isLoading) return <Loading message="Loading Quotation Details" />;
  if (error)
    return <div className="p-6 text-red-500">Error loading quotation</div>;
  if (!quotation?.data) return <div className="p-6">Quotation not found</div>;

  const q = quotation.data;
  const isDraft = q.status === "draft";
  const isSent = q.status === "sent";
  const isAccepted = q.status === "accepted";
  const isConverted = q.status === "converted";

  const handleEdit = () => {
    navigate(`/quotations/edit/${q.id}`);
  };

  const handleSend = async () => {
    try {
      await updateQuotationStatus({
        id: q.id,
        body: { status: QuotationStatus.SENT },
      }).unwrap();

      // Optional: Show success message or redirect
      toast.success("Quotation sent successfully!");
    } catch (error) {
      console.error("Failed to send quotation:", error);
      toast.error("Failed to send quotation. Please try again.");
    }
  };

  const handleConvert = () => {
    setIsConvertModalOpen(true);
  };

  const handleConvertSuccess = (sale: any) => {
    // Navigate to the newly created sale
    navigate(`/sales/${sale.id}`);
  };

  const handleDuplicate = () => {
    navigate(`/quotations/create?duplicate=${q.id}`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete quotation ${q.quotation_no}?`
      )
    ) {
      try {
        await deleteQuotation(q.id).unwrap();

        // Redirect to quotations list after successful deletion
        navigate("/quotations");
        alert("Quotation deleted successfully!");
      } catch (error) {
        console.error("Failed to delete quotation:", error);
        alert("Failed to delete quotation. Please try again.");
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {q.quotation_no}
            </h1>
            <p className="text-sm text-gray-500">
              Created on {formatDateTime(q.created_at)}
            </p>
            <div>
              Status : <QuotationStatusBadge status={q.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isDraft || isSent) && !isConverted && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
          )}

          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSend}
              disabled={isSending}
            >
              <Send size={16} className="mr-1" />
              {isSending ? "Sending..." : "Send"}
            </Button>
          )}

          {isAccepted && !isConverted && (
            <Button variant="outline" size="sm" onClick={handleConvert}>
              <ShoppingBag size={16} className="mr-1" />
              Convert to Sale
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <FileText size={16} className="mr-1" />
            Duplicate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            <FileDown size={16} className="mr-1" />
            {isDownloadingPdf ? "Opening PDF..." : "View PDF"}
          </Button>

          {(isDraft || q.status === "rejected") && !isConverted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} className="mr-1" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/quotations")}
            className="p-2"
          >
            <ArrowLeft size={18} />
            Back to list
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Branch Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">
              Customer & Branch Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Customer
                </label>
                <p className="font-medium">{q.customer?.name}</p>
                <p className="text-sm text-gray-500">{q.customer?.phone}</p>
                <p className="text-sm text-gray-500">{q.customer?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Branch
                </label>
                <p className="font-medium">{q.branch?.name}</p>
                <p className="text-sm text-gray-500">{q.branch?.address}</p>
                <p className="text-sm text-gray-500">{q.branch?.phone}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Quotation Items</h2>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableCell isHeader>Product</TableCell>
                    <TableCell isHeader>Quantity</TableCell>
                    <TableCell isHeader>Unit Price</TableCell>
                    <TableCell isHeader>Discount</TableCell>
                    <TableCell isHeader>Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.items?.map((item: QuotationItem) => (
                    <TableRow key={item.id} className="border-b">
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(item.unit_price))}
                      </TableCell>
                      <TableCell>
                        {Number(item.discount_percentage) > 0 ? (
                          <span className="text-sm">
                            {item.discount_percentage}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(item.total_price))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Terms & Conditions */}
          {q.terms_and_conditions && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {q.terms_and_conditions}
              </p>
            </div>
          )}

          {/* Notes */}
          {q.notes && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p className="text-gray-700">{q.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(Number(q.subtotal))}
                </span>
              </div>

              {Number(q.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(Number(q.discount))}
                  </span>
                </div>
              )}

              {Number(q.tax) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(Number(q.tax))}
                  </span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(Number(q.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Validity</h2>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Valid Until
                </label>
                <p
                  className={`font-medium ${
                    new Date(q.valid_until) < new Date() ? "text-red-500" : ""
                  }`}
                >
                  {formatDateTime(q.valid_until)}
                </p>
              </div>
            </div>
          </div>

          {/* Created By */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Created By</h2>
            <div>
              <p className="font-medium">{q.created_by?.full_name}</p>
              <p className="text-sm text-gray-500">{q.created_by?.email}</p>
              <p className="text-sm text-gray-500">{q.created_by?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Convert to Sale Modal */}
      <ConvertToSaleModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        quotation={q}
        onSuccess={handleConvertSuccess}
      />
    </div>
  );
}
