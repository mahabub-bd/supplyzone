# Production System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Product Management](#product-management)
3. [Production Recipe System](#production-recipe-system)
4. [Production Flow](#production-flow)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Usage Examples](#usage-examples)
8. [Integration Guidelines](#integration-guidelines)

## Overview

The Production System is a comprehensive manufacturing and inventory management solution that integrates product catalog management, production recipe planning, and material consumption tracking. The system provides complete visibility from raw material procurement to finished goods production.

### Key Features
- **Product Type Categorization**: Distinguish between raw materials, components, finished goods, and resale items
- **Production Recipe Management**: Create and manage manufacturing recipes with material requirements
- **Material Consumption Tracking**: Track actual material usage during production
- **Cost Management**: Calculate production costs and material requirements
- **Inventory Integration**: Seamless integration with inventory and purchase modules

## Product Management

### Product Types

The system supports different product types to categorize inventory appropriately:

```typescript
enum ProductType {
  RAW_MATERIAL = 'raw_material',    // Raw materials for production
  COMPONENT = 'component',          // Components for assembly
  FINISHED_GOOD = 'finished_good',  // Products you manufacture
  RESALE = 'resale',               // Products purchased for resale
  CONSUMABLE = 'consumable',        // Consumables for operations
  PACKAGING = 'packaging',          // Packaging materials
  SERVICE = 'service',              // Services (if applicable)
}
```

### Product Entity Structure

```typescript
interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  selling_price: number;
  purchase_price: number;
  discount_price?: number;
  status: boolean;
  product_type?: ProductType;  // NEW: Product categorization
  brand?: Brand;
  category?: Category;
  subcategory?: SubCategory;
  unit?: Unit;
  supplier?: Supplier;
  tags?: Tag[];
  images?: Attachment[];
  origin?: string;
  expire_date?: Date;
  inventories: Inventory[];
  created_at: Date;
  updated_at: Date;
}
```

### Product Creation Example

```json
{
  "name": "Display Panel",
  "sku": "DP-S24-001",
  "product_type": "raw_material",
  "selling_price": 120.00,
  "purchase_price": 95.00,
  "description": "OLED display panel for smartphones",
  "brand_id": 1,
  "category_id": 2,
  "supplier_id": 1
}
```

## Production Recipe System

### Recipe Structure

A production recipe defines how to manufacture a finished product, including all required materials, quantities, and instructions.

#### Production Recipe Entity

```typescript
interface ProductionRecipe {
  id: number;
  name: string;
  recipe_code: string;
  finished_product_id: number;
  finished_product: Product;
  description?: string;
  version: string;
  recipe_type: RecipeType;
  status: RecipeStatus;
  standard_quantity: number;
  unit_of_measure: string;
  estimated_time_minutes?: number;
  instructions?: string;
  quality_requirements?: string;
  safety_notes?: string;
  yield_percentage?: number;
  effective_date?: Date;
  expiry_date?: Date;
  metadata?: Record<string, any>;
  recipe_items: ProductionRecipeItem[];
  created_at: Date;
  updated_at: Date;
}
```

#### Recipe Item Entity

```typescript
interface ProductionRecipeItem {
  id: number;
  recipe_id: number;
  material_product_id: number;
  material_product: Product;
  material_type: MaterialType;
  required_quantity: number;
  unit_of_measure: UnitOfMeasure;
  consumption_rate?: number;
  waste_percentage?: number;
  unit_cost?: number;
  total_cost?: number;
  specifications?: string;
  supplier_requirements?: string;
  storage_requirements?: string;
  quality_notes?: string;
  priority?: number;
  is_optional?: boolean;
  alternative_materials?: string;
  notes?: string;
}
```

### Recipe Status and Types

```typescript
enum RecipeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

enum RecipeType {
  MANUFACTURING = 'manufacturing',
  ASSEMBLY = 'assembly',
  PROCESSING = 'processing',
  PACKAGING = 'packaging',
}

enum MaterialType {
  RAW_MATERIAL = 'raw_material',
  COMPONENT = 'component',
  CONSUMABLE = 'consumable',
  PACKAGING = 'packaging',
}

enum UnitOfMeasure {
  PIECES = 'pieces',
  KG = 'kg',
  LITERS = 'liters',
  METERS = 'meters',
  BOXES = 'boxes',
  BOTTLES = 'bottles',
}
```

### Recipe Creation Example

```json
{
  "name": "Samsung Galaxy S24 Manufacturing Recipe",
  "recipe_code": "RECIPE-SG-S24-001",
  "finished_product_id": 1,
  "description": "Complete manufacturing process for Samsung Galaxy S24",
  "version": "1.0",
  "recipe_type": "manufacturing",
  "standard_quantity": 1000,
  "unit_of_measure": "units",
  "estimated_time_minutes": 480,
  "instructions": "1. Prepare PCB\n2. Mount components\n3. Test functionality",
  "quality_requirements": "All components must pass QC inspection",
  "safety_notes": "Use ESD protection when handling components",
  "yield_percentage": 95.5,
  "recipe_items": [
    {
      "material_product_id": 123,
      "material_type": "component",
      "required_quantity": 1000,
      "unit_of_measure": "pieces",
      "unit_cost": 120.00,
      "waste_percentage": 1.0,
      "specifications": "Grade A OLED display",
      "priority": 1,
      "is_optional": false
    },
    {
      "material_product_id": 124,
      "material_type": "component",
      "required_quantity": 1000,
      "unit_of_measure": "pieces",
      "unit_cost": 45.00,
      "waste_percentage": 0.5,
      "priority": 2,
      "is_optional": false
    }
  ]
}
```

## Production Flow

### 1. Product Setup
1. **Create Products**: Add all products to the catalog with appropriate `product_type`
   - Raw materials for production
   - Components for assembly
   - Finished goods (manufactured products)
   - Resale items (purchased for resale)

### 2. Recipe Creation
1. **Design Recipe**: Create production recipes for finished goods
2. **Define Materials**: Specify required materials, quantities, and specifications
3. **Set Standards**: Define quality requirements, safety notes, and waste percentages
4. **Cost Calculation**: System automatically calculates material costs

### 3. Production Planning
1. **Material Requirements**: Calculate material needs for production quantities
2. **Inventory Check**: Verify material availability
3. **Purchase Planning**: Plan material purchases based on production needs

### 4. Production Execution
1. **Create Production Order**: Start production with specific quantities
2. **Material Consumption**: Track actual material usage
3. **Waste Tracking**: Monitor waste and quality issues
4. **Quality Control**: Follow recipe quality requirements

### 5. Inventory Management
1. **Material Deduction**: Automatically reduce raw material inventory
2. **Finished Goods**: Add manufactured products to inventory
3. **Cost Tracking**: Update production costs and inventory values

## API Endpoints

### Product Management

#### Create Product
```http
POST /products
Authorization: Bearer <token>

{
  "name": "Display Panel",
  "sku": "DP-S24-001",
  "product_type": "raw_material",
  "selling_price": 120.00,
  "purchase_price": 95.00
}
```

#### Update Product
```http
PATCH /products/:id
Authorization: Bearer <token>

{
  "product_type": "component",
  "selling_price": 125.00
}
```

#### Get Products by Type
```http
GET /products?product_type=raw_material
Authorization: Bearer <token>
```

### Production Recipe Management

#### Create Recipe
```http
POST /production/recipe
Authorization: Bearer <token>
Permissions: production.add

{
  "name": "Samsung Galaxy S24 Recipe",
  "recipe_code": "RECIPE-SG-S24-001",
  "finished_product_id": 1,
  "standard_quantity": 1000,
  "recipe_items": [...]
}
```

#### Get All Recipes
```http
GET /production/recipe
Authorization: Bearer <token>
Permissions: production.view

Query Parameters:
- search: Search recipes by name/description
- recipe_type: Filter by recipe type
- status: Filter by status
- finished_product_id: Filter by finished product
- material_product_id: Filter by material used
- page: Page number
- limit: Items per page
```

#### Get Recipe by ID
```http
GET /production/recipe/:id
Authorization: Bearer <token>
Permissions: production.view
```

#### Update Recipe
```http
PATCH /production/recipe/:id
Authorization: Bearer <token>
Permissions: production.edit
```

#### Delete Recipe
```http
DELETE /production/recipe/:id
Authorization: Bearer <token>
Permissions: production.delete
```

#### Calculate Material Requirements
```http
GET /production/recipe/calculate/:id?quantity=1500
Authorization: Bearer <token>
Permissions: production.view

Response:
{
  "recipe_id": 1,
  "recipe_code": "RECIPE-SG-S24-001",
  "recipe_name": "Samsung Galaxy S24 Manufacturing Recipe",
  "standard_quantity": 1000,
  "requested_quantity": 1500,
  "multiplier": 1.5,
  "total_estimated_cost": 247500.00,
  "material_requirements": [
    {
      "material_product_id": 123,
      "material_name": "Display Panel",
      "required_quantity": 1500,
      "unit_of_measure": "pieces",
      "estimated_cost": 180000.00,
      "waste_percentage": 1.0,
      "total_with_waste": 1515
    }
  ]
}
```

## Database Schema

### Product Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    description TEXT,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_price DECIMAL(12,2),
    status BOOLEAN DEFAULT true,
    product_type VARCHAR(20) DEFAULT 'finished_good',  -- NEW
    brand_id INTEGER REFERENCES brands(id),
    category_id INTEGER REFERENCES categories(id),
    subcategory_id INTEGER REFERENCES subcategories(id),
    unit_id INTEGER REFERENCES units(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    origin VARCHAR(100),
    expire_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Production Recipes Table
```sql
CREATE TABLE production_recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    recipe_code VARCHAR(100) UNIQUE NOT NULL,
    finished_product_id INTEGER NOT NULL REFERENCES products(id),
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    recipe_type VARCHAR(20) DEFAULT 'manufacturing',
    status VARCHAR(20) DEFAULT 'draft',
    standard_quantity DECIMAL(12,2) DEFAULT 1,
    unit_of_measure VARCHAR(50) DEFAULT 'units',
    estimated_time_minutes INTEGER,
    instructions TEXT,
    quality_requirements TEXT,
    safety_notes TEXT,
    yield_percentage DECIMAL(5,2),
    effective_date DATE,
    expiry_date DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Production Recipe Items Table
```sql
CREATE TABLE production_recipe_items (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES production_recipes(id) ON DELETE CASCADE,
    material_product_id INTEGER NOT NULL REFERENCES products(id),
    material_type VARCHAR(20) DEFAULT 'raw_material',
    required_quantity DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(20) DEFAULT 'pieces',
    consumption_rate DECIMAL(5,2),
    waste_percentage DECIMAL(5,2) DEFAULT 0,
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    specifications TEXT,
    supplier_requirements TEXT,
    storage_requirements TEXT,
    quality_notes TEXT,
    priority INTEGER DEFAULT 1,
    is_optional BOOLEAN DEFAULT false,
    alternative_materials TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Material Consumption Table
```sql
CREATE TABLE material_consumption (
    id SERIAL PRIMARY KEY,
    production_order_id INTEGER REFERENCES production_orders(id),
    production_order_item_id INTEGER REFERENCES production_order_items(id),
    recipe_item_id INTEGER REFERENCES production_recipe_items(id),
    inventory_batch_id INTEGER REFERENCES inventory_batches(id),
    material_product_id INTEGER REFERENCES products(id),
    planned_quantity DECIMAL(12,2),
    actual_quantity DECIMAL(12,2),
    wasted_quantity DECIMAL(12,2) DEFAULT 0,
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'planned',
    consumption_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Example 1: Setting up Production for Smartphones

#### Step 1: Create Raw Materials
```json
// Create Display Panel (Raw Material)
POST /products
{
  "name": "OLED Display Panel",
  "sku": "OLED-6.1-001",
  "product_type": "raw_material",
  "purchase_price": 85.00,
  "description": "6.1 inch OLED display for smartphones"
}

// Create Battery (Component)
POST /products
{
  "name": "Li-Ion Battery 4000mAh",
  "sku": "BATT-4000-001",
  "product_type": "component",
  "purchase_price": 25.00,
  "description": "4000mAh lithium-ion battery"
}
```

#### Step 2: Create Finished Product
```json
// Create Smartphone (Finished Good)
POST /products
{
  "name": "Smartphone Model X",
  "sku": "PHONE-X-001",
  "product_type": "finished_good",
  "selling_price": 699.00,
  "description": "Latest smartphone model"
}
```

#### Step 3: Create Production Recipe
```json
POST /production/recipe
{
  "name": "Smartphone Model X Assembly",
  "recipe_code": "PHONE-X-RECIPE-001",
  "finished_product_id": 3,
  "standard_quantity": 100,
  "estimated_time_minutes": 45,
  "instructions": "1. Install display\n2. Install battery\n3. Test functionality\n4. Package",
  "recipe_items": [
    {
      "material_product_id": 1,
      "material_type": "raw_material",
      "required_quantity": 100,
      "unit_cost": 85.00,
      "waste_percentage": 2.0
    },
    {
      "material_product_id": 2,
      "material_type": "component",
      "required_quantity": 100,
      "unit_cost": 25.00,
      "waste_percentage": 1.0
    }
  ]
}
```

#### Step 4: Calculate Material Requirements
```http
GET /production/recipe/calculate/1?quantity=500
```

**Response:**
```json
{
  "recipe_id": 1,
  "recipe_code": "PHONE-X-RECIPE-001",
  "recipe_name": "Smartphone Model X Assembly",
  "standard_quantity": 100,
  "requested_quantity": 500,
  "multiplier": 5.0,
  "total_estimated_cost": 55125.00,
  "material_requirements": [
    {
      "material_product_id": 1,
      "material_name": "OLED Display Panel",
      "required_quantity": 500,
      "total_with_waste": 510,
      "estimated_cost": 43350.00
    },
    {
      "material_product_id": 2,
      "material_name": "Li-Ion Battery 4000mAh",
      "required_quantity": 500,
      "total_with_waste": 505,
      "estimated_cost": 12625.00
    }
  ]
}
```

### Example 2: Managing Resale Products

```json
// Create Resale Product
POST /products
{
  "name": "Wireless Headphones",
  "sku": "HEADPHONES-BT-001",
  "product_type": "resale",
  "purchase_price": 50.00,
  "selling_price": 89.99,
  "description": "Bluetooth wireless headphones purchased from supplier",
  "supplier_id": 1
}
```

## Integration Guidelines

### 1. Purchase Module Integration
- Use `product_type = 'raw_material'` or `'component'` for items to be purchased for production
- Use `product_type = 'resale'` for items purchased for direct resale
- Link suppliers to products for streamlined purchasing

### 2. Inventory Module Integration
- Raw materials and components are tracked in inventory
- Production recipes calculate material requirements from inventory
- Material consumption automatically updates inventory levels
- Finished goods are added to inventory after production

### 3. Sales Module Integration
- Distinguish between manufactured goods and resale items
- Use `product_type` for inventory management and reporting
- Track profitability by product type

### 4. Reporting and Analytics
- Filter products by `product_type` for specialized reports
- Analyze production costs and material efficiency
- Track waste percentages and yield rates
- Monitor inventory levels by product category

### 5. Quality Control
- Specify quality requirements in recipes
- Track material specifications and supplier requirements
- Monitor waste and quality issues during production

## Best Practices

### Product Management
1. **Consistent Categorization**: Use appropriate `product_type` for all products
2. **SKU Management**: Implement consistent SKU naming conventions
3. **Supplier Relationships**: Link suppliers to appropriate product types
4. **Pricing Strategy**: Maintain accurate purchase and selling prices

### Recipe Management
1. **Version Control**: Use version numbers for recipe updates
2. **Material Specifications**: Include detailed specifications for quality control
3. **Waste Tracking**: Monitor actual waste vs. estimated waste percentages
4. **Cost Accuracy**: Keep material costs updated for accurate calculations

### Production Planning
1. **Material Requirements**: Use calculation endpoint for production planning
2. **Inventory Levels**: Maintain adequate raw material inventory
3. **Production Scheduling**: Consider recipe time estimates in scheduling
4. **Quality Assurance**: Follow recipe quality requirements consistently

## Error Handling

### Common Errors and Solutions

1. **Invalid Product Type**: Ensure `product_type` matches enum values
2. **Material Not Found**: Verify material products exist before creating recipes
3. **Insufficient Inventory**: Check material availability before production
4. **Duplicate Recipe Codes**: Use unique recipe codes for each recipe
5. **Invalid Recipe Status**: Only modify non-archived recipes

### Validation Rules
- Recipe codes must be unique
- Material quantities must be positive numbers
- Waste percentages should be between 0-100
- Product SKUs must be unique
- Product types must match enum values

## Security Considerations

### Permission Requirements
- `production.view`: View recipes and production data
- `production.add`: Create new recipes
- `production.edit`: Update existing recipes
- `production.delete`: Remove recipes

### Data Protection
- Sensitive recipe information should be protected
- Supplier specifications may contain confidential information
- Cost data should be secured appropriately
- Production data integrity must be maintained

This comprehensive documentation provides the foundation for understanding and implementing the production system effectively. The system is designed to scale with your manufacturing needs while maintaining data integrity and providing valuable insights into production efficiency.