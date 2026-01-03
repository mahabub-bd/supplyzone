import { InvoiceBaseDto } from '../dto/invoice-base.dto';

export function mapSaleToInvoice(sale: any): InvoiceBaseDto {
  console.log('Sale data in mapper:', JSON.stringify(sale, null, 2));

  const items = Array.isArray(sale.items)
    ? sale.items.map((i: any) => ({
        name: i.product?.name || 'Unknown Product',
        sku: i.product?.sku || '',
        quantity: Number(i.quantity) || 0,
        unit_price: Number(i.unit_price) || 0,
        total: Number(i.line_total) || 0, // trust backend
      }))
    : [];

  const subtotal = Number(sale.subtotal) || 0;

  // ✅ IMPORTANT: combine all discounts
  const discount =
    (Number(sale.discount) || 0) +
    (Number(sale.manual_discount) || 0) +
    (Number(sale.group_discount) || 0);

  const tax = Number(sale.tax) || 0;
  const total = Number(sale.total) || 0;

  const payments = Array.isArray(sale.payments)
    ? sale.payments
        .filter((p: any) => Number(p.amount) > 0)
        .map((p: any) => ({
          method: p.method?.toUpperCase() || 'CASH',
          amount: Number(p.amount),
          reference: p.reference || undefined,
        }))
    : [];

  const result: InvoiceBaseDto = {
    type: 'sale',
    document_no: sale.invoice_no || 'N/A',
    document_date: sale.created_at || new Date().toISOString(),

    party: sale.customer
      ? {
          name: sale.customer.name || 'N/A',
          phone: sale.customer.phone || '',
          email: sale.customer.email || '',
          address: sale.customer.address || '',
          billing_address: sale.customer.billing_address ? {
            contact_name: sale.customer.billing_address.contact_name || '',
            phone: sale.customer.billing_address.phone || '',
            street: sale.customer.billing_address.street || '',
            city: sale.customer.billing_address.city || '',
            country: sale.customer.billing_address.country || '',
          } : undefined,
          shipping_address: sale.customer.shipping_address ? {
            contact_name: sale.customer.shipping_address.contact_name || '',
            phone: sale.customer.shipping_address.phone || '',
            street: sale.customer.shipping_address.street || '',
            city: sale.customer.shipping_address.city || '',
            country: sale.customer.shipping_address.country || '',
          } : undefined,
        }
      : undefined,

    items,
    subtotal,
    discount,
    tax,
    total,
    payments,

    notes: sale.notes || '',
    valid_until: sale.valid_until || '',
  };

  console.log('Mapped invoice data:', JSON.stringify(result, null, 2));
  return result;
}
