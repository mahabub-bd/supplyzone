import { BaseEntity, PaymentMethod } from ".";
import { Warehouse } from "./branch";
import { ProductBasic } from "./product";
import { Supplier } from "./supplier";
import { UserBasic } from "./user";
export type PurchaseStatus = "draft" | "ordered" | "received" | "cancelled";


export enum PurchaseOrderStatus {
  DRAFT = "draft",
  SENT = "sent",
  APPROVED = "approved",
  REJECTED = "rejected",
  PARTIAL_RECEIVED = "partial_received",
  FULLY_RECEIVED = "fully_received",
  CANCELLED = "cancelled",
  CLOSED = "closed",
}

export const PurchaseOrderStatusDescription = {
  [PurchaseOrderStatus.DRAFT]: {
    description: "Draft - Purchase Order is being prepared",
    color: "#gray",
    allowedTransitions: [
      PurchaseOrderStatus.SENT,
      PurchaseOrderStatus.CANCELLED,
    ],
  },
  [PurchaseOrderStatus.SENT]: {
    description: "Sent - Purchase Order sent to supplier",
    color: "#blue",
    allowedTransitions: [
      PurchaseOrderStatus.APPROVED,
      PurchaseOrderStatus.REJECTED,
      PurchaseOrderStatus.CANCELLED,
    ],
  },
  [PurchaseOrderStatus.APPROVED]: {
    description: "Approved - Purchase Order approved by supplier",
    color: "#green",
    allowedTransitions: [
      PurchaseOrderStatus.PARTIAL_RECEIVED,
      PurchaseOrderStatus.FULLY_RECEIVED,
      PurchaseOrderStatus.CANCELLED,
    ],
  },
  [PurchaseOrderStatus.REJECTED]: {
    description: "Rejected - Purchase Order rejected by supplier",
    color: "#red",
    allowedTransitions: [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.CANCELLED,
    ],
  },
  [PurchaseOrderStatus.PARTIAL_RECEIVED]: {
    description: "Partial Received - Some items have been received",
    color: "#orange",
    allowedTransitions: [
      PurchaseOrderStatus.FULLY_RECEIVED,
      PurchaseOrderStatus.CLOSED,
    ],
  },
  [PurchaseOrderStatus.FULLY_RECEIVED]: {
    description: "Fully Received - All items have been received",
    color: "#green",
    allowedTransitions: [PurchaseOrderStatus.CLOSED],
  },
  [PurchaseOrderStatus.CANCELLED]: {
    description: "Cancelled - Purchase Order has been cancelled",
    color: "#red",
    allowedTransitions: [], // Final state
  },
  [PurchaseOrderStatus.CLOSED]: {
    description: "Closed - Purchase Order completed and closed",
    color: "#purple",
    allowedTransitions: [], // Final state
  },
};

export const isPurchaseOrderStatusTransitionValid = (
  fromStatus: PurchaseOrderStatus,
  toStatus: PurchaseOrderStatus
): boolean => {
  if (fromStatus === toStatus) return false;

  const transitionRules: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
    [PurchaseOrderStatus.DRAFT]: [
      PurchaseOrderStatus.SENT,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.SENT]: [
      PurchaseOrderStatus.APPROVED,
      PurchaseOrderStatus.REJECTED,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.APPROVED]: [
      PurchaseOrderStatus.PARTIAL_RECEIVED,
      PurchaseOrderStatus.FULLY_RECEIVED,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.REJECTED]: [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.PARTIAL_RECEIVED]: [
      PurchaseOrderStatus.FULLY_RECEIVED,
      PurchaseOrderStatus.CLOSED,
    ],
    [PurchaseOrderStatus.FULLY_RECEIVED]: [PurchaseOrderStatus.CLOSED],
    [PurchaseOrderStatus.CANCELLED]: [],
    [PurchaseOrderStatus.CLOSED]: [],
  };

  return transitionRules[fromStatus].includes(toStatus);
};
export interface PurchaseItem {
  id: number;
  purchase_id: number;
  product_id: number;
  quantity: number;
  quantity_received?: number;
  unit_price: string;
  price: string;
  discount_per_unit?: string;
  tax_rate?: string;
  total_price?: string;
  product: ProductBasic | null;
}

export interface PaymentHistory extends BaseEntity {
  type: "supplier" | "customer";
  amount: number;
  method: PaymentMethod;
  note?: string;
  supplier_id?: number;
  purchase_id?: number;
}

export interface PurchaseMetadata {
  status_changed_at?: string;
  status_change_reason?: string;
}

export interface Purchase extends BaseEntity {
  po_no: string;
  supplier_id: number;
  supplier: Supplier;
  warehouse_id: number;
  warehouse: Warehouse;
  created_by?: UserBasic;
  created_by_id?: number;
  expected_delivery_date?: string | null;
  terms_and_conditions?: string | null;
  notes?: string | null;
  payment_term?: string;
  custom_payment_days?: number;
  status: PurchaseStatus | PurchaseOrderStatus;
  subtotal?: string;
  tax_amount?: string;
  discount_amount?: string;
  total_amount?: string;
  total: string;
  paid_amount: string;
  due_amount: string;
  sent_date?: string | null;
  approved_date?: string | null;
  received_date?: string | null;
  items: PurchaseItem[];
  payment_history: PaymentHistory[];
  metadata?: PurchaseMetadata;
  is_active?: boolean;
}

export interface PurchaseResponseData {
  purchases: Purchase[];
  total: number;
}

// Purchase API Payloads
export interface PurchaseItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  price?: number;
  discount_per_unit?: number;
  tax_rate?: number;
}

export interface CreatePurchasePayload {
  po_no?: string;
  supplier_id: number;
  warehouse_id: number;
  items: PurchaseItemPayload[];
  total?: number;
  status?: PurchaseStatus;
}

export interface UpdatePurchasePayload {
  id: string | number;
  body: {
    po_no?: string;
    supplier_id?: number;
    warehouse_id?: number;
    total?: number;
    status?: PurchaseStatus;
    items?: PurchaseItemPayload[];
  };
}

export interface UpdatePurchaseStatusPayload {
  id: string | number;
  body: {
    status: PurchaseOrderStatus;
    reason?: string;
  };
}

export interface ReceivePurchaseItemPayload {
  item_id: number;
  quantity: number;
  warehouse_id: number;
}

export interface ReceivePurchasePayload {
  id: string | number;
  body: {
    notes?: string;
    items: ReceivePurchaseItemPayload[];
  };
}

export interface PurchasePaymentPayload {
  id: string | number;
  body: {
    type: "supplier";
    supplier_id: number;
    purchase_id: number;
    payment_amount: number;
    method: PaymentMethod | string;
    note?: string;
  };
}
