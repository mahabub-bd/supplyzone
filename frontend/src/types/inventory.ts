import { BaseEntity } from ".";
import { Warehouse } from "./branch";
import { Product } from "./product";
import { UserBasic } from "./user";

export type StockMovementType = "IN" | "OUT" | "ADJUST" | "TRANSFER";
export type Inventory = ProductInventory[];
export interface StockMovement extends BaseEntity {
  product_id: number;
  product: Product;
  warehouse_id: number;
  warehouse: Warehouse;
  type: StockMovementType;
  quantity: number;
  note?: string;
  from_warehouse_id?: number;
  from_warehouse?: Warehouse;
  to_warehouse_id?: number;
  to_warehouse?: Warehouse;
  reference_type?: string;
  reference_id?: number;
  created_by?: UserBasic;
}
export interface InventoryItem extends BaseEntity {
  product: Product;
  product_id: number;
  warehouse: Warehouse;
  warehouse_id: number;
  batch_no: string;
  quantity: number;
  sold_quantity: number;
  expiry_date: string | null;
  purchase_price: string;
  supplier: string;
  purchase_item_id: number;
}

export interface WarehouseInventory {
  id: number;
  warehouse_id: number;
  warehouse: Warehouse;
  purchased_quantity: number;
  sold_quantity: number;
  remaining_quantity: number;
  batch_no: string;
  purchase_value: number;
  sale_value: number;
}

export interface ProductWiseInventoryItem {
  product_id: number;
  product: Product;
  total_stock: number;
  total_sold_quantity: number;
  remaining_stock: number;
  purchase_value: number;
  sale_value: number;
  warehouses: WarehouseInventory[];
}

export interface ProductBatchWise extends BaseEntity {
  product_id: number;
  product: Product;
  warehouse_id: number;
  warehouse: Warehouse;
  batch_no: string;
  quantity: number;
  sold_quantity: number;
  expiry_date: string | null;
  purchase_price: string;
  supplier: string;
  purchase_item_id: number;
  remaining_quantity: number;
  purchase_value: number;
  sale_value: number;
  potential_profit: number;
}
export interface ProductInventory extends BaseEntity {
  product_id: number;
  warehouse_id: number;
  warehouse?: Warehouse;
  batch_no: string;
  quantity: number;
  sold_quantity: number;
  expiry_date?: string | null;
  purchase_price: string;
  supplier?: string;
  purchase_item_id?: number;
}

export interface StockByWarehouse {
  warehouse: Warehouse;
  batch_no: string;
  quantity: number;
  sold_quantity: number;
  available_quantity: number;
  purchase_price: string;
  expiry_date?: string | null;
}

export interface GetStockMovementsParams {
  product_id?: number;
  warehouse_id?: number;
  type?: StockMovementType;
}

export interface InventoryJournalEntry {
  id: number;
  date: string;
  product: {
    id: number;
    name: string;
    sku: string;
    image?: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  type: StockMovementType;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  created_by?: {
    id: number;
    name: string;
  };
}

export interface GetInventoryJournalParams {
  product_id?: number;
  warehouse_id?: number;
  start_date?: string;
  end_date?: string;
}
