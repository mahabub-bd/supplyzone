import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { ReceiptPreviewData } from "../../types/settings";

// Register fonts (you can use custom fonts if needed)
Font.register({
  family: "Helvetica",
  src: "https://fonts.googleapis.com/css2?family=Helvetica:wght@400;700&display=swap",
});

interface SaleData {
  invoice_no: string;
  items: Array<{
    product: {
      name: string;
      sku: string;
      barcode?: string;
    };
    quantity: number;
    unit_price: string;
    discount: string;
    tax: string;
    line_total: string;
  }>;
  subtotal: string;
  discount: string;
  manual_discount: string;
  group_discount: string;
  tax: string;
  total: string;
  paid_amount: string;
  payments: Array<{
    method: string;
    amount: string;
    reference?: string;
  }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
  };
  served_by: {
    full_name: string;
  };
  created_at: string;
}

interface ReceiptPDFProps {
  receiptSettings: ReceiptPreviewData;
  saleData: SaleData;
}

const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    fontFamily: "Helvetica",
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    alignSelf: "center",
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  businessInfo: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 11,
  },
  table: {
    width: "100%",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ccc",
    paddingVertical: 6,
  },
  colItem: {
    flex: 4,
    fontSize: 11,
  },
  colQty: {
    flex: 1,
    fontSize: 11,
    textAlign: "center",
  },
  colPrice: {
    flex: 1.5,
    fontSize: 11,
    textAlign: "right",
  },
  colTotal: {
    flex: 1.5,
    fontSize: 11,
    textAlign: "right",
    fontWeight: "bold",
  },
  totals: {
    marginTop: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    fontSize: 11,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTop: "1pt solid #000",
    fontWeight: "bold",
    fontSize: 14,
  },
  paymentInfo: {
    marginTop: 15,
    fontSize: 11,
  },
  footer: {
    marginTop: 30,
    borderTop: "1pt dashed #ccc",
    paddingTop: 20,
    textAlign: "center",
    fontSize: 11,
  },
  thankYou: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 10,
    color: "#666",
  },
  barcode: {
    width: 200,
    height: 50,
    alignSelf: "center",
    marginTop: 15,
    backgroundColor: "#000",
  },
});

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({
  receiptSettings,
  saleData,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {receiptSettings.logo_url && (
            <Image src={receiptSettings.logo_url} style={styles.logo} />
          )}

          <Text style={styles.businessName}>
            {receiptSettings.business_name || "Your Business Name"}
          </Text>

          {receiptSettings.address && (
            <Text style={styles.businessInfo}>{receiptSettings.address}</Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginTop: 5,
            }}
          >
            {receiptSettings.phone && (
              <Text style={styles.businessInfo}>{receiptSettings.phone}</Text>
            )}
            {receiptSettings.email && (
              <Text style={styles.businessInfo}>{receiptSettings.email}</Text>
            )}
          </View>

          {receiptSettings.website && (
            <Text style={styles.businessInfo}>{receiptSettings.website}</Text>
          )}

          {receiptSettings.tax_registration && (
            <Text style={styles.businessInfo}>
              Tax Reg: {receiptSettings.tax_registration}
            </Text>
          )}

          {receiptSettings.company_registration && (
            <Text style={styles.businessInfo}>
              Co. Reg: {receiptSettings.company_registration}
            </Text>
          )}
        </View>

        {/* Receipt Header */}
        <Text style={styles.headerText}>
          {receiptSettings.receipt_header || "ORIGINAL RECEIPT"}
        </Text>

        {/* Invoice Information */}
        <View style={styles.invoiceInfo}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              Invoice Information
            </Text>
            <Text>Invoice #: {saleData.invoice_no}</Text>
            <Text>Date: {formatDate(saleData.created_at)}</Text>
            <Text>Time: {formatTime(saleData.created_at)}</Text>
          </View>
          <View style={{ alignItems: "flex-end", flex: 1 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              Branch & Staff
            </Text>
            <Text>Branch: {saleData.branch.name}</Text>
            <Text>Served by: {saleData.served_by.full_name}</Text>
          </View>
        </View>

        {receiptSettings.include_customer_details && (
          <View style={styles.section}>
            <Text style={{ fontWeight: "bold", marginBottom: 8, fontSize: 13 }}>
              Customer Details
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1 }}>
                <Text>Name: {saleData.customer.name}</Text>
                <Text>Phone: {saleData.customer.phone}</Text>
                {saleData.customer.email && (
                  <Text>Email: {saleData.customer.email}</Text>
                )}
                {saleData.customer.address && (
                  <Text>Address: {saleData.customer.address}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {saleData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colItem}>
                {item.product.name}
                {item.product.sku && (
                  <Text style={{ fontSize: 8, color: "#666" }}>
                    SKU: {item.product.sku}
                  </Text>
                )}
              </Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {receiptSettings.currency_symbol}
                {item.unit_price}
              </Text>
              <Text style={styles.colTotal}>
                {receiptSettings.currency_symbol}
                {item.line_total}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>
              {receiptSettings.currency_symbol}
              {saleData.subtotal}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Discount:</Text>
            <Text>
              -{receiptSettings.currency_symbol}
              {saleData.discount}
            </Text>
          </View>

          {parseFloat(saleData.manual_discount) > 0 && (
            <View style={styles.totalRow}>
              <Text>Manual Discount:</Text>
              <Text>
                -{receiptSettings.currency_symbol}
                {saleData.manual_discount}
              </Text>
            </View>
          )}

          {parseFloat(saleData.group_discount) > 0 && (
            <View style={styles.totalRow}>
              <Text>Group Discount:</Text>
              <Text>
                -{receiptSettings.currency_symbol}
                {saleData.group_discount}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text>Tax:</Text>
            <Text>
              {receiptSettings.currency_symbol}
              {saleData.tax}
            </Text>
          </View>

          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>
              {receiptSettings.currency_symbol}
              {saleData.total}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Paid Amount:</Text>
            <Text>
              {receiptSettings.currency_symbol}
              {saleData.paid_amount}
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentInfo}>
          <Text>Payment Method: {saleData.payments[0]?.method}</Text>
          {saleData.payments[0]?.reference && (
            <Text>Reference: {saleData.payments[0].reference}</Text>
          )}
        </View>

        {/* Barcode placeholder - you would need a barcode library for actual barcode */}
        {receiptSettings.include_barcode && (
          <View style={styles.barcode}>
            {/* This is a placeholder - implement actual barcode generation */}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>Thank you for your purchase!</Text>
          <Text style={styles.footerText}>Please visit again</Text>

          {receiptSettings.footer_text && (
            <Text style={[styles.footerText, { marginTop: 10 }]}>
              {receiptSettings.footer_text}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;
