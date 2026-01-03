import { BaseEntity } from "./index";

// Production Recipe Status
export enum ProductionRecipeStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

// Production Recipe Type
export enum ProductionRecipeType {
  MANUFACTURING = "manufacturing",
  ASSEMBLY = "assembly",
  FORMULATION = "formulation",
  MIXING = "mixing",
  PROCESSING = "processing",
  PACKAGING = "packaging",
}

// Material Type
export enum MaterialType {
  RAW_MATERIAL = "raw_material",
  COMPONENT = "component",
  SUBASSEMBLY = "subassembly",
  CONSUMABLE = "consumable",
  PACKAGING = "packaging",
  CHEMICAL = "chemical",
  ADDITIVE = "additive",
}

// Material Consumption Status
export enum MaterialConsumptionStatus {
  PLANNED = "planned",
  RESERVED = "reserved",
  CONSUMED = "consumed",
  WASTED = "wasted",
  RETURNED = "returned",
}

// Production Recipe Item interface
export interface ProductionRecipeItem extends BaseEntity {
  production_recipe_id: number;
  material_product_id: number;
  material_product: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    product_type?: string;
  };
  material_type: MaterialType;
  required_quantity: number;
  unit_id: number;
  consumption_rate: number;
  waste_percentage: number;
  description?: string;
  priority: number;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
}

// Production Recipe Summary
export interface ProductionRecipeSummary {
  total_material_cost: number;
  total_materials: number;
  optional_materials: number;
  required_materials: number;
  total_required_quantity: number;
  average_waste_percentage: number;
  material_types: MaterialType[];
  estimated_production_time: number;
  yield_percentage?: number;
}

// Production Recipe interface
export interface ProductionRecipe extends BaseEntity {
  name: string;
  recipe_code?: string;
  finished_product_id: number;
  finished_product: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
  };
  description?: string;
  standard_quantity: number;
  unit_id: number;
  estimated_time_minutes: number;
  yield_percentage?: number;
  recipe_items: ProductionRecipeItem[];
  summary: ProductionRecipeSummary;
  created_at: string;
  updated_at: string;
}

// Inventory Batch interface
export interface InventoryBatch {
  id: number;
  batch_no: string;
  product_id: number;
  product: {
    id: number;
    name: string;
    sku: string;
  };
  quantity: number;
  available_quantity: number;
  unit_cost: number;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

// Material Consumption interface
export interface MaterialConsumption extends BaseEntity {
  production_order_id: number;
  production_order: {
    id: number;
    order_number: string;
    title: string;
  };
  production_order_item_id: number;
  production_order_item: {
    id: number;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  };
  recipe_item_id: number;
  recipe_item: {
    id: number;
    material_product: {
      id: number;
      name: string;
      sku: string;
    };
    material_type: MaterialType;
  };
  inventory_batch_id: number;
  inventory_batch: InventoryBatch;
  planned_quantity: number;
  actual_quantity: number;
  wasted_quantity: number;
  unit_cost: number;
  total_cost: number;
  status: MaterialConsumptionStatus;
  consumption_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Material Requirements Calculation interface
export interface MaterialRequirementCalculation {
  recipe_id: number;
  recipe_code: string;
  recipe_name: string;
  standard_quantity: number;
  requested_quantity: number;
  multiplier: number;
  total_estimated_cost: number;
  material_requirements: {
    material_product_id: number;
    material_name: string;
    material_sku: string;
    material_type: MaterialType;
    required_quantity: number;
    unit_of_measure: string;
    estimated_cost: number;
    waste_percentage: number;
    total_with_waste: number;
    is_optional: boolean;
    is_substitutable: boolean;
    inventory_availability?: {
      total_available: number;
      can_fulfill: boolean;
      shortage: number;
    };
  }[];
}

// DTOs for API requests
export interface CreateProductionRecipeDto {
  name: string;
  recipe_code?: string;
  finished_product_id: number;
  description?: string;
  standard_quantity: number;
  unit_id: number;
  estimated_time_minutes?: number;
  yield_percentage?: number;
  recipe_items: {
    material_product_id: number;
    material_type: MaterialType;
    required_quantity: number;
    unit_id: number;
    consumption_rate?: number;
    waste_percentage?: number;
    description?: string;
    priority: number;
    is_optional: boolean;
  }[];
}

export interface UpdateProductionRecipeDto {
  name?: string;
  recipe_code?: string;
  finished_product_id?: number;
  description?: string;
  standard_quantity?: number;
  unit_id?: number;
  estimated_time_minutes?: number;
  yield_percentage?: number;
  recipe_items?: {
    id?: number;
    material_product_id?: number;
    material_type?: MaterialType;
    required_quantity?: number;
    unit_id?: number;
    consumption_rate?: number;
    waste_percentage?: number;
    description?: string;
    priority?: number;
    is_optional?: boolean;
    _delete?: boolean; // For removing items
  }[];
}

export interface RecipeQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductionRecipeStatus;
  recipe_type?: ProductionRecipeType;
  finished_product_id?: number;
  material_type?: MaterialType;
  include_inactive?: boolean;
}

export interface MaterialConsumptionQueryDto {
  page?: number;
  limit?: number;
  production_order_id?: number;
  material_product_id?: number;
  status?: MaterialConsumptionStatus;
  consumption_date_from?: string;
  consumption_date_to?: string;
}

// API Payload interfaces
export interface CreateProductionRecipePayload
  extends CreateProductionRecipeDto {}
export interface UpdateProductionRecipePayload {
  id: string | number;
  body: UpdateProductionRecipeDto;
}
export interface RecipeFilters extends RecipeQueryDto {}

export interface CalculateMaterialRequirementsParams {
  id: string | number;
  quantity: number;
}

// API Response interfaces
export interface ProductionRecipeListResponse {
  data: ProductionRecipe[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductionRecipeDetailResponse {
  data: ProductionRecipe;
}

export interface MaterialConsumptionListResponse {
  data: MaterialConsumption[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MaterialRequirementCalculationResponse {
  data: MaterialRequirementCalculation;
}

// Material type options
export const materialTypeOptions = [
  { id: MaterialType.RAW_MATERIAL, name: "Raw Material" },
  { id: MaterialType.COMPONENT, name: "Component" },
  { id: MaterialType.SUBASSEMBLY, name: "Subassembly" },
  { id: MaterialType.CONSUMABLE, name: "Consumable" },
  { id: MaterialType.PACKAGING, name: "Packaging" },
  { id: MaterialType.CHEMICAL, name: "Chemical" },
  { id: MaterialType.ADDITIVE, name: "Additive" },
];

// Recipe type options
export const recipeTypeOptions = [
  { id: ProductionRecipeType.MANUFACTURING, name: "Manufacturing" },
  { id: ProductionRecipeType.ASSEMBLY, name: "Assembly" },
  { id: ProductionRecipeType.FORMULATION, name: "Formulation" },
  { id: ProductionRecipeType.MIXING, name: "Mixing" },
  { id: ProductionRecipeType.PROCESSING, name: "Processing" },
  { id: ProductionRecipeType.PACKAGING, name: "Packaging" },
];
