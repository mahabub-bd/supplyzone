import { InvoiceBaseDto } from '../dto/invoice-base.dto';

export function mapQuotationToInvoice(quotation: any): InvoiceBaseDto {
  // Debug logging to verify data structure
  console.log('Quotation data in mapper:', JSON.stringify(quotation, null, 2));

  const result = {
    type: 'quotation' as const,
    document_no: quotation.quotation_no || 'N/A',
    document_date: quotation.created_at?.toString() || new Date().toISOString(),
    valid_until: quotation.valid_until?.toString() || '',

    party: quotation.customer ? {
      name: quotation.customer.name || 'N/A',
      phone: quotation.customer.phone || '',
      email: quotation.customer.email || '',
      address: quotation.customer.address || '',
    } : undefined,

    items: Array.isArray(quotation.items) ? quotation.items.map((i: any) => ({
      name: i.product?.name || 'Unknown Product',
      sku: i.product?.sku || '',
      quantity: Number(i.quantity) || 0,
      unit_price: Number(i.unit_price) || Number(i.total_price) || 0,
      total: Number(i.net_price) || Number(i.total_price) || 0,
    })) : [],

    subtotal: Number(quotation.subtotal) || 0,
    discount: Number(quotation.discount) || 0,
    tax: Number(quotation.tax) || 0,
    total: Number(quotation.total) || 0,

    // Quotations typically don't have payments, but keeping the structure consistent
    payments: [],

    notes: quotation.notes || quotation.terms_and_conditions || '',
  };

  console.log('Mapped quotation invoice data:', JSON.stringify(result, null, 2));
  return result;
}
