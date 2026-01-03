import {
  CreditCard,
  FileDown,
  PackageCheck,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import IconButton from "../../../components/common/IconButton";
import Loading from "../../../components/common/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/common/Table";
import { useLazyGetInvoicePdfQuery } from "../../../features/invoice/invoiceApi";
import { useGetPurchaseByIdQuery } from "../../../features/purchases/purchasesApi";
import {
  PaymentHistory,
  PurchaseItem,
  PurchaseOrderStatus,
} from "../../../types/purchase";
import { formatDateTime } from "../../../utlis";

import Info from "../../../components/common/Info";
import PurchaseReturnModal from "../../Purchase-Return/components/PurchaseReturnModal";
import PurchasePaymentModal from "./PurchasePaymentModal";
import PurchaseReceiveModal from "./PurchaseReceiveModal";
import PurchaseStatusBadge from "./PurchaseStatusBadge";
import PurchaseStatusModal from "./PurchaseStatusModal";

interface Props {
  purchaseId: string;
}

export default function PurchaseDetail({ purchaseId }: Props) {
  const { data, isLoading, isError } = useGetPurchaseByIdQuery(purchaseId);
  const purchase = data?.data;
  const [getInvoicePdf, { isLoading: isDownloadingPdf }] =
    useLazyGetInvoicePdfQuery();

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      const blob = await getInvoicePdf({
        type: "purchase",
        id: Number(purchaseId),
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

  if (isLoading) return <Loading message="Loading Purchase..." />;
  if (isError || !purchase) return <ErrorMessage />;

  const totalPaid =
    purchase.payment_history?.reduce((sum, p) => sum + Number(p.amount), 0) ||
    0;

  return (
    <>
      <HeaderSection
        purchase={purchase}
        openReceive={() => setIsReceiveModalOpen(true)}
        openPayment={() => setIsPaymentModalOpen(true)}
        openStatus={() => setIsStatusModalOpen(true)}
        openReturn={() => setIsReturnModalOpen(true)}
        downloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      <DetailCard title="Purchase Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info
            label="Purchase Order"
            value={purchase.po_no || `PO-${purchase.id}`}
          />
          <Info label="Supplier" value={purchase.supplier?.name || "-"} />
          <Info
            label="Contact Person"
            value={purchase.supplier?.contact_person || "-"}
          />
          <Info label="Warehouse" value={purchase.warehouse?.name || "-"} />
          <Info label="Location" value={purchase.warehouse?.location || "-"} />
          <Info
            label="Status"
            value={<PurchaseStatusBadge status={purchase.status} />}
          />
          <Info
            label="Created At"
            value={formatDateTime(purchase.created_at)}
          />
          <Info
            label="Expected Delivery"
            value={
              purchase.expected_delivery_date
                ? formatDateTime(purchase.expected_delivery_date)
                : "-"
            }
          />
          <Info
            label="Created By"
            value={purchase.created_by?.full_name || "-"}
          />
          <Info
            label="Payment Terms"
            value={purchase.supplier?.payment_terms || "-"}
          />
          <Info label="Subtotal" value={<Amount>{purchase.subtotal}</Amount>} />
          <Info
            label="Total"
            value={<Amount>{purchase.total_amount || purchase.total}</Amount>}
          />
          {purchase.metadata?.status_changed_at && (
            <Info
              label="Status Changed At"
              value={new Date(
                purchase.metadata.status_changed_at
              ).toLocaleString()}
            />
          )}
          {purchase.metadata?.status_change_reason && (
            <Info
              label="Status Change Reason"
              value={purchase.metadata.status_change_reason}
            />
          )}
        </div>
      </DetailCard>

      <MetricsCard
        paid={purchase.paid_amount}
        due={purchase.due_amount}
        total={purchase.total_amount || purchase.total}
      />

      <TableCard title="Purchased Items">
        <ItemTable
          items={purchase.items}
          total={purchase.total_amount || purchase.total}
        />
      </TableCard>

      {purchase.payment_history?.length > 0 && (
        <TableCard title="Payment History">
          <PaymentTable
            history={purchase.payment_history}
            totalPaid={totalPaid}
          />
        </TableCard>
      )}

      <PurchaseReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        purchase={purchase}
      />
      <PurchasePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        purchase={purchase}
      />
      <PurchaseStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        purchase={purchase}
      />
      <PurchaseReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        purchase={purchase}
      />
    </>
  );
}

/* ---------------------- Reusable Components ---------------------- */

const ErrorMessage = () => (
  <p className="p-6 text-red-500">Failed to load purchase details.</p>
);

const HeaderSection = ({
  purchase,
  openReceive,
  openPayment,
  openStatus,
  openReturn,
  downloadPdf,
  isDownloadingPdf,
}: any) => {
  const isReceived =
    purchase.status === PurchaseOrderStatus.FULLY_RECEIVED ||
    purchase.status === PurchaseOrderStatus.PARTIAL_RECEIVED;
  const isFullyPaid = Number(purchase.due_amount || 0) === 0;
  const shouldHidePaymentButton =
    isFullyPaid && purchase.status === PurchaseOrderStatus.FULLY_RECEIVED;
  const canReturn =
    purchase.status === PurchaseOrderStatus.FULLY_RECEIVED ||
    purchase.status === PurchaseOrderStatus.PARTIAL_RECEIVED;

  return (
    <div className="flex flex-wrap justify-between items-center mb-2">
      <h1 className="text-xl font-semibold">Purchase Details</h1>
      <div className="flex gap-3">
        {/* Receive Items - Only show when not received */}
        {!isReceived && (
          <IconButton
            icon={PackageCheck}
            color="blue"
            tooltip="Receive Items"
            onClick={openReceive}
          >
            Receive
          </IconButton>
        )}

        {/* Make Payment - Only show when due > 0 or not fully received */}
        {!shouldHidePaymentButton && (
          <IconButton
            icon={CreditCard}
            color="green"
            tooltip="Make Payment"
            onClick={openPayment}
          >
            Pay
          </IconButton>
        )}

        {/* Purchase Return - Only show when received */}
        {canReturn && (
          <IconButton
            icon={RotateCcw}
            color="purple"
            tooltip="Purchase Return"
            onClick={openReturn}
          >
            Return
          </IconButton>
        )}

        <IconButton
          icon={FileDown}
          color="blue"
          tooltip="Download PDF"
          onClick={downloadPdf}
          disabled={isDownloadingPdf}
        >
          {isDownloadingPdf ? "Opening PDF..." : "View PDF"}
        </IconButton>

        <IconButton
          icon={RefreshCcw}
          color="orange"
          tooltip="Change Status"
          onClick={openStatus}
        >
          Change Status
        </IconButton>
      </div>
    </div>
  );
};

const DetailCard = ({ title, children }: any) => (
  <div className="bg-white shadow-sm rounded-xl border p-3 mb-3">
    <SectionHeader title={title} />
    {children}
  </div>
);

const TableCard = ({ title, children }: any) => (
  <DetailCard title={title}>
    <div className="overflow-x-auto">{children}</div>
  </DetailCard>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-lg font-medium mb-3">{title}</h2>
);

const Amount = ({ children }: any) => (
  <span className="font-semibold text-gray-800">
    ৳{Number(children).toLocaleString()}
  </span>
);

/* Metrics Summary */
const MetricsCard = ({ paid, due, total }: any) => (
  <div className="bg-gray-50 p-2 rounded-lg shadow-sm mb-3 flex justify-around text-center">
    <Metric label="Paid" value={paid} color="text-green-600" />
    <Metric label="Due" value={due} color="text-red-500" />
    <Metric label="Total" value={total} color="text-gray-800" />
  </div>
);

const Metric = ({ label, value, color }: any) => (
  <div>
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className={`text-lg font-bold ${color}`}>
      ৳{Number(value).toLocaleString()}
    </p>
  </div>
);

/* Tables */

const ItemTable = ({ items, total }: any) => (
  <Table className="text-sm">
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableCell isHeader className="py-2">
          Product
        </TableCell>
        <TableCell isHeader className="py-2">
          SKU
        </TableCell>
        <TableCell isHeader className="py-2">
          Quantity
        </TableCell>
        <TableCell isHeader className="py-2">
          Received
        </TableCell>
        <TableCell isHeader className="py-2">
          Unit Price
        </TableCell>
        <TableCell isHeader className="py-2">
          Discount/Unit
        </TableCell>
        <TableCell isHeader className="py-2">
          Tax Rate
        </TableCell>
        <TableCell isHeader className="py-2">
          Subtotal
        </TableCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item: PurchaseItem) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountPerUnit = Number(item.discount_per_unit) || 0;
        const taxRate = Number(item.tax_rate) || 0;
        const subtotal =
          (unitPrice - discountPerUnit) * quantity * (1 + taxRate / 100);

        return (
          <TableRow key={item.id} className="border-b">
            <TableCell className="py-1">{item.product?.name || "-"}</TableCell>
            <TableCell className="py-1 text-gray-600 text-xs">
              {item.product?.sku || "-"}
            </TableCell>
            <TableCell className="py-1">{item.quantity}</TableCell>
            <TableCell className="py-1">
              <span
                className={`${
                  Number(item.quantity_received) === Number(item.quantity)
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {item.quantity_received || 0}
              </span>
            </TableCell>
            <TableCell className="py-1">৳{unitPrice.toFixed(2)}</TableCell>
            <TableCell className="py-1">
              ৳{discountPerUnit.toFixed(2)}
            </TableCell>
            <TableCell className="py-1">{taxRate}%</TableCell>
            <TableCell className="py-1">৳{subtotal.toFixed(2)}</TableCell>
          </TableRow>
        );
      })}
      <TableRow className="font-semibold bg-gray-50/50">
        <TableCell colSpan={7} className="py-2">
          Total
        </TableCell>
        <TableCell className="py-2">৳{Number(total).toFixed(2)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const PaymentTable = ({ history, totalPaid }: any) => (
  <Table className="text-sm">
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableCell isHeader className="py-2">
          Reference
        </TableCell>
        <TableCell isHeader className="py-2">
          Date
        </TableCell>
        <TableCell isHeader className="py-2">
          Amount
        </TableCell>
        <TableCell isHeader className="py-2">
          Method
        </TableCell>
        <TableCell isHeader className="py-2">
          Note
        </TableCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {history.map((p: PaymentHistory) => (
        <TableRow key={p.id} className="border-b">
          <TableCell className="py-1">#{p.id}</TableCell>
          <TableCell className="py-1">{formatDateTime(p.created_at)}</TableCell>
          <TableCell className="py-1 text-green-600 font-medium">
            ৳{Number(p.amount).toLocaleString()}
          </TableCell>
          <TableCell className="capitalize py-1">{p.method}</TableCell>
          <TableCell className="py-1">{p.note || "-"}</TableCell>
        </TableRow>
      ))}
      <TableRow className="font-semibold bg-gray-50/50">
        <TableCell colSpan={3} className="py-2">
          Total Paid
        </TableCell>
        <TableCell className="text-green-600 py-2">
          ৳{totalPaid.toLocaleString()}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
