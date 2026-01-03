import {
  Attachment,
  BaseEntity,
  BaseEntityWithStatus,
  Brand,
} from ".";
import { ProductInventory, StockByWarehouse } from "./inventory";
import { Supplier } from "./supplier";

export interface Unit {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateUnitRequest extends Partial<CreateUnitRequest> {
  id: number;
}

export interface Category extends BaseEntity {
  name: string;
  slug?: string | null;
  description?: string;
  status: boolean;
  category_id?: string;
  logo_attachment: Attachment;
  logo_attachment_id?: number;
}

export interface SubCategory extends Category {
  category_id: string;
}

export interface CategoryWithChildren extends Category {
  children?: SubCategory[];
}

export interface Tag extends BaseEntityWithStatus {
  name: string;
  slug?: string;
  description?: string | null;
}

export enum ProductType {
  RAW_MATERIAL = "raw_material",
  COMPONENT = "component",
  FINISHED_GOOD = "finished_good",
  RESALE = "resale",
  CONSUMABLE = "consumable",
  PACKAGING = "packaging",
  SERVICE = "service",
}

/**
 * Variable product option configuration
 */
export interface VariableOption {
  name: string;
  values: string[];
}

/**
 * Product variant for variable products
 */
export interface ProductVariant {
  id?: number;
  combination: Record<string, string>;
  sku: string;
  barcode?: string;
  selling_price: number;
  purchase_price: number;
  stock?: number;
}

/**
 * Variable options structure for products
 */
export interface VariableOptions {
  options: VariableOption[];
  variants?: ProductVariant[];
}

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  selling_price: string;
  purchase_price: string;
  discount_price?: string;
  status: boolean;
  product_type?: ProductType;
  brand?: Brand;
  category?: Category;
  subcategory?: SubCategory;
  unit?: Unit;
  supplier?: Supplier;
  tags?: Tag[];
  images?: Attachment[];
  origin?: string;
  expire_date?: string | null;
  is_variable: boolean;
  variable_options?: VariableOptions;
  parent_product_id?: number | null;
  inventories?: ProductInventory[];
  purchase_value?: number;
  sale_value?: number;
  total_stock: number;
  total_sold: number;
  available_stock: number;
  stock_by_warehouse?: StockByWarehouse[];
}

export interface ProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  selling_price: number;
  purchase_price: number;
  discount_price?: number;
  status?: boolean;
  product_type?: ProductType;
  brand_id?: number;
  category_id?: number;
  subcategory_id?: number;
  unit_id?: number;
  supplier_id?: number;
  tag_ids?: number[];
  image_ids?: number[];
  origin?: string;
  expire_date?: string | null;
}

export interface ProductBasic {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  selling_price: string;
  purchase_price: string;
  discount_price: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}
export interface UpdateProductPayload {
  id: string | number;
  body: ProductRequest;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: number;
  supplierId?: number;
  categoryId?: number;
  subcategoryId?: number;
  origin?: string;
  isVariable?: boolean;
  hasExpiry?: boolean;
  status?: boolean;
  product_type?: string;
  [key: string]: unknown;
}