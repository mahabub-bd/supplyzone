import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../../../components/common/Loading";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import Button from "../../../../components/ui/button/Button";
import { useGetPaymentByIdQuery } from "../../../../features/payment/paymentApi";
import { Customer } from "../../../../types/customer";
import { Supplier } from "../../../../types/supplier";

export default function PaymentDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetPaymentByIdQuery(Number(id));
  const payment = data?.data;

  if (isLoading) return <Loading message="Loading payment details..." />;
  if (isError || !payment)
    return <p className="text-red-500 p-4">Payment not found</p>;

  const isSupplierPayment = payment.type === "supplier";
  const displayParty = isSupplierPayment ? payment.supplier : payment.customer;

  // Helper function to render address based on party type
  const renderAddress = (party: Supplier | Customer | undefined) => {
    if (!party) return null;

    // Supplier has a simple address string
    if ('address' in party && party.address) {
      return (
        <p>
          <strong>Address:</strong> {party.address}
        </p>
      );
    }

    // Customer has billing_address and shipping_address objects
    if ('billing_address' in party && party.billing_address) {
      const addr = party.billing_address;
      const addressParts = [addr.street, addr.city, addr.country].filter(Boolean);

      if (addressParts.length > 0) {
        return (
          <p>
            <strong>Billing Address:</strong> {addressParts.join(', ')}
          </p>
        );
      }
    }

    return null;
  };

  return (
    <div>
      <PageMeta title="Payment Details" description="Single payment view" />
      <PageBreadcrumb pageTitle="Payment Details" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-6 py-7 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-semibold">Payment #{payment.id}</h1>
          <Link to="/payments">
            <Button size="sm">
              <ArrowLeft size={16} /> Back to payments
            </Button>
          </Link>
        </div>

        {/* Main Details */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Payment Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Payment Information
            </h2>
            <p>
              <strong>Amount:</strong> ৳{Number(payment.amount).toFixed(2)}
            </p>
            <p>
              <strong>Method:</strong> {payment.method}
            </p>
            <p>
              <strong>Status:</strong> {payment.note}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(payment.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Party Info (Supplier / Customer) */}
          {displayParty && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {isSupplierPayment ? "Supplier Details" : "Customer Details"}
              </h2>
              <p>
                <strong>Name:</strong> {displayParty.name}
              </p>
              {displayParty?.phone && (
                <p>
                  <strong>Phone:</strong> {displayParty.phone}
                </p>
              )}
              {displayParty?.email && (
                <p>
                  <strong>Email:</strong> {displayParty.email}
                </p>
              )}
              {renderAddress(displayParty)}
            </div>
          )}
        </div>

        {/* Reference Transaction */}
        <div className="mt-5 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isSupplierPayment ? "Purchase Info" : "Sale Info"}
          </h2>

          {payment.purchase && (
            <div className="text-sm space-y-1">
              <p>
                <strong>PO No:</strong> {payment.purchase.po_no}
              </p>
              <p>
                <strong>Total:</strong> ৳
                {Number(payment.purchase.total).toFixed(2)}
              </p>
            </div>
          )}

          {payment.sale && (
            <div className="text-sm space-y-1">
              <p>
                <strong>Invoice No:</strong> {payment.sale.invoice_no}
              </p>
              <p>
                <strong>Total:</strong> ৳{Number(payment.sale.total).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
