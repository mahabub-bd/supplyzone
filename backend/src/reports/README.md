# Reports Module

A comprehensive reporting module for the Smart Sale POS system that provides various analytical reports across sales, purchases, inventory, and more.

## Features

### 1. **Sales Report**
Generate detailed sales reports with various filtering and grouping options.

**Endpoint:** `GET /reports/sales`

**Query Parameters:**
- `fromDate` (string): Start date (YYYY-MM-DD)
- `toDate` (string): End date (YYYY-MM-DD)
- `dateRange` (enum): Predefined date range
  - `today`, `yesterday`, `this_week`, `last_week`
  - `this_month`, `last_month`, `this_quarter`, `last_quarter`
  - `this_year`, `last_year`, `custom`
- `groupBy` (enum): Group results by
  - `day`, `week`, `month`, `quarter`, `year`
  - `product`, `category`, `customer`, `employee`, `branch`
- `branch_id` (number): Filter by branch
- `customer_id` (number): Filter by customer
- `product_id` (number): Filter by product
- `includeComparison` (boolean): Include comparison with previous period

**Response:**
```json
{
  "summary": {
    "totalOrders": 150,
    "totalItemsSold": 500,
    "totalRevenue": 150000.00,
    "totalDiscount": 5000.00,
    "totalTax": 15000.00,
    "averageOrderValue": 1000.00,
    "netRevenue": 145000.00
  },
  "details": [...],
  "comparison": {
    "current": { "revenue": 150000, "orders": 150 },
    "previous": { "revenue": 120000, "orders": 120 },
    "growth": {
      "revenue": { "value": 30000, "percentage": 25.0 },
      "orders": { "value": 30, "percentage": 25.0 }
    }
  }
}
```

### 2. **Purchase Report**
Track purchases from suppliers with detailed breakdowns.

**Endpoint:** `GET /reports/purchase`

**Query Parameters:**
- `fromDate`, `toDate`, `dateRange`: Date filters
- `groupBy`: Group by `product`, `supplier`
- `supplier_id` (number): Filter by supplier
- `warehouse_id` (number): Filter by warehouse
- `product_id` (number): Filter by product

**Response:**
```json
{
  "summary": {
    "totalOrders": 50,
    "totalItems": 200,
    "totalValue": 100000.00,
    "totalTax": 10000.00,
    "totalDiscount": 2000.00,
    "netValue": 108000.00
  },
  "details": [...]
}
```

### 3. **Profit/Loss Report**
Analyze profitability with COGS and revenue analysis.

**Endpoint:** `GET /reports/profit-loss`

**Query Parameters:**
- `fromDate`, `toDate`, `dateRange`: Date filters
- `branch_id` (number): Filter by branch
- `groupBy` (enum): Group by `product`

**Response:**
```json
{
  "summary": {
    "revenue": 150000.00,
    "cogs": 100000.00,
    "grossProfit": 50000.00,
    "grossProfitMargin": 33.33,
    "totalDiscount": 5000.00,
    "totalTax": 15000.00,
    "netProfit": 45000.00,
    "purchases": 100000.00
  },
  "details": [
    {
      "productId": 1,
      "productName": "Product A",
      "revenue": 50000,
      "cogs": 30000,
      "profit": 20000,
      "profitMargin": 40.0
    }
  ]
}
```

### 4. **Stock Report**
Monitor inventory levels and stock movements.

**Endpoint:** `GET /reports/stock`

**Query Parameters:**
- `warehouse_id` (number): Filter by warehouse
- `product_id` (number): Filter by product
- `category_id` (number): Filter by category
- `brand_id` (number): Filter by brand

**Response:**
```json
{
  "summary": {
    "totalProducts": 100,
    "totalItems": 5000,
    "totalAvailable": 3500,
    "totalSold": 1500,
    "totalStockValue": 250000.00,
    "lowStockItems": 10,
    "expiredItems": 2
  },
  "details": [
    {
      "productId": 1,
      "productName": "Product A",
      "sku": "SKU-001",
      "warehouseName": "Main Warehouse",
      "batchNo": "BATCH-001",
      "quantity": 100,
      "soldQuantity": 20,
      "availableQuantity": 80,
      "stockValue": 8000.00
    }
  ],
  "meta": {
    "movements": [...]
  }
}
```

### 5. **Product Report**
Analyze product performance and sales metrics.

**Endpoint:** `GET /reports/products`

**Query Parameters:**
- `fromDate`, `toDate`, `dateRange`: Date filters
- `category_id` (number): Filter by category
- `brand_id` (number): Filter by brand
- `product_id` (number): Filter by specific product

**Response:**
```json
{
  "summary": {
    "totalProducts": 100,
    "activeProducts": 85,
    "totalRevenue": 150000.00,
    "totalProfit": 45000.00,
    "totalStockValue": 250000.00,
    "topSellingProducts": [...]
  },
  "details": [...]
}
```

### 6. **Summary Report**
Get a comprehensive overview of all business metrics.

**Endpoint:** `GET /reports/summary`

**Query Parameters:**
- `fromDate`, `toDate`, `dateRange`: Date filters
- `branch_id` (number): Filter by branch

**Response:**
```json
{
  "summary": {
    "sales": {
      "totalSales": 150,
      "totalRevenue": 150000.00,
      "totalPaid": 145000.00,
      "averageOrderValue": 1000.00,
      "outstandingAmount": 5000.00
    },
    "purchases": {
      "totalPurchases": 50,
      "totalValue": 100000.00
    },
    "inventory": {
      "totalProducts": 100,
      "totalStock": 5000,
      "availableStock": 3500,
      "stockValue": 250000.00
    },
    "customers": {
      "totalCustomers": 80
    },
    "paymentMethods": [
      { "method": "cash", "totalAmount": 80000, "transactionCount": 100 },
      { "method": "card", "totalAmount": 65000, "transactionCount": 50 }
    ]
  }
}
```

### 7. **Employee Report**
Track employee performance and sales metrics.

**Endpoint:** `GET /reports/employees`

**Query Parameters:**
- `fromDate`, `toDate`, `dateRange`: Date filters
- `employee_id` (number): Filter by employee
- `branch_id` (number): Filter by branch

**Response:**
```json
{
  "summary": {
    "totalEmployees": 10,
    "totalRevenue": 150000.00,
    "totalSales": 150,
    "topPerformers": [
      {
        "employeeId": 5,
        "employeeName": "John Doe",
        "totalRevenue": 30000.00,
        "totalSales": 30,
        "avgOrderValue": 1000.00
      }
    ]
  },
  "details": [...]
}
```

### 8. **Dashboard**
Get all report summaries in a single request.

**Endpoint:** `GET /reports/dashboard`

**Query Parameters:**
- Same as summary report

**Response:**
```json
{
  "sales": { ... },
  "purchase": { ... },
  "profitLoss": { ... },
  "stock": { ... },
  "products": { ... },
  "summary": { ... },
  "employees": { ... }
}
```

## Usage Examples

### Get sales for this month grouped by product
```bash
GET /reports/sales?dateRange=this_month&groupBy=product
```

### Get profit/loss for a custom date range
```bash
GET /reports/profit-loss?fromDate=2025-01-01&toDate=2025-01-31&groupBy=product
```

### Get stock report for a specific warehouse
```bash
GET /reports/stock?warehouse_id=1
```

### Get employee performance with comparison
```bash
GET /reports/employees?dateRange=this_month&employee_id=5
```

### Get dashboard overview
```bash
GET /reports/dashboard?dateRange=this_month
```

## Module Structure

```
src/reports/
├── dto/
│   └── report-filter.dto.ts       # Filter DTOs and enums
├── utils/
│   └── report-helpers.util.ts     # Date range utilities
├── reports.controller.ts          # API endpoints
├── reports.service.ts             # Business logic
├── reports.module.ts              # Module definition
└── README.md                      # Documentation
```

## Authentication

All report endpoints require JWT authentication. Include the bearer token in the request header:

```
Authorization: Bearer <your-jwt-token>
```

## Pagination

Some reports support pagination via:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

## Date Range Handling

The module provides predefined date ranges for quick filtering:
- **today**: Current day from 00:00:00 to now
- **yesterday**: Previous day
- **this_week**: Current week (Monday to now)
- **last_week**: Previous Monday to Sunday
- **this_month**: Current month from 1st to now
- **last_month**: Previous month
- **this_quarter**: Current quarter
- **last_quarter**: Previous quarter
- **this_year**: Current year
- **last_year**: Previous year
- **custom**: Use `fromDate` and `toDate` parameters
