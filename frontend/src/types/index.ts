// ============================================================================
// BASE ENTITIES
// ============================================================================

/**
 * Base entity interface with ID and timestamp fields
 * All database entities should extend this interface
 */
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Base entity with optional update timestamp
 * Used for entities where updated_at may not always be present
 */
export interface BaseEntityOptionalUpdate {
  id: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Base entity with status field
 * Used for entities that can be enabled/disabled
 */
export interface BaseEntityWithStatus extends BaseEntity {
  status: boolean;
}

/**
 * Base entity with code and name fields
 * Used for reference/lookup entities
 */
export interface BaseEntityWithCode {
  code: string;
  name: string;
}

/**
 * Timestamp fields only
 * Used for entities that only need timestamps without ID
 */
export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

/**
 * Soft delete capability
 * Add to entities that support soft deletion
 */
export interface SoftDeletable {
  deleted_at?: string | null;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export type PaymentMethod = "cash" | "bank";

export enum PaymentTerm {
  IMMEDIATE = "immediate",
  NET_7 = "net_7",
  NET_15 = "net_15",
  NET_30 = "net_30",
  NET_45 = "net_45",
  NET_60 = "net_60",
  NET_90 = "net_90",
  CUSTOM = "custom",
}

export const PaymentTermDescription = {
  [PaymentTerm.IMMEDIATE]: "Payment Due Immediately",
  [PaymentTerm.NET_7]: "Payment Due in 7 Days",
  [PaymentTerm.NET_15]: "Payment Due in 15 Days",
  [PaymentTerm.NET_30]: "Payment Due in 30 Days",
  [PaymentTerm.NET_45]: "Payment Due in 45 Days",
  [PaymentTerm.NET_60]: "Payment Due in 60 Days",
  [PaymentTerm.NET_90]: "Payment Due in 90 Days",
  [PaymentTerm.CUSTOM]: "Custom Payment Terms",
};

export type TransactionType =
  | "sale"
  | "cash_in"
  | "cash_out"
  | "opening_balance"
  | "closing_balance"
  | "adjustment";

// ============================================================================
// PAGINATION & API RESPONSES
// ============================================================================

/**
 * Pagination metadata returned by API
 * Contains information about total items and pages
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Pagination query parameters
 * Used for requesting paginated data from API
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Date range query parameters
 * Used for filtering data by date range
 */
export interface DateRangeParams {
  start_date: string;
  end_date: string;
}

/**
 * Standard API response wrapper
 * @template T - The type of data being returned
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Paginated API response format
 * Alternative pagination response structure
 * @template T - The type of items in the array
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Simple list response with optional metadata
 * @template T - The type of items in the data array
 */
export interface ListResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

// ============================================================================
// UTILITY PAYLOAD TYPES
// ============================================================================

/**
 * Generic create payload type
 * Removes ID and timestamp fields from entity for creation
 * @template T - The entity type
 */
export type CreatePayload<T> = Omit<T, "id" | "created_at" | "updated_at">;

/**
 * Generic update payload type
 * Makes all fields optional except ID for partial updates
 * @template T - The entity type
 */
export type UpdatePayload<T> = Partial<CreatePayload<T>> & { id: number };

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Attachment extends TimestampFields {
  id: string | number;
  file_name: string;
  url: string;
  mime_type?: string;
  size?: string | number;
  storage_type?: string;
  uploaded_by?: string | number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  logo_attachment?: Attachment | null;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  contact_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  country?: string;
}

// ============================================================================
// RE-EXPORTS FROM DOMAIN MODULES
// ============================================================================

// User & Auth
export * from "./role";
export * from "./user";

// Branch & Warehouse
export * from "./branch";

// HRM
export * from "./attendance";
export * from "./hrm";
export * from "./leave";
export * from "./payroll";

// Product Management
export * from "./manufacturer";
export * from "./product";

// Inventory
export * from "./inventory";

// Sales & Customers
export * from "./customer";
export * from "./quotation";
export * from "./sales";

// Purchase & Suppliers
export * from "./purchase";
export * from "./purchase-return";
export * from "./supplier";

// Production
export * from "./production";
export * from "./production-recipe";

// Financial
export * from "./accounts";
export * from "./cashregister";
export * from "./expenses";
export * from "./payment";

// POS
export * from "./pos";
export * from "./posPage";

// Reports & Analytics
export * from "./analytics";
export * from "./report";

// Settings & System
export * from "./backup";
export * from "./settings";

