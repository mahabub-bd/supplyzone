import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ReceiptPreviewData } from "../../types/settings";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

interface ThermalReceiptItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface ThermalReceiptData {
  invoice_no?: string;
  items: ThermalReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  due_amount: number;
  customer_name: string;
  customer_phone?: string;
  payment_method?: string;
  branch_name?: string;
  served_by?: string;
  created_at: string;
}

interface ThermalReceipt58mmProps {
  receiptSettings: ReceiptPreviewData;
  saleData: ThermalReceiptData;
  onClose?: () => void;
}

const ThermalReceipt58mm: React.FC<ThermalReceipt58mmProps> = ({
  receiptSettings,
  saleData,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => {
      onClose?.();
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const currencySymbol = receiptSettings.currency_symbol || "৳";

  return (
    <Modal
      isOpen={true}
      onClose={() => onClose?.()}
      title="Receipt Preview"
      description="Preview your thermal receipt before printing"
      className="max-w-lg"
      showCloseButton={true}
    >
      <div className="flex flex-col gap-4">
        {/* Receipt Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <div
            ref={receiptRef}
            className="bg-white mx-auto"
            style={{
              width: "58mm",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "1.4",
            }}
          >
            {/* Thermal Printer Styles */}
            <style>
              {`
                @media print {
                  @page {
                    size: 58mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .thermal-receipt {
                    width: 58mm;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
                .thermal-receipt {
                  padding: 8px;
                }
                .thermal-header {
                  text-align: center;
                  margin-bottom: 8px;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 8px;
                }
                .thermal-title {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 4px 0;
                }
                .thermal-business {
                  font-size: 14px;
                  font-weight: bold;
                  margin: 2px 0;
                }
                .thermal-info {
                  font-size: 11px;
                  margin: 2px 0;
                }
                .thermal-section {
                  margin: 8px 0;
                  padding: 6px 0;
                  border-bottom: 1px dashed #000;
                }
                .thermal-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 2px 0;
                }
                .thermal-item {
                  margin: 4px 0;
                }
                .thermal-total {
                  font-weight: bold;
                  font-size: 14px;
                  margin: 4px 0;
                  border-top: 1px solid #000;
                  padding-top: 4px;
                }
                .thermal-footer {
                  text-align: center;
                  margin-top: 8px;
                  font-size: 11px;
                  border-top: 1px dashed #000;
                  padding-top: 8px;
                }
              `}
            </style>

            <div className="thermal-receipt">
              {/* Header */}
              <div className="thermal-header">
                {receiptSettings.business_name && (
                  <div className="thermal-business">
                    {receiptSettings.business_name}
                  </div>
                )}
                {receiptSettings.address && (
                  <div className="thermal-info">{receiptSettings.address}</div>
                )}
                {receiptSettings.phone && (
                  <div className="thermal-info">Tel: {receiptSettings.phone}</div>
                )}
                {receiptSettings.email && (
                  <div className="thermal-info">{receiptSettings.email}</div>
                )}
                {receiptSettings.tax_registration && (
                  <div className="thermal-info">
                    Tax: {receiptSettings.tax_registration}
                  </div>
                )}
              </div>

              {/* Receipt Title */}
              <div className="thermal-title" style={{ textAlign: "center" }}>
                {receiptSettings.receipt_header || "SALES RECEIPT"}
              </div>

              {/* Invoice Info */}
              <div className="thermal-section">
                {saleData.invoice_no && (
                  <div className="thermal-row">
                    <span>Invoice:</span>
                    <span>{saleData.invoice_no}</span>
                  </div>
                )}
                <div className="thermal-row">
                  <span>Date:</span>
                  <span>{formatDate(saleData.created_at)}</span>
                </div>
                <div className="thermal-row">
                  <span>Time:</span>
                  <span>{formatTime(saleData.created_at)}</span>
                </div>
                {saleData.branch_name && (
                  <div className="thermal-row">
                    <span>Branch:</span>
                    <span>{saleData.branch_name}</span>
                  </div>
                )}
                {saleData.served_by && (
                  <div className="thermal-row">
                    <span>Cashier:</span>
                    <span>{saleData.served_by}</span>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              {receiptSettings.include_customer_details && (
                <div className="thermal-section">
                  <div className="thermal-row">
                    <span>Customer:</span>
                    <span>{saleData.customer_name}</span>
                  </div>
                  {saleData.customer_phone && (
                    <div className="thermal-row">
                      <span>Phone:</span>
                      <span>{saleData.customer_phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="thermal-section">
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  ITEMS
                </div>
                {saleData.items.map((item, index) => (
                  <div key={index} className="thermal-item">
                    <div style={{ fontWeight: "bold" }}>
                      {item.product_name}
                    </div>
                    <div className="thermal-row" style={{ fontSize: "11px" }}>
                      <span>
                        {item.quantity} x {currencySymbol}
                        {item.unit_price.toFixed(2)}
                      </span>
                      <span style={{ fontWeight: "bold" }}>
                        {currencySymbol}
                        {item.line_total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="thermal-section">
                <div className="thermal-row">
                  <span>Subtotal:</span>
                  <span>
                    {currencySymbol}
                    {saleData.subtotal.toFixed(2)}
                  </span>
                </div>

                {saleData.discount > 0 && (
                  <div className="thermal-row">
                    <span>Discount:</span>
                    <span>
                      -{currencySymbol}
                      {saleData.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                {saleData.tax > 0 && (
                  <div className="thermal-row">
                    <span>Tax:</span>
                    <span>
                      {currencySymbol}
                      {saleData.tax.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="thermal-total thermal-row">
                  <span>TOTAL:</span>
                  <span>
                    {currencySymbol}
                    {saleData.total.toFixed(2)}
                  </span>
                </div>

                <div className="thermal-row" style={{ fontWeight: "bold" }}>
                  <span>Paid:</span>
                  <span>
                    {currencySymbol}
                    {saleData.paid_amount.toFixed(2)}
                  </span>
                </div>

                {saleData.due_amount > 0 && (
                  <div className="thermal-row" style={{ fontWeight: "bold" }}>
                    <span>Due:</span>
                    <span>
                      {currencySymbol}
                      {saleData.due_amount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              {saleData.payment_method && (
                <div className="thermal-section">
                  <div className="thermal-row">
                    <span>Payment:</span>
                    <span style={{ textTransform: "uppercase" }}>
                      {saleData.payment_method}
                    </span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="thermal-footer">
                <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                  Thank You!
                </div>
                <div>Please Visit Again</div>
                {receiptSettings.footer_text && (
                  <div style={{ marginTop: "4px", fontSize: "10px" }}>
                    {receiptSettings.footer_text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button onClick={handlePrint} className="flex-1" type="button">
            Print Receipt
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            type="button"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ThermalReceipt58mm;
