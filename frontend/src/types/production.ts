import { Warehouse } from "./branch";
import { BaseEntity, Brand } from "./index";

// Production Order Status
export enum ProductionOrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Production Order Priority
export enum ProductionOrderPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

// Production Item Status
export enum ProductionItemStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Production Log Types
export enum ProductionLogType {
  ORDER_CREATED = "order_created",
  STATUS_CHANGED = "status_changed",
  ITEM_UPDATED = "item_updated",
  PRODUCTION_STARTED = "production_started",
  PRODUCTION_COMPLETED = "production_completed",
  PRODUCTION_HALTED = "production_halted",
  QUALITY_CHECK = "quality_check",
}

/**
 * Production Order Metadata
 * Contains additional information about production order state changes and quality control
 */
export interface ProductionMetadata {
  status_changed_at?: string;
  status_change_reason?: string;
  quality_check_passed?: boolean;
  defect_reason?: string;
  production_notes?: string;
}

// Production Order Item
export interface ProductionOrderItem extends BaseEntity {
  production_order_id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
  };
  planned_quantity: number;
  actual_quantity: number;
  good_quantity: number;
  defective_quantity: number;
  unit_cost: number;
  estimated_cost: number;
  actual_cost: number;
  batch_number?: string;
  expiry_date?: string | null;
  notes?: string;
  status: ProductionItemStatus;
  created_at: string;
  updated_at: string;
}

// Production Order Summary
export interface ProductionOrderSummary {
  total_planned_quantity: number;
  total_actual_quantity: number;
  total_good_quantity: number;
  total_defective_quantity: number;
  total_estimated_cost: number;
  total_actual_cost: number;
}

// Production Order Log
export interface ProductionOrderLog extends BaseEntity {
  production_order_id: number;
  log_type: ProductionLogType;
  message: string;
  metadata?: ProductionMetadata;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
}

// Main Production Order interface
export interface ProductionOrder extends BaseEntity {
  order_number: string;
  title: string;
  description?: string;
  brand_id: number;
  brand: Brand;
  warehouse_id: number;
  warehouse: Warehouse;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  planned_start_date: string;
  actual_start_date?: string | null;
  planned_completion_date: string;
  actual_completion_date?: string | null;
  notes?: string;
  items: ProductionOrderItem[];
  summary: ProductionOrderSummary;
  created_at: string;
  updated_at: string;
}

// Production Order Statistics
export interface ProductionOrderStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  onHoldOrders: number;
}

// DTOs for API requests
export interface CreateProductionOrderDto {
  title: string;
  description?: string;
  brand_id: number;
  warehouse_id: number;
  priority: ProductionOrderPriority;
  planned_start_date: string;
  planned_completion_date: string;
  notes?: string;
  items: {
    product_id: number;
    planned_quantity: number;
    estimated_unit_cost: number;
    notes?: string;
  }[];
}

export interface UpdateProductionOrderDto {
  title?: string;
  description?: string;
  brand_id?: number;
  warehouse_id?: number;
  status?: ProductionOrderStatus;
  priority?: ProductionOrderPriority;
  planned_start_date?: string;
  planned_completion_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  notes?: string;
  items?: {
    id?: number;
    product_id?: number;
    planned_quantity?: number;
    actual_quantity?: number;
    good_quantity?: number;
    defective_quantity?: number;
    actual_cost?: number;
    batch_number?: string;
    expiry_date?: string;
    notes?: string;
    status?: ProductionItemStatus;
  }[];
}

export interface ProductionQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductionOrderStatus;
  priority?: ProductionOrderPriority;
  brand_id?: number;
  warehouse_id?: number;
  start_date?: string;
  end_date?: string;
}

// API Payload interfaces
export interface CreateProductionOrderPayload
  extends CreateProductionOrderDto {}
export interface UpdateProductionOrderPayload {
  id: string | number;
  body: UpdateProductionOrderDto;
}
export interface ProductionFilters extends ProductionQueryDto {}

// API Response interfaces
export interface ProductionOrderListResponse {
  data: ProductionOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductionOrderDetailResponse {
  data: ProductionOrder;
}

export interface ProductionOrderStatsResponse {
  data: ProductionOrderStats;
}

export interface ProductionOrderLogsResponse {
  data: ProductionOrderLog[];
}
