import { z } from "zod";
import { Warehouse } from "./branch";
import { PaymentMethod as BasePaymentMethod } from "./index";

// Cart item interface (specific to POS page)
export interface CartItem {
  product_id: number;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  unit_price: number;
  available_stock: number;
  batch_no: string;
  product_image?: string;
}

// Product data interface (specific to POS page inventory)
export interface ProductData {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  selling_price: string;
  purchase_price: string;
  description?: string;
  discount_price?: string;
  status?: boolean;
  images?: Array<{
    id: number;
    file_name: string;
    url: string;
    mime_type?: string;
    size?: string | number;
    storage_type?: string;
    uploaded_by?: number;
    created_at: string;
    updated_at: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

// Product interface with inventory data (specific to POS page)
export interface POSProduct {
  product: ProductData;
  purchased_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
  batch_no: string;
  purchase_value: number;
  sale_value: number;
}

// Warehouse report interface (specific to POS page)
export interface WarehouseReport {
  warehouse_id: number;
  warehouse: Warehouse;
  total_stock: number;
  total_sold_quantity: number;
  remaining_stock: number;
  purchase_value: number;
  sale_value: number;
  products: POSProduct[];
}

// Extended product interface
export interface ExtendedProduct extends POSProduct {
  warehouse_id: number;
  warehouse_name: string;
}

// Form validation schema for opening cash register
export const openCashRegisterSchema = z.object({
  cash_register_id: z
    .number({
      message: "Please select a cash register",
    })
    .min(1, "Please select a valid cash register"),
  opening_balance: z
    .number()
    .min(0, "Opening balance cannot be negative")
    .optional(),
  notes: z.string().optional(),
});

export type OpenCashRegisterFormValues = z.infer<typeof openCashRegisterSchema>;

// Close counter form data type
export interface CloseCounterFormData {
  actual_amount: number;
  notes?: string;
}

// POS state management types
export type DiscountType = "fixed" | "percentage";
export type PaymentMethodExtended = BasePaymentMethod | "bkash";

// Sale receipt data type
export interface SaleReceiptData {
  invoice_no: string;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  due_amount: number;
  customer_name: string;
  customer_phone?: string;
  payment_method?: PaymentMethodExtended;
  branch_name: string;
  served_by: string;
  created_at: string;
}

// API payload types for POS operations
export interface CreatePosSalePayload {
  items: {
    product_id: number;
    warehouse_id: number;
    quantity: number;
    discount: number;
  }[];
  branch_id: number;
  customer_id: number;
  cash_register_id: number;
  discount_type: DiscountType;
  discount: number;
  tax_percentage: number;
  paid_amount: number;
  payment_method?: PaymentMethodExtended;
  account_code?: string;
}

// Cash register interface for POS
export interface POSCashRegister {
  id: number;
  register_code?: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "closed" | "open" | "maintenance";
  branch_id?: number;
  opening_balance: string;
  current_balance: string;
  expected_amount?: string | null;
  actual_amount?: string | null;
  variance?: string | null;
  opened_by?: {
    id: number;
    username: string;
    full_name: string;
  } | null;
  closed_by?: {
    id: number;
    username: string;
    full_name: string;
  } | null;
  opened_at?: string | null;
  closed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Warehouse interface for POS
export interface POSWarehouse {
  id: number;
  name: string;
  location?: string;
  address?: string;
  status?: boolean;
  created_at: string;
  updated_at: string;
}

// Customer interface for POS
export interface POSCustomer {
  id: number;
  name: string;
  customer_code: string;
  email: string;
  phone: string;
  status: boolean;
  account_id: number;
  group_id?: number;
  group?: {
    id: number;
    name: string;
    description?: string;
    discount_percentage?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  };
  reward_points?: number;
  created_at: string;
  updated_at: string;
}

// Account interface for POS
export interface POSAccount {
  id?: number;
  account_number: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  isCash: boolean;
  isBank: boolean;
  debit?: number;
  credit?: number;
  balance?: number;
}

// Receipt settings interface for POS
export interface POSReceiptSettings {
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
