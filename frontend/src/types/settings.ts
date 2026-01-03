import { Attachment, BaseEntity } from ".";

export interface SettingsData extends BaseEntity {
  business_name: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string;
  website: string | null;
  currency: string;
  currency_symbol: string;
  tax_registration: string | null;
  company_registration: string | null;
  default_tax_percentage: string;
  low_stock_threshold: string;
  logo_attachment_id: number | null;
  logo_attachment?: Attachment;
  footer_text: string | null;
  receipt_header: string | null;
  include_barcode: boolean;
  include_qr_code: boolean;
  qr_code_type: "business_info" | "invoice_info" | "custom";
  qr_code_custom_content: string | null;
  include_customer_details: boolean;
  enable_auto_backup: boolean;
  backup_retention_days: number;
  default_invoice_layout: string;
  show_product_images: boolean;
  show_product_skus: boolean;
  show_item_tax_details: boolean;
  show_payment_breakdown: boolean;
  invoice_paper_size: string;
  print_duplicate_copy: boolean;
  invoice_footer_message: string | null;
  use_thermal_printer: boolean;
}

export interface SettingsUpdateRequest {
  business_name?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
  currency?: string;
  currency_symbol?: string;
  tax_registration?: string;
  company_registration?: string;
  default_tax_percentage?: number;
  low_stock_threshold?: number;
  footer_text?: string;
  receipt_header?: string;
  include_barcode?: boolean;
  include_customer_details?: boolean;
  enable_auto_backup?: boolean;
  backup_retention_days?: number;
  default_invoice_layout?: string;
  show_product_images?: boolean;
  show_product_skus?: boolean;
  show_item_tax_details?: boolean;
  show_payment_breakdown?: boolean;
  invoice_paper_size?: string;
  print_duplicate_copy?: boolean;
  invoice_footer_message?: string;
  use_thermal_printer?: boolean;
}

export interface ReceiptPreviewData {
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  currency: string;
  currency_symbol: string;
  tax_registration: string | null;
  company_registration: string | null;
  footer_text: string | null;
  receipt_header: string | null;
  include_barcode: boolean;
  include_qr_code: boolean;
  qr_code_type: "business_info" | "invoice_info" | "custom";
  qr_code_custom_content: string | null;
  include_customer_details: boolean;
  logo_url: string;
  default_invoice_layout: string;
  show_product_images: boolean;
  show_product_skus: boolean;
  show_item_tax_details: boolean;
  show_payment_breakdown: boolean;
  invoice_paper_size: string;
  print_duplicate_copy: boolean;
  invoice_footer_message: string | null;
  use_thermal_printer: boolean;
}
