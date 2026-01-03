export interface InvoiceBaseDto {
  type: 'sale' | 'purchase' | 'quotation';

  document_no: string;
  document_date: string;

  party?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    billing_address?: {
      contact_name?: string;
      phone?: string;
      street: string;
      city: string;
      country: string;
    };
    shipping_address?: {
      contact_name?: string;
      phone?: string;
      street: string;
      city: string;
      country: string;
    };
  };

  items: {
    name: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  payments?: {
    method: string;
    amount: number;
    reference?: string;
  }[];

  notes?: string;
  valid_until?: string;
}
