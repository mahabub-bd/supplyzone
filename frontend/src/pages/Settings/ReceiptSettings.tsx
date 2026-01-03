import { pdf } from "@react-pdf/renderer";
import React, { useState } from "react";
import Loading from "../../components/common/Loading";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ReceiptPDF from "../../components/receipt/ReceiptPDF";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { useGetReceiptPreviewQuery } from "../../features/settings/settingsApi";
import { SaleData } from "../../types/sales";
import { ReceiptPreviewData } from "../../types/settings";

const sampleSaleData: SaleData = {
  invoice_no: "INV-20251204-0013",
  items: [
    {
      id: 1,
      product: {
        id: 1,
        name: "Honor 200 5G",
        sku: "HON-897673",
        barcode: "1764260826562",
        description: "Honor 200 5G",
        selling_price: "35000.00",
        purchase_price: "30000.00",
        discount_price: "0.00",
        status: true,
        total_stock: 100,
        total_sold: 25,
        available_stock: 75,
        created_at: "2025-11-27T10:27:46.696Z",
        updated_at: "2025-12-04T06:08:41.536Z",
        is_variable: false,
      },
      warehouse_id: 1,
      quantity: 1,
      unit_price: "35000.00",
      discount: "0.00",
      tax: "0.00",
      line_total: "35000.00",
    },
  ],
  subtotal: "35000.00",
  discount: "5250.00",
  manual_discount: "0.00",
  group_discount: "0.00",
  tax: "0.00",
  total: "29750.00",
  paid_amount: "29750.00",
  payments: [
    {
      id: 1,
      method: "cash",
      amount: "29750.00",
      account_code: "ASSET.CASH",
      reference: undefined,
      created_at: "2025-12-04T08:47:51.708Z",
    },
  ],
  customer: {
    id: 1,
    customer_code: "CUS-001",
    name: "Mahabub Hossain",
    phone: "017118552202",
    email: "palashmahabub@gmail.com",

    status: true,
    reward_points: "4763.00",
    account_id: 47,
    group_id: 1,
    created_at: "2025-11-27T10:29:46.911Z",
    updated_at: "2025-12-04T09:09:45.774Z",
  },
  created_by: {
    id: 5,
    username: "superadmin",
    email: "superadmin@gmail.com",
    full_name: "Super Admin",
    phone: "",
    roles: [
      {
        id: 1,
        name: "superadmin",
        description: "All Access",
      },
    ],
    status: "active",
    last_login_at: "2025-12-05T04:46:51.987Z",
    created_at: "2025-11-17T18:36:37.027Z",
    updated_at: "2025-12-04T22:47:13.846Z",
  },
  branch: {
    id: 1,
    code: "BR-001",
    name: "Main Branch",
    address: "123 Street, Dhaka",
    phone: "+8801712345678",
    email: "branch@example.com",
    is_active: true,
    created_at: "2025-11-25T21:51:19.508Z",
    updated_at: "2025-12-03T08:25:15.925Z",
  },
  served_by: {
    id: 5,
    username: "superadmin",
    email: "superadmin@gmail.com",
    full_name: "Super Admin",
    phone: "",
    roles: [
      {
        id: 1,
        name: "superadmin",
        description: "All Access",
      },
    ],
    status: "active",
    last_login_at: "2025-12-05T04:46:51.987Z",
    created_at: "2025-11-17T18:36:37.027Z",
    updated_at: "2025-12-04T22:47:13.846Z",
  },
  created_at: "2025-12-04T08:47:51.708Z",
  updated_at: "2025-12-04T08:47:51.708Z",
};

interface A4ReceiptPreviewProps {
  receipt: ReceiptPreviewData;
  saleData: SaleData;
}

const A4ReceiptPreview: React.FC<A4ReceiptPreviewProps> = ({
  receipt,
  saleData,
}) => {
  const currencySymbol = receipt.currency_symbol ?? "";

  return (
    <div className="flex justify-center">
      <div className="w-full flex justify-center overflow-auto">
        {/* A4 Paper */}
        <div
          className="bg-white shadow-lg border border-gray-300 rounded-sm p-10"
          style={{
            width: "210mm",
            minHeight: "297mm",
          }}
        >
          <div className="flex flex-col h-full text-gray-900 text-sm">
            {/* Header */}
            <div className="text-center mb-8 grid grid-cols-2 gap-4">
              {receipt.logo_url && (
                <img
                  src={receipt.logo_url}
                  alt="Business Logo"
                  className="h-20 mx-auto mb-4 object-contain"
                />
              )}
              <div className="col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {receipt.receipt_header || "ORIGINAL RECEIPT"}
                </h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {receipt.business_name || "Your Business Name"}
                </h3>

                {receipt.address && (
                  <p className="text-sm text-gray-600 mb-2">
                    {receipt.address}
                  </p>
                )}

                <div className="flex justify-center gap-6 mb-2 text-sm text-gray-500">
                  {receipt.phone && <span>{receipt.phone}</span>}
                  {receipt.email && <span>{receipt.email}</span>}
                  {receipt.website && <span>{receipt.website}</span>}
                </div>

                {receipt.tax_registration && (
                  <p className="text-xs text-gray-500 mb-1">
                    Tax Reg: {receipt.tax_registration}
                  </p>
                )}
                {receipt.company_registration && (
                  <p className="text-xs text-gray-500">
                    Co. Reg: {receipt.company_registration}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-300 mb-6" />

            {/* Invoice Info */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Invoice Information
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Invoice #: {saleData.invoice_no}</p>
                    <p>
                      Date:{" "}
                      {new Date(
                        saleData.created_at || new Date().toISOString()
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      Time:{" "}
                      {new Date(
                        saleData.created_at || new Date().toISOString()
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-sm mb-2">
                    Branch &amp; Staff
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Branch: {saleData.branch?.name}</p>
                    <p>Served by: {saleData.served_by?.full_name}</p>
                  </div>
                </div>
              </div>

              {receipt.include_customer_details && saleData.customer && (
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-sm mb-2">
                    Customer Details
                  </h4>
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {saleData.customer.name}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {saleData.customer.phone}
                      </p>
                    </div>
                    <div>
                      {saleData.customer.email && (
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {saleData.customer.email}
                        </p>
                      )}
                      {/* {saleData.customer.address && (
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {saleData.customer.address}
                        </p>
                      )} */}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="mb-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-800">
                    <TableCell
                      isHeader
                      className="text-left py-3 text-sm font-semibold"
                    >
                      Item
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-center py-3 text-sm font-semibold w-16"
                    >
                      Qty
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-right py-3 text-sm font-semibold w-24"
                    >
                      Price
                    </TableCell>
                    <TableCell
                      isHeader
                      className="text-right py-3 text-sm font-semibold w-24"
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleData.items.map((item, index) => (
                    <TableRow key={index} className="border-b border-gray-200">
                      <TableCell className="py-3 text-sm">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            SKU: {item.product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 text-sm">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right py-3 text-sm">
                        {currencySymbol}
                        {item.unit_price}
                      </TableCell>
                      <TableCell className="text-right py-3 text-sm font-medium">
                        {currencySymbol}
                        {item.line_total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>
                  {currencySymbol}
                  {saleData.subtotal}
                </span>
              </div>

              {parseFloat(saleData.discount || "0") > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>
                    -{currencySymbol}
                    {saleData.discount}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>
                  {currencySymbol}
                  {saleData.tax}
                </span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t-2 border-gray-800 pt-2 mt-2">
                <span>TOTAL:</span>
                <span>
                  {currencySymbol}
                  {saleData.total}
                </span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>Paid Amount:</span>
                <span>
                  {currencySymbol}
                  {saleData.paid_amount}
                </span>
              </div>
            </div>

            {/* Payment */}
            <div className="text-center mb-6 bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Payment Method:</span>{" "}
                {saleData.payments[0]?.method}
              </p>
            </div>

            {/* QR Code */}
            {receipt.include_qr_code && (
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {receipt.qr_code_type === "business_info"
                        ? "Business Information"
                        : receipt.qr_code_type === "invoice_info"
                        ? "Invoice Details"
                        : receipt.qr_code_type === "custom"
                        ? "Custom QR Code"
                        : "QR Code"}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      {/* QR Code pattern - simplified representation */}
                      <rect x="10" y="10" width="80" height="80" fill="black" />
                      <rect x="15" y="15" width="70" height="70" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="black" />
                      <rect x="35" y="20" width="10" height="10" fill="black" />
                      <rect x="50" y="20" width="10" height="10" fill="black" />
                      <rect x="65" y="20" width="10" height="10" fill="black" />
                      <rect x="20" y="35" width="10" height="10" fill="black" />
                      <rect x="35" y="35" width="10" height="10" fill="white" />
                      <rect x="50" y="35" width="10" height="10" fill="black" />
                      <rect x="65" y="35" width="10" height="10" fill="black" />
                      <rect x="20" y="50" width="10" height="10" fill="black" />
                      <rect x="35" y="50" width="10" height="10" fill="black" />
                      <rect x="50" y="50" width="10" height="10" fill="white" />
                      <rect x="65" y="50" width="10" height="10" fill="black" />
                      <rect x="20" y="65" width="10" height="10" fill="black" />
                      <rect x="35" y="65" width="10" height="10" fill="black" />
                      <rect x="50" y="65" width="10" height="10" fill="black" />
                      <rect x="65" y="65" width="10" height="10" fill="black" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {saleData.invoice_no}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-auto">
              <div className="text-center">
                <p className="text-base font-bold text-gray-800 mb-2">
                  Thank you for your purchase!
                </p>
                <p className="text-sm text-gray-600 mb-4">Please visit again</p>
                {receipt.footer_text && (
                  <p className="text-xs text-gray-500 italic">
                    {receipt.footer_text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🔹 Main Receipt Settings Page
 */
const ReceiptSettings: React.FC = () => {
  const { data: receiptData, isLoading, refetch } = useGetReceiptPreviewQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return <Loading message="Loading Receipt Settings" />;
  }

  const receipt = (receiptData?.data || {}) as ReceiptPreviewData;

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = (
        <ReceiptPDF receiptSettings={receipt} saleData={sampleSaleData} />
      );
      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${sampleSaleData.invoice_no}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      {/* 🔹 Page SEO Meta */}
      <PageMeta
        title="Receipt Settings"
        description="Configure receipt appearance and preview settings"
      />

      {/* 🔹 Breadcrumb */}
      <PageBreadcrumb pageTitle="Receipt Settings" />

      {/* 🔹 Page Container */}
      <div className="flex flex-col gap-5 min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Receipt Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Preview and configure how your receipts will appear
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownloadPDF} variant="outline" type="button">
              Download Sample PDF
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              type="button"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Preview"}
            </Button>
          </div>
        </div>

        {/* 🔹 Receipt Preview (A4) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <A4ReceiptPreview receipt={receipt} saleData={sampleSaleData} />
        </div>

        {/* 🔹 Settings Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Current Receipt Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Business Name
                </span>
                <span className="text-sm text-gray-900">
                  {receipt.business_name || "Not set"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Currency
                </span>
                <span className="text-sm text-gray-900">
                  {receipt.currency} ({receipt.currency_symbol})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Receipt Header
                </span>
                <span className="text-sm text-gray-900">
                  {receipt.receipt_header || "Default"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Footer Text
                </span>
                <span className="text-sm text-gray-900">
                  {receipt.footer_text || "Not set"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Include QR Code
                </span>
                <span
                  className={`text-sm ${
                    receipt.include_qr_code ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {receipt.include_qr_code ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* QR Code Type - only show if QR is enabled */}
              {receipt.include_qr_code && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    QR Code Type
                  </span>
                  <span className="text-sm text-gray-600 capitalize">
                    {receipt.qr_code_type === "business_info"
                      ? "Business Information"
                      : receipt.qr_code_type === "invoice_info"
                      ? "Invoice Details"
                      : receipt.qr_code_type === "custom"
                      ? "Custom"
                      : "Unknown"}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Customer Details
                </span>
                <span
                  className={`text-sm ${
                    receipt.include_customer_details
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {receipt.include_customer_details ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <span className="text-sm text-gray-900">
                  {receipt.email || "Not set"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Phone</span>
                <span className="text-sm text-gray-900">
                  {receipt.phone || "Not set"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> To modify these settings, go to Business
              Settings and update the Receipt Settings section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptSettings;
