import {
  BaseEntity,


  PaginationParams,
  PaymentMethod,
} from ".";
import { BranchBasic } from "./branch";
import { CustomerBasic } from "./customer";
import { ProductBasic, Unit } from "./product";
import { UserBasic } from "./user";

export enum QuotationStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CONVERTED = "converted",
}

export const QuotationStatusDescription = {
  [QuotationStatus.DRAFT]: "Draft",
  [QuotationStatus.SENT]: "Sent",
  [QuotationStatus.ACCEPTED]: "Accepted",
  [QuotationStatus.REJECTED]: "Rejected",
  [QuotationStatus.EXPIRED]: "Expired",
  [QuotationStatus.CONVERTED]: "Converted",
};

export interface QuotationItem extends BaseEntity {
  productId: number;
  warehouseId: number;
  quantity: string;
  unit_price: string;
  total_price: string;
  discount_percentage: string;
  discount_amount: string;
  tax_percentage: string;
  tax_amount: string;
  net_price: string;
  notes?: string | null;

  product: ProductBasic;
  unit: Unit;
}

export interface CreateQuotationDto {
  items: {
    product_id: number;
    quantity: number;
    unit_price?: number;
    discount_percentage?: number;
  }[];
  discount_type?: "fixed" | "percentage";
  discount_value?: number;
  tax_percentage?: number;
  customer_id: number;
  quotation_no?: string;
  branch_id?: number;
  quotation_date?: string;
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  status?: QuotationStatus;
}

export interface UpdateQuotationDto {
  customer_id?: number;
  branch_id?: number;
  quotation_date?: string;
  valid_until?: string;
  status?: QuotationStatus;
  notes?: string;
  terms_and_conditions?: string;
  items?: {
    id?: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
  }[];
}

export interface Quotation extends BaseEntity {
  quotation_no: string;
  items: QuotationItem[];

  subtotal: string;
  discount: string;
  manual_discount: string;
  group_discount: string;
  tax: string;
  total: string;

  valid_until: string;
  terms_and_conditions?: string;
  notes?: string;

  status: QuotationStatus;

  customer: CustomerBasic;
  created_by: UserBasic;

  branch_id: number;
  branch: BranchBasic;
}
export interface UpdateQuotationStatusDto {
  status: QuotationStatus;
  reason?: string;
}

export interface ConvertToSaleDto {
  sale_date?: string;
  notes?: string;
  payment_method?: PaymentMethod;
  paid_amount?: number;
}

export interface GetQuotationsParams extends PaginationParams {
  status?: QuotationStatus;
  customer_id?: number;
  branch_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface CreateQuotationPayload {
  body: CreateQuotationDto;
}

export interface UpdateQuotationPayload {
  id: string | number;
  body: UpdateQuotationDto;
}

export interface UpdateQuotationStatusPayload {
  id: string | number;
  body: UpdateQuotationStatusDto;
}

export interface ConvertQuotationToSalePayload {
  id: string | number;
  body: ConvertToSaleDto;
}

export interface DailyQuotation {
  date: string;
  total: number;
  count: number;
}

export interface QuotationStatusBreakdown {
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  converted: number;
}

export interface QuotationAnalytics {
  totalQuotations: number;
  totalAmount: number;
  averageQuotationValue: number;
  conversionRate: number;
  statusBreakdown: QuotationStatusBreakdown;
  dailyQuotations: DailyQuotation[];
}
