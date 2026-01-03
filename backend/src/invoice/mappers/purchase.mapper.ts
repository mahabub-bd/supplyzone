import { InvoiceBaseDto } from '../dto/invoice-base.dto';

export function mapPurchaseToInvoice(purchase: any): InvoiceBaseDto {
  // Debug logging to verify data structure
  console.log('Purchase data in mapper:', JSON.stringify(purchase, null, 2));

  const result = {
    type: 'purchase' as const,
    document_no: purchase.po_no || 'N/A',
    document_date: purchase.created_at?.toString() || new Date().toISOString(),

    party: purchase.supplier ? {
      name: purchase.supplier.name || 'N/A',
      phone: purchase.supplier.phone || '',
      email: purchase.supplier.email || '',
      address: purchase.supplier.address || '',
    } : undefined,

    items: Array.isArray(purchase.items) ? purchase.items.map((i: any) => ({
      name: i.product?.name || 'Unknown Product',
      sku: i.product?.sku || '',
      quantity: Number(i.quantity) || 0,
      unit_price: Number(i.unit_price) || Number(i.price) || 0,
      total: Number(i.total_price) || Number(i.price) || 0,
    })) : [],

    subtotal: Number(purchase.subtotal) || Number(purchase.total_amount) || 0,
    discount: Number(purchase.discount_amount) || 0,
    tax: Number(purchase.tax_amount) || 0,
    total: Number(purchase.total_amount) || Number(purchase.total) || 0,

    payments: Array.isArray(purchase.payment_history)
      ? purchase.payment_history
          .filter((p: any) => Number(p.amount) > 0)
          .map((p: any) => ({
            method: p.method || 'Unknown',
            amount: Number(p.amount) || 0,
            reference: p.note || p.reference,
          }))
      : [],

    notes: purchase.notes || purchase.terms_and_conditions || '',
    valid_until: purchase.expected_delivery_date || '',
  };

  console.log('Mapped purchase invoice data:', JSON.stringify(result, null, 2));
  return result;
}
