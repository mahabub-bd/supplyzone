import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Expense } from '../expense/entities/expense.entity';
import { Employee } from '../hrm/entities/employee.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { StockMovement } from '../inventory/entities/stock-movement.entity';
import { Product } from '../product/entities/product.entity';
import { PurchaseItem } from '../purchase-order/entities/purchase-item.entity';
import { Purchase } from '../purchase-order/entities/purchase.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Sale } from '../sales/entities/sale.entity';
import { User } from '../user/entities/user.entity';

import {
  DateRangeType,
  GroupByType,
  ReportFilterDto,
} from './dto/report-filter.dto';
import { calculateGrowthRate, getDateRange } from './utils/report-helpers.util';

export interface ReportData<T = any> {
  summary: any;
  details?: T[];
  comparison?: any;
  meta?: any;
}

@Injectable()
export class ReportsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepo: Repository<PurchaseItem>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
  ) {}

  // ==================== SALES REPORT ====================
  async generateSalesReport(filters: ReportFilterDto): Promise<ReportData> {
    const {
      dateRange,
      fromDate,
      toDate,
      start_date,
      end_date,
      groupBy,
      branch_id,
      customer_id,
      product_id,
      includeComparison,
    } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    // Build base query
    const queryBuilder = this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.sale', 'sale')
      .leftJoin('item.product', 'product')
      .leftJoin('sale.customer', 'customer')
      .leftJoin('sale.branch', 'branch')
      .leftJoin('sale.created_by', 'created_by')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      });

    // Apply filters
    if (branch_id) {
      queryBuilder.andWhere('sale.branchId = :branch_id', { branch_id });
    }
    if (customer_id) {
      queryBuilder.andWhere('sale.customerId = :customer_id', { customer_id });
    }
    if (product_id) {
      queryBuilder.andWhere('item.productId = :product_id', { product_id });
    }

    // Get summary statistics
    const summary = await queryBuilder
      .select('COUNT(DISTINCT sale.id)', 'totalOrders')
      .addSelect('SUM(item.quantity)', 'totalItemsSold')
      .addSelect('SUM(item.line_total)', 'totalRevenue')
      .addSelect('SUM(item.discount)', 'totalDiscount')
      .addSelect('SUM(item.tax)', 'totalTax')
      .addSelect('AVG(item.line_total)', 'averageOrderValue')
      .getRawOne();

    // Get grouped data
    let groupedData: any[] = [];
    if (groupBy) {
      groupedData = await this.getGroupedSalesData(
        queryBuilder,
        groupBy,
        dateRangeInfo,
      );
    } else {
      groupedData = await queryBuilder
        .select('sale.id', 'saleId')
        .addSelect('sale.invoice_no', 'invoiceNo')
        .addSelect('sale.created_at', 'saleDate')
        .addSelect('customer.name', 'customerName')
        .addSelect('product.name', 'productName')
        .addSelect('item.quantity', 'quantity')
        .addSelect('item.unit_price', 'unitPrice')
        .addSelect('item.line_total', 'lineTotal')
        .orderBy('sale.created_at', 'DESC')
        .limit(100)
        .getRawMany();
    }

    // Get comparison data if requested
    let comparison = null;
    if (includeComparison && dateRangeInfo.previousFromDate) {
      comparison = await this.getSalesComparison(dateRangeInfo);
    }

    return {
      summary: {
        totalOrders: Number(summary.totalOrders) || 0,
        totalItemsSold: Number(summary.totalItemsSold) || 0,
        totalRevenue: Number(summary.totalRevenue) || 0,
        totalDiscount: Number(summary.totalDiscount) || 0,
        totalTax: Number(summary.totalTax) || 0,
        averageOrderValue: Number(summary.averageOrderValue) || 0,
        netRevenue:
          (Number(summary.totalRevenue) || 0) -
          (Number(summary.totalDiscount) || 0),
      },
      details: groupedData,
      comparison,
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
        groupBy,
      },
    };
  }

  private async getGroupedSalesData(
    queryBuilder: any,
    groupBy: string,
    dateRangeInfo: any,
  ): Promise<any[]> {
    const qb = queryBuilder.clone();

    switch (groupBy) {
      case GroupByType.DAY:
        return qb
          .select('DATE(sale.created_at)', 'date')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .addSelect('SUM(item.line_total)', 'revenue')
          .addSelect('SUM(item.quantity)', 'itemsSold')
          .groupBy('DATE(sale.created_at)')
          .orderBy('date', 'DESC')
          .getRawMany();

      case GroupByType.WEEK:
        return qb
          .select("DATE_TRUNC('week', sale.created_at)", 'week')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .addSelect('SUM(item.line_total)', 'revenue')
          .addSelect('SUM(item.quantity)', 'itemsSold')
          .groupBy("DATE_TRUNC('week', sale.created_at)")
          .orderBy('week', 'DESC')
          .getRawMany();

      case GroupByType.MONTH:
        return qb
          .select("DATE_TRUNC('month', sale.created_at)", 'month')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .addSelect('SUM(item.line_total)', 'revenue')
          .addSelect('SUM(item.quantity)', 'itemsSold')
          .groupBy("DATE_TRUNC('month', sale.created_at)")
          .orderBy('month', 'DESC')
          .getRawMany();

      case GroupByType.PRODUCT:
        return qb
          .select('product.id', 'productId')
          .addSelect('product.name', 'productName')
          .addSelect('product.sku', 'sku')
          .addSelect('SUM(item.quantity)', 'totalQuantity')
          .addSelect('SUM(item.line_total)', 'totalRevenue')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .groupBy('product.id, product.name, product.sku')
          .orderBy('totalRevenue', 'DESC')
          .limit(50)
          .getRawMany();

      case GroupByType.CUSTOMER:
        return qb
          .select('customer.id', 'customerId')
          .addSelect('customer.name', 'customerName')
          .addSelect('customer.phone', 'phone')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .addSelect('SUM(item.line_total)', 'totalSpent')
          .addSelect('SUM(item.quantity)', 'totalItems')
          .groupBy('customer.id, customer.name, customer.phone')
          .orderBy('totalSpent', 'DESC')
          .limit(50)
          .getRawMany();

      case GroupByType.EMPLOYEE:
        return qb
          .select('created_by.id', 'employeeId')
          .addSelect('created_by.full_name', 'employeeName')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .addSelect('SUM(item.line_total)', 'totalRevenue')
          .addSelect('SUM(item.quantity)', 'totalItems')
          .groupBy('created_by.id, created_by.full_name')
          .orderBy('totalRevenue', 'DESC')
          .getRawMany();

      case GroupByType.BRANCH:
        return qb
          .select('branch.id', 'branchId')
          .addSelect('branch.name', 'branchName')
          .addSelect('COUNT(DISTINCT sale.id)', 'totalOrders')
          .addSelect('SUM(item.line_total)', 'totalRevenue')
          .addSelect('SUM(item.quantity)', 'totalItems')
          .groupBy('branch.id, branch.name')
          .orderBy('totalRevenue', 'DESC')
          .getRawMany();

      default:
        return [];
    }
  }

  private async getSalesComparison(dateRangeInfo: any): Promise<any> {
    const currentSummary = await this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.sale', 'sale')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      })
      .select('SUM(item.line_total)', 'revenue')
      .addSelect('COUNT(DISTINCT sale.id)', 'orders')
      .getRawOne();

    const previousSummary = await this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.sale', 'sale')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.previousFromDate,
        toDate: dateRangeInfo.previousToDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      })
      .select('SUM(item.line_total)', 'revenue')
      .addSelect('COUNT(DISTINCT sale.id)', 'orders')
      .getRawOne();

    const currentRevenue = Number(currentSummary.revenue) || 0;
    const previousRevenue = Number(previousSummary.revenue) || 0;
    const currentOrders = Number(currentSummary.orders) || 0;
    const previousOrders = Number(previousSummary.orders) || 0;

    return {
      current: {
        revenue: currentRevenue,
        orders: currentOrders,
      },
      previous: {
        revenue: previousRevenue,
        orders: previousOrders,
      },
      growth: {
        revenue: calculateGrowthRate(currentRevenue, previousRevenue),
        orders: calculateGrowthRate(currentOrders, previousOrders),
      },
    };
  }

  // ==================== PURCHASE REPORT ====================
  async generatePurchaseReport(filters: ReportFilterDto): Promise<ReportData> {
    const {
      dateRange,
      fromDate,
      toDate,
      start_date,
      end_date,
      groupBy,
      supplier_id,
      warehouse_id,
      product_id,
      includeComparison,
    } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    const queryBuilder = this.purchaseItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.purchase', 'purchase')
      .leftJoin('item.product', 'product')
      .leftJoin('purchase.supplier', 'supplier')
      .leftJoin('purchase.warehouse', 'warehouse')
      .where('purchase.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['draft', 'cancelled', 'rejected'],
      });

    if (supplier_id) {
      queryBuilder.andWhere('purchase.supplierId = :supplier_id', {
        supplier_id,
      });
    }
    if (warehouse_id) {
      queryBuilder.andWhere('purchase.warehouseId = :warehouse_id', {
        warehouse_id,
      });
    }
    if (product_id) {
      queryBuilder.andWhere('item.productId = :product_id', { product_id });
    }

    const summary = await queryBuilder
      .clone()
      .select('COUNT(DISTINCT purchase.id)', 'totalOrders')
      .addSelect('SUM(item.quantity)', 'totalItems')
      .addSelect('SUM(item.total_price)', 'totalValue')
      .addSelect('SUM(item.tax_rate * item.total_price / 100)', 'totalTax')
      .addSelect('SUM(item.discount_per_unit * item.quantity)', 'totalDiscount')
      .getRawOne();

    let groupedData: any[] = [];
    if (groupBy === GroupByType.PRODUCT) {
      groupedData = await queryBuilder
        .clone()
        .select('product.id', 'productId')
        .addSelect('product.name', 'productName')
        .addSelect('product.sku', 'sku')
        .addSelect('SUM(item.quantity)', 'totalQuantity')
        .addSelect('SUM(item.total_price)', 'totalCost')
        .addSelect('AVG(item.unit_price)', 'avgUnitPrice')
        .groupBy('product.id, product.name, product.sku')
        .orderBy('totalCost', 'DESC')
        .limit(50)
        .getRawMany();
    } else if (groupBy === GroupByType.SUPPLIER) {
      groupedData = await queryBuilder
        .clone()
        .select('supplier.id', 'supplierId')
        .addSelect('supplier.name', 'supplierName')
        .addSelect('COUNT(DISTINCT purchase.id)', 'totalOrders')
        .addSelect('SUM(item.total_price)', 'totalValue')
        .addSelect('SUM(item.quantity)', 'totalItems')
        .groupBy('supplier.id, supplier.name')
        .orderBy('totalValue', 'DESC')
        .limit(50)
        .getRawMany();
    } else {
      groupedData = await queryBuilder
        .select('purchase.po_no', 'poNumber')
        .addSelect('purchase.created_at', 'orderDate')
        .addSelect('supplier.name', 'supplierName')
        .addSelect('warehouse.name', 'warehouseName')
        .addSelect('purchase.status', 'status')
        .addSelect('item.total_price', 'totalValue')
        .addSelect('item.quantity', 'quantity')
        .orderBy('purchase.created_at', 'DESC')
        .limit(100)
        .getRawMany();
    }

    return {
      summary: {
        totalOrders: Number(summary.totalOrders) || 0,
        totalItems: Number(summary.totalItems) || 0,
        totalValue: Number(summary.totalValue) || 0,
        totalTax: Number(summary.totalTax) || 0,
        totalDiscount: Number(summary.totalDiscount) || 0,
        netValue:
          (Number(summary.totalValue) || 0) +
          (Number(summary.totalTax) || 0) -
          (Number(summary.totalDiscount) || 0),
      },
      details: groupedData,
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
      },
    };
  }

  // ==================== PROFIT/LOSS REPORT ====================
  async generateProfitLossReport(
    filters: ReportFilterDto,
  ): Promise<ReportData> {
    const { dateRange, fromDate, toDate, start_date, end_date, branch_id, groupBy } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    // Get sales data (revenue)
    const salesQuery = this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.sale', 'sale')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed'],
      });

    if (branch_id) {
      salesQuery.andWhere('sale.branchId = :branch_id', { branch_id });
    }

    const salesData = await salesQuery
      .select('SUM(item.line_total)', 'revenue')
      .addSelect('SUM(item.quantity)', 'itemsSold')
      .getRawOne();

    // Get COGS (Cost of Goods Sold)
    const cogsData = await salesQuery
      .leftJoin('item.product', 'product')
      .select('SUM(item.quantity * product.purchase_price)', 'cogs')
      .getRawOne();

    // Get purchase costs for the period
    const purchaseData = await this.purchaseItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.purchase', 'purchase')
      .where('purchase.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['draft', 'cancelled', 'rejected'],
      })
      .select('SUM(item.total_price)', 'purchases')
      .getRawOne();

    const revenue = Number(salesData.revenue) || 0;
    const cogs = Number(cogsData.cogs) || 0;
    const purchases = Number(purchaseData.purchases) || 0;
    const grossProfit = revenue - cogs;

    // Calculate discounts and taxes
    const discountTaxData = await this.saleRepo
      .createQueryBuilder('sale')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed'],
      })
      .select('SUM(sale.discount)', 'totalDiscount')
      .addSelect('SUM(sale.tax)', 'totalTax')
      .getRawOne();

    const totalDiscount = Number(discountTaxData.totalDiscount) || 0;
    const totalTax = Number(discountTaxData.totalTax) || 0;

    // Get expenses for the period
    const expenseData = await this.expenseRepo
      .createQueryBuilder('expense')
      .where('expense.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      });

    if (branch_id) {
      expenseData.andWhere('expense.branch_id = :branch_id', { branch_id });
    }

    const expenseSummary = await expenseData
      .select('SUM(expense.amount)', 'totalExpenses')
      .getRawOne();

    const totalExpenses = Number(expenseSummary.totalExpenses) || 0;

    // Get profit by product if grouped
    let productProfit: any[] = [];
    if (groupBy === GroupByType.PRODUCT) {
      productProfit = await this.saleItemRepo
        .createQueryBuilder('item')
        .leftJoin('item.sale', 'sale')
        .leftJoin('item.product', 'product')
        .where('sale.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.fromDate,
          toDate: dateRangeInfo.toDate,
        })
        .andWhere('sale.status IN (:...statuses)', {
          statuses: ['completed'],
        })
        .select('product.id', 'productId')
        .addSelect('product.name', 'productName')
        .addSelect('product.sku', 'sku')
        .addSelect('SUM(item.line_total)', 'revenue')
        .addSelect('SUM(item.quantity * product.purchase_price)', 'cogs')
        .addSelect('SUM(item.quantity)', 'quantitySold')
        .groupBy('product.id, product.name, product.sku')
        .orderBy('revenue', 'DESC')
        .limit(50)
        .getRawMany();

      productProfit = productProfit.map((p) => ({
        ...p,
        profit: Number(p.revenue) - Number(p.cogs),
        profitMargin:
          Number(p.revenue) > 0
            ? ((Number(p.revenue) - Number(p.cogs)) / Number(p.revenue)) * 100
            : 0,
      }));
    }

    return {
      summary: {
        revenue,
        cogs,
        grossProfit,
        grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        totalDiscount,
        totalTax,
        totalExpenses,
        operatingProfit: grossProfit - totalDiscount - totalExpenses,
        netProfit: grossProfit - totalDiscount - totalExpenses + totalTax,
        purchases,
      },
      details: productProfit.length > 0 ? productProfit : undefined,
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
      },
    };
  }

  // ==================== STOCK REPORT ====================
  async generateStockReport(filters: ReportFilterDto): Promise<ReportData> {
    const { warehouse_id, product_id, category_id, brand_id } = filters;

    const queryBuilder = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .leftJoin('inventory.warehouse', 'warehouse')
      .leftJoin('product.category', 'category')
      .leftJoin('product.brand', 'brand')
      .where('inventory.quantity > 0');

    if (warehouse_id) {
      queryBuilder.andWhere('inventory.warehouseId = :warehouse_id', {
        warehouse_id,
      });
    }
    if (product_id) {
      queryBuilder.andWhere('inventory.productId = :product_id', {
        product_id,
      });
    }
    if (category_id) {
      queryBuilder.andWhere('product.categoryId = :category_id', {
        category_id,
      });
    }
    if (brand_id) {
      queryBuilder.andWhere('product.brandId = :brand_id', { brand_id });
    }

    const stockData = await queryBuilder
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('product.sku', 'sku')
      .addSelect('warehouse.id', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect('inventory.batch_no', 'batchNo')
      .addSelect('inventory.quantity', 'quantity')
      .addSelect('inventory.sold_quantity', 'soldQuantity')
      .addSelect(
        'inventory.quantity - inventory.sold_quantity',
        'availableQuantity',
      )
      .addSelect('inventory.purchase_price', 'purchasePrice')
      .addSelect(
        '(inventory.quantity - inventory.sold_quantity) * inventory.purchase_price',
        'stockValue',
      )
      .addSelect('inventory.expiry_date', 'expiryDate')
      .orderBy('inventory.expiry_date', 'ASC')
      .getRawMany();

    // Calculate summary
    const summary = {
      totalProducts: new Set(stockData.map((s) => s.productId)).size,
      totalItems: stockData.reduce((sum, s) => sum + Number(s.quantity), 0),
      totalAvailable: stockData.reduce(
        (sum, s) => sum + (Number(s.quantity) - Number(s.soldQuantity)),
        0,
      ),
      totalSold: stockData.reduce((sum, s) => sum + Number(s.soldQuantity), 0),
      totalStockValue: stockData.reduce(
        (sum, s) =>
          sum +
          Number(
            (Number(s.quantity) - Number(s.soldQuantity)) *
              Number(s.purchase_price),
          ),
        0,
      ),
      lowStockItems: stockData.filter(
        (s) => Number(s.quantity) - Number(s.soldQuantity) < 10,
      ).length,
      expiredItems: stockData.filter(
        (s) => s.expiryDate && new Date(s.expiryDate) < new Date(),
      ).length,
    };

    // Get stock movements
    const movements = await this.stockMovementRepo
      .createQueryBuilder('movement')
      .leftJoin('movement.product', 'product')
      .leftJoin('movement.warehouse', 'warehouse')
      .orderBy('movement.created_at', 'DESC')
      .limit(50)
      .getMany();

    return {
      summary,
      details: stockData,
      meta: {
        movements: movements.map((m) => ({
          id: m.id,
          product: m.product?.name,
          warehouse: m.warehouse?.name,
          type: m.type,
          quantity: m.quantity,
          date: m.created_at,
          note: m.note,
        })),
      },
    };
  }

  // ==================== PRODUCT REPORT ====================
  async generateProductReport(filters: ReportFilterDto): Promise<ReportData> {
    const { dateRange, fromDate, toDate, start_date, end_date, category_id, brand_id, product_id } =
      filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    const queryBuilder = this.productRepo.createQueryBuilder('product');

    if (category_id) {
      queryBuilder.andWhere('product.categoryId = :category_id', {
        category_id,
      });
    }
    if (brand_id) {
      queryBuilder.andWhere('product.brandId = :brand_id', { brand_id });
    }
    if (product_id) {
      queryBuilder.andWhere('product.id = :product_id', { product_id });
    }

    const products = await queryBuilder
      .leftJoin('product.inventories', 'inventory')
      .leftJoin(SaleItem, 'saleItems', 'saleItems.productId = product.id')
      .leftJoin('saleItems.sale', 'sale', 'sale.created_at BETWEEN :fromDate AND :toDate')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.sku', 'sku')
      .addSelect('product.barcode', 'barcode')
      .addSelect('product.selling_price', 'sellingPrice')
      .addSelect('product.purchase_price', 'purchasePrice')
      .addSelect('product.status', 'status')
      .addSelect('COALESCE(SUM(inventory.quantity), 0)', 'totalStock')
      .addSelect('COALESCE(SUM(inventory.sold_quantity), 0)', 'totalSold')
      .addSelect('COALESCE(SUM(saleItems.quantity), 0)', 'salesCount')
      .addSelect('COALESCE(SUM(saleItems.line_total), 0)', 'salesRevenue')
      .addSelect('COALESCE(COUNT(DISTINCT sale.id), 0)', 'orderCount')
      .setParameter('fromDate', dateRangeInfo.fromDate)
      .setParameter('toDate', dateRangeInfo.toDate)
      .groupBy('product.id')
      .orderBy('"salesRevenue"', 'DESC')
      .limit(100)
      .getRawMany();

    // Calculate profit for each product
    const productData = products.map((p) => {
      const revenue = Number(p.salesRevenue) || 0;
      const totalStock = Number(p.totalStock) || 0;
      const totalSold = Number(p.totalSold) || 0;
      const availableStock = totalStock - totalSold; // Same as product service
      const purchasePrice = Number(p.purchasePrice) || 0;
      const cost = totalSold * purchasePrice;
      const profit = revenue - cost;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const stockValue = availableStock * purchasePrice;

      return {
        ...p,
        totalStock: totalStock, // Keep original totalStock
        totalSold: totalSold, // Keep original totalSold
        availableStock, // Add availableStock like product service
        revenue,
        cost,
        profit,
        profitMargin,
        stockValue,
      };
    });

    const summary = {
      totalProducts: productData.length,
      activeProducts: productData.filter((p) => p.status).length,
      totalRevenue: productData.reduce((sum, p) => sum + p.revenue, 0),
      totalProfit: productData.reduce((sum, p) => sum + p.profit, 0),
      totalStockValue: productData.reduce((sum, p) => sum + p.stockValue, 0),
      topSellingProducts: productData
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 10),
    };

    return {
      summary,
      details: productData,
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
      },
    };
  }

  // ==================== DASHBOARD REPORT (Quick Overview) ====================
  async generateDashboard(filters: ReportFilterDto): Promise<any> {
    const { dateRange, fromDate, toDate, start_date, end_date, branch_id } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    // Quick dashboard metrics - single query for each metric
    const [todaySales, todayExpense, todayPurchase, monthData, lastMonthData, totalProducts, lowStockCount, expenseData, lastMonthExpense, purchaseData, lastMonthPurchase] = await Promise.all([
      // Sales today
      this.saleRepo
        .createQueryBuilder('sale')
        .leftJoin(SaleItem, 'saleItem', 'saleItem.saleId = sale.id')
        .where('sale.created_at >= :todayStart', {
          todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
        })
        .andWhere('sale.status IN (:...statuses)', {
          statuses: ['completed', 'partial_refund'],
        })
        .select('COUNT(DISTINCT sale.id)', 'salesCount')
        .addSelect('SUM(sale.total)', 'revenue')
        .addSelect('SUM(saleItem.quantity * product.purchase_price)', 'cost')
        .leftJoin('saleItem.product', 'product')
        .getRawOne(),

      // Expenses today
      this.expenseRepo
        .createQueryBuilder('expense')
        .where('expense.created_at >= :todayStart', {
          todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
        })
        .select('SUM(expense.amount)', 'total')
        .getRawOne(),

      // Purchases today
      this.purchaseRepo
        .createQueryBuilder('purchase')
        .where('purchase.created_at >= :todayStart', {
          todayStart: new Date(new Date().setHours(0, 0, 0, 0)),
        })
        .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
          excludedStatuses: ['draft', 'cancelled', 'rejected'],
        })
        .select('COUNT(purchase.id)', 'purchaseCount')
        .addSelect('SUM(purchase.total_amount)', 'totalAmount')
        .getRawOne(),

      // Revenue and profit for the period
      this.saleRepo
        .createQueryBuilder('sale')
        .leftJoin(SaleItem, 'saleItem', 'saleItem.saleId = sale.id')
        .where('sale.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.fromDate,
          toDate: dateRangeInfo.toDate,
        })
        .andWhere('sale.status IN (:...statuses)', {
          statuses: ['completed', 'partial_refund'],
        })
        .select('COUNT(DISTINCT sale.id)', 'salesCount')
        .addSelect('SUM(sale.total)', 'revenue')
        .addSelect('SUM(saleItem.quantity * product.purchase_price)', 'cost')
        .leftJoin('saleItem.product', 'product')
        .getRawOne(),

      // Last month data for comparison
      this.saleRepo
        .createQueryBuilder('sale')
        .leftJoin(SaleItem, 'saleItem', 'saleItem.saleId = sale.id')
        .where('sale.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.previousFromDate,
          toDate: dateRangeInfo.previousToDate,
        })
        .andWhere('sale.status IN (:...statuses)', {
          statuses: ['completed', 'partial_refund'],
        })
        .select('COUNT(DISTINCT sale.id)', 'salesCount')
        .addSelect('SUM(sale.total)', 'revenue')
        .addSelect('SUM(saleItem.quantity * product.purchase_price)', 'cost')
        .leftJoin('saleItem.product', 'product')
        .getRawOne(),

      // Total products
      this.productRepo
        .createQueryBuilder('product')
        .select('COUNT(product.id)', 'total')
        .where('product.status = true')
        .getRawOne(),

      // Low stock products (less than 5)
      this.inventoryRepo
        .createQueryBuilder('inventory')
        .select('COUNT(DISTINCT inventory.product_id)', 'total')
        .where('(inventory.quantity - inventory.sold_quantity) < 5')
        .getRawOne(),

      // Expenses for the period
      this.expenseRepo
        .createQueryBuilder('expense')
        .where('expense.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.fromDate,
          toDate: dateRangeInfo.toDate,
        })
        .select('SUM(expense.amount)', 'total')
        .getRawOne(),

      // Expenses for last month
      this.expenseRepo
        .createQueryBuilder('expense')
        .where('expense.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.previousFromDate,
          toDate: dateRangeInfo.previousToDate,
        })
        .select('SUM(expense.amount)', 'total')
        .getRawOne(),

      // Purchases for the period
      this.purchaseRepo
        .createQueryBuilder('purchase')
        .where('purchase.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.fromDate,
          toDate: dateRangeInfo.toDate,
        })
        .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
          excludedStatuses: ['draft', 'cancelled', 'rejected'],
        })
        .select('COUNT(purchase.id)', 'purchaseCount')
        .addSelect('SUM(purchase.total_amount)', 'totalAmount')
        .getRawOne(),

      // Purchases for last month
      this.purchaseRepo
        .createQueryBuilder('purchase')
        .where('purchase.created_at BETWEEN :fromDate AND :toDate', {
          fromDate: dateRangeInfo.previousFromDate,
          toDate: dateRangeInfo.previousToDate,
        })
        .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
          excludedStatuses: ['draft', 'cancelled', 'rejected'],
        })
        .select('COUNT(purchase.id)', 'purchaseCount')
        .addSelect('SUM(purchase.total_amount)', 'totalAmount')
        .getRawOne(),
    ]);

    const todayRevenue = Number(todaySales.revenue) || 0;
    const todayCost = Number(todaySales.cost) || 0;
    const todayExpenseTotal = Number(todayExpense.total) || 0;
    const todayPurchaseCount = Number(todayPurchase.purchaseCount) || 0;
    const todayPurchaseAmount = Number(todayPurchase.totalAmount) || 0;
    const periodRevenue = Number(monthData.revenue) || 0;
    const periodCost = Number(monthData.cost) || 0;
    const lastMonthRevenue = Number(lastMonthData.revenue) || 0;
    const lastMonthCost = Number(lastMonthData.cost) || 0;
    const periodExpense = Number(expenseData.total) || 0;
    const lastMonthExpenseTotal = Number(lastMonthExpense.total) || 0;
    const periodPurchaseCount = Number(purchaseData.purchaseCount) || 0;
    const periodPurchaseAmount = Number(purchaseData.totalAmount) || 0;
    const lastMonthPurchaseCount = Number(lastMonthPurchase.purchaseCount) || 0;
    const lastMonthPurchaseAmount = Number(lastMonthPurchase.totalAmount) || 0;

    return {
      today: {
        salesCount: Number(todaySales.salesCount) || 0,
        revenue: todayRevenue,
        profit: todayRevenue - todayCost,
        expense: todayExpenseTotal,
        netProfit: (todayRevenue - todayCost) - todayExpenseTotal,
        purchaseCount: todayPurchaseCount,
        purchaseAmount: todayPurchaseAmount,
      },
      period: {
        salesCount: Number(monthData.salesCount) || 0,
        revenue: periodRevenue,
        profit: periodRevenue - periodCost,
        expense: periodExpense,
        netProfit: (periodRevenue - periodCost) - periodExpense,
        purchaseCount: periodPurchaseCount,
        purchaseAmount: periodPurchaseAmount,
      },
      previousPeriod: {
        salesCount: Number(lastMonthData.salesCount) || 0,
        revenue: lastMonthRevenue,
        profit: lastMonthRevenue - lastMonthCost,
        expense: lastMonthExpenseTotal,
        netProfit: (lastMonthRevenue - lastMonthCost) - lastMonthExpenseTotal,
        purchaseCount: lastMonthPurchaseCount,
        purchaseAmount: lastMonthPurchaseAmount,
      },
      inventory: {
        totalProducts: Number(totalProducts.total) || 0,
        lowStockCount: Number(lowStockCount.total) || 0,
      },
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
      },
    };
  }

  // ==================== SUMMARY REPORT (Comprehensive) ====================
  async generateSummaryReport(filters: ReportFilterDto): Promise<ReportData> {
    const { dateRange, fromDate, toDate, start_date, end_date, branch_id } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    // Sales summary
    const salesSummary = await this.saleRepo
      .createQueryBuilder('sale')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      })
      .select('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .addSelect('SUM(sale.paid_amount)', 'totalPaid')
      .addSelect('AVG(sale.total)', 'avgOrderValue')
      .getRawOne();

    // Purchase summary
    const purchaseSummary = await this.purchaseRepo
      .createQueryBuilder('purchase')
      .where('purchase.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['draft', 'cancelled', 'rejected'],
      })
      .select('COUNT(purchase.id)', 'totalPurchases')
      .addSelect('SUM(purchase.total_amount)', 'totalValue')
      .addSelect('SUM(purchase.paid_amount)', 'totalPaid')
      .addSelect('SUM(purchase.due_amount)', 'totalDue')
      .getRawOne();

    // Supplier summary
    const supplierSummary = await this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoin('purchase.supplier', 'supplier')
      .where('purchase.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('purchase.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['draft', 'cancelled', 'rejected'],
      })
      .select('supplier.id', 'supplierId')
      .addSelect('supplier.name', 'supplierName')
      .addSelect('supplier.email', 'supplierEmail')
      .addSelect('supplier.phone', 'supplierPhone')
      .addSelect('COUNT(purchase.id)', 'purchaseCount')
      .addSelect('SUM(purchase.total_amount)', 'totalPurchaseAmount')
      .addSelect('SUM(purchase.paid_amount)', 'totalPaid')
      .addSelect('SUM(purchase.due_amount)', 'totalDue')
      .groupBy('supplier.id, supplier.name, supplier.email, supplier.phone')
      .orderBy('"totalPurchaseAmount"', 'DESC')
      .getRawMany();

    // Inventory summary
    const inventorySummary = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .select('COUNT(DISTINCT inventory.product_id)', 'totalProducts')
      .addSelect('SUM(inventory.quantity)', 'totalStock')
      .addSelect(
        'SUM(inventory.quantity - inventory.sold_quantity)',
        'availableStock',
      )
      .addSelect(
        'SUM((inventory.quantity - inventory.sold_quantity) * inventory.purchase_price)',
        'stockValue',
      )
      .getRawOne();

    // Customer summary
    const customerSummary = await this.saleRepo
      .createQueryBuilder('sale')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.customerId IS NOT NULL')
      .select('COUNT(DISTINCT sale.customerId)', 'totalCustomers')
      .getRawOne();

    // Customer details with purchase information
    const customerDetails = await this.saleRepo
      .createQueryBuilder('sale')
      .leftJoin('sale.customer', 'customer')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.customerId IS NOT NULL')
      .select('customer.id', 'customerId')
      .addSelect('customer.customer_code', 'customerCode')
      .addSelect('customer.name', 'customerName')
      .addSelect('customer.phone', 'customerPhone')
      .addSelect('customer.email', 'customerEmail')
      .addSelect('customer.reward_points', 'rewardPoints')
      .addSelect('COUNT(sale.id)', 'totalPurchases')
      .addSelect('SUM(sale.total)', 'totalPurchaseAmount')
      .addSelect('SUM(sale.paid_amount)', 'totalPaid')
      .addSelect('SUM(sale.total - sale.paid_amount)', 'totalDue')
      .addSelect('AVG(sale.total)', 'averageOrderValue')
      .groupBy('customer.id, customer.customer_code, customer.name, customer.phone, customer.email, customer.reward_points')
      .orderBy('"totalPurchaseAmount"', 'DESC')
      .getRawMany();

    // Expense summary by category
    const expenseDetails = await this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoin('expense.category', 'category')
      .where('expense.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(expense.id)', 'expenseCount')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addSelect('AVG(expense.amount)', 'averageAmount')
      .groupBy('category.id, category.name')
      .orderBy('"totalAmount"', 'DESC')
      .getRawMany();

    // Payment methods
    const paymentMethods = await this.saleRepo
      .createQueryBuilder('sale')
      .leftJoin('sale.payments', 'payment')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .select('payment.method', 'method')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .addSelect('COUNT(payment.id)', 'transactionCount')
      .groupBy('payment.method')
      .getRawMany();

    return {
      summary: {
        sales: {
          totalSales: Number(salesSummary.totalSales) || 0,
          totalRevenue: Number(salesSummary.totalRevenue) || 0,
          totalPaid: Number(salesSummary.totalPaid) || 0,
          averageOrderValue: Number(salesSummary.avgOrderValue) || 0,
          outstandingAmount:
            (Number(salesSummary.totalRevenue) || 0) -
            (Number(salesSummary.totalPaid) || 0),
        },
        purchases: {
          totalPurchases: Number(purchaseSummary.totalPurchases) || 0,
          totalValue: Number(purchaseSummary.totalValue) || 0,
          totalPaid: Number(purchaseSummary.totalPaid) || 0,
          totalDue: Number(purchaseSummary.totalDue) || 0,
        },
        suppliers: supplierSummary.map((sup) => ({
          supplierId: sup.supplierId,
          supplierName: sup.supplierName,
          supplierEmail: sup.supplierEmail,
          supplierPhone: sup.supplierPhone,
          purchaseCount: Number(sup.purchaseCount) || 0,
          totalPurchaseAmount: Number(sup.totalPurchaseAmount) || 0,
          totalPaid: Number(sup.totalPaid) || 0,
          totalDue: Number(sup.totalDue) || 0,
        })),
        inventory: {
          totalProducts: Number(inventorySummary.totalProducts) || 0,
          totalStock: Number(inventorySummary.totalStock) || 0,
          availableStock: Number(inventorySummary.availableStock) || 0,
          stockValue: Number(inventorySummary.stockValue) || 0,
        },
        customers: {
          totalCustomers: Number(customerSummary.totalCustomers) || 0,
        },
        customerDetails: customerDetails.map((cust) => ({
          customerId: cust.customerId,
          customerCode: cust.customerCode,
          customerName: cust.customerName,
          customerPhone: cust.customerPhone,
          customerEmail: cust.customerEmail,
          rewardPoints: Number(cust.rewardPoints) || 0,
          totalPurchases: Number(cust.totalPurchases) || 0,
          totalPurchaseAmount: Number(cust.totalPurchaseAmount) || 0,
          totalPaid: Number(cust.totalPaid) || 0,
          totalDue: Number(cust.totalDue) || 0,
          averageOrderValue: Number(cust.averageOrderValue) || 0,
        })),
        expenses: expenseDetails.map((exp) => ({
          categoryId: exp.categoryId,
          categoryName: exp.categoryName,
          expenseCount: Number(exp.expenseCount) || 0,
          totalAmount: Number(exp.totalAmount) || 0,
          averageAmount: Number(exp.averageAmount) || 0,
        })),
        paymentMethods: paymentMethods.map((pm) => ({
          method: pm.method,
          totalAmount: Number(pm.totalAmount) || 0,
          transactionCount: Number(pm.transactionCount) || 0,
        })),
      },
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
      },
    };
  }

  // ==================== EMPLOYEE REPORT ====================
  async generateEmployeeReport(filters: ReportFilterDto): Promise<ReportData> {
    const { dateRange, fromDate, toDate, start_date, end_date, employee_id, branch_id } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    const queryBuilder = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoin('sale.created_by', 'employee')
      .leftJoin('sale.branch', 'branch')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      });

    if (employee_id) {
      queryBuilder.andWhere('sale.createdById = :employee_id', { employee_id });
    }
    if (branch_id) {
      queryBuilder.andWhere('sale.branchId = :branch_id', { branch_id });
    }

    // Get employee performance data
    const employeeData = await queryBuilder
      .select('employee.id', 'employeeId')
      .addSelect('employee.full_name', 'employeeName')
      .addSelect('employee.email', 'email')
      .addSelect('branch.name', 'branchName')
      .addSelect('COUNT(DISTINCT sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .addSelect('AVG(sale.total)', 'avgOrderValue')
      .addSelect('SUM(sale.paid_amount)', 'totalCollected')
      .groupBy('employee.id, employee.full_name, employee.email, branch.name')
      .getRawMany();

    // Get detailed sales by employee
    const detailedData = await this.saleRepo
      .createQueryBuilder('sale')
      .leftJoin('sale.created_by', 'employee')
      .leftJoin('sale.branch', 'branch')
      .select('sale.id', 'saleId')
      .addSelect('sale.invoice_no', 'invoiceNo')
      .addSelect('sale.created_at', 'saleDate')
      .addSelect('employee.full_name', 'employeeName')
      .addSelect('branch.name', 'branchName')
      .addSelect('sale.total', 'total')
      .addSelect('sale.status', 'status')
      .where('sale.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      })
      .andWhere('sale.status IN (:...statuses)', {
        statuses: ['completed', 'partial_refund'],
      })
      .orderBy('sale.created_at', 'DESC')
      .limit(100)
      .getRawMany();

    // Get top performers
    const topPerformers = [...employeeData]
      .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
      .slice(0, 5);

    const summary = {
      totalEmployees: employeeData.length,
      totalRevenue: employeeData.reduce(
        (sum, e) => sum + (Number(e.totalRevenue) || 0),
        0,
      ),
      totalSales: employeeData.reduce(
        (sum, e) => sum + (Number(e.totalSales) || 0),
        0,
      ),
      topPerformers: topPerformers.map((e) => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        totalRevenue: Number(e.totalRevenue) || 0,
        totalSales: Number(e.totalSales) || 0,
        avgOrderValue: Number(e.avgOrderValue) || 0,
      })),
    };

    return {
      summary,
      details: detailedData,
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
      },
    };
  }

  // ==================== EXPENSE REPORT ====================
  async generateExpenseReport(filters: ReportFilterDto): Promise<ReportData> {
    const {
      dateRange,
      fromDate,
      toDate,
      start_date,
      end_date,
      groupBy,
      branch_id,
      expense_category_id,
      includeComparison,
    } = filters;
    const dateRangeInfo = getDateRange(
      dateRange || DateRangeType.THIS_MONTH,
      start_date || fromDate,
      end_date || toDate,
    );

    // Build base query
    const queryBuilder = this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoin('expense.category', 'category')
      .leftJoin('expense.branch', 'branch')
      .leftJoin('expense.created_by', 'created_by')
      .where('expense.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      });

    // Apply filters
    if (branch_id) {
      queryBuilder.andWhere('expense.branch_id = :branch_id', { branch_id });
    }
    if (expense_category_id) {
      queryBuilder.andWhere('expense.category_id = :expense_category_id', {
        expense_category_id,
      });
    }

    // Get summary statistics
    const summary = await queryBuilder
      .clone()
      .select('COUNT(DISTINCT expense.id)', 'totalExpenses')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addSelect('AVG(expense.amount)', 'averageExpense')
      .addSelect('COUNT(DISTINCT expense.category_id)', 'totalCategories')
      .addSelect('COUNT(DISTINCT expense.branch_id)', 'totalBranches')
      .getRawOne();

    // Get grouped data
    let groupedData: any[] = [];
    if (groupBy) {
      groupedData = await this.getGroupedExpenseData(
        queryBuilder,
        groupBy,
        dateRangeInfo,
      );
    } else {
      groupedData = await queryBuilder
        .select('expense.id', 'id')
        .addSelect('expense.title', 'title')
        .addSelect('expense.description', 'description')
        .addSelect('expense.amount', 'amount')
        .addSelect('expense.payment_method', 'paymentMethod')
        .addSelect('expense.created_at', 'date')
        .addSelect('category.name', 'category')
        .addSelect('branch.name', 'branch')
        .addSelect('created_by.full_name', 'createdBy')
        .addSelect('expense.receipt_url', 'receiptUrl')
        .orderBy('expense.created_at', 'DESC')
        .limit(100)
        .getRawMany();
    }

    // Get expenses by category summary
    const expensesByCategory = await queryBuilder
      .clone()
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(expense.id)', 'count')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addGroupBy('category.id, category.name')
      .orderBy('"totalAmount"', 'DESC')
      .getRawMany();

    // Get expenses by payment method
    const expensesByPaymentMethod = await queryBuilder
      .clone()
      .select('expense.payment_method', 'paymentMethod')
      .addSelect('COUNT(expense.id)', 'count')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addGroupBy('expense.payment_method')
      .orderBy('"totalAmount"', 'DESC')
      .getRawMany();

    // Get comparison data if requested
    let comparison = null;
    if (includeComparison && dateRangeInfo.previousFromDate) {
      comparison = await this.getExpenseComparison(
        dateRangeInfo,
        branch_id,
        expense_category_id,
      );
    }

    return {
      summary: {
        totalExpenses: Number(summary.totalExpenses) || 0,
        totalAmount: Number(summary.totalAmount) || 0,
        averageExpense: Number(summary.averageExpense) || 0,
        totalCategories: Number(summary.totalCategories) || 0,
        totalBranches: Number(summary.totalBranches) || 0,
      },
      details: groupedData,
      comparison,
      meta: {
        dateRange: {
          from: dateRangeInfo.fromDate,
          to: dateRangeInfo.toDate,
        },
        groupBy,
        expensesByCategory,
        expensesByPaymentMethod,
      },
    };
  }

  private async getGroupedExpenseData(
    queryBuilder: any,
    groupBy: string,
    dateRangeInfo: any,
  ): Promise<any[]> {
    const qb = queryBuilder.clone();

    switch (groupBy) {
      case GroupByType.DAY:
        return qb
          .select('DATE(expense.created_at)', 'date')
          .addSelect('COUNT(expense.id)', 'totalExpenses')
          .addSelect('SUM(expense.amount)', 'totalAmount')
          .addGroupBy('DATE(expense.created_at)')
          .orderBy('date', 'DESC')
          .getRawMany();

      case GroupByType.WEEK:
        return qb
          .select("DATE_TRUNC('week', expense.created_at)", 'week')
          .addSelect('COUNT(expense.id)', 'totalExpenses')
          .addSelect('SUM(expense.amount)', 'totalAmount')
          .addGroupBy("DATE_TRUNC('week', expense.created_at)")
          .orderBy('week', 'DESC')
          .getRawMany();

      case GroupByType.MONTH:
        return qb
          .select("DATE_TRUNC('month', expense.created_at)", 'month')
          .addSelect('COUNT(expense.id)', 'totalExpenses')
          .addSelect('SUM(expense.amount)', 'totalAmount')
          .addGroupBy("DATE_TRUNC('month', expense.created_at)")
          .orderBy('month', 'DESC')
          .getRawMany();

      case GroupByType.CATEGORY:
        return qb
          .select('category.id', 'categoryId')
          .addSelect('category.name', 'categoryName')
          .addSelect('COUNT(expense.id)', 'totalExpenses')
          .addSelect('SUM(expense.amount)', 'totalAmount')
          .addSelect('AVG(expense.amount)', 'averageAmount')
          .addGroupBy('category.id, category.name')
          .orderBy('totalAmount', 'DESC')
          .getRawMany();

      case GroupByType.BRANCH:
        return qb
          .select('branch.id', 'branchId')
          .addSelect('branch.name', 'branchName')
          .addSelect('COUNT(expense.id)', 'totalExpenses')
          .addSelect('SUM(expense.amount)', 'totalAmount')
          .addSelect('AVG(expense.amount)', 'averageAmount')
          .addGroupBy('branch.id, branch.name')
          .orderBy('totalAmount', 'DESC')
          .getRawMany();

      default:
        return [];
    }
  }

  private async getExpenseComparison(
    dateRangeInfo: any,
    branch_id?: number,
    category_id?: number,
  ): Promise<any> {
    const currentQuery = this.expenseRepo
      .createQueryBuilder('expense')
      .where('expense.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.fromDate,
        toDate: dateRangeInfo.toDate,
      });

    if (branch_id) {
      currentQuery.andWhere('expense.branch_id = :branch_id', { branch_id });
    }
    if (category_id) {
      currentQuery.andWhere('expense.category_id = :category_id', {
        category_id,
      });
    }

    const currentSummary = await currentQuery
      .select('COUNT(expense.id)', 'count')
      .addSelect('SUM(expense.amount)', 'amount')
      .getRawOne();

    const previousQuery = this.expenseRepo
      .createQueryBuilder('expense')
      .where('expense.created_at BETWEEN :fromDate AND :toDate', {
        fromDate: dateRangeInfo.previousFromDate,
        toDate: dateRangeInfo.previousToDate,
      });

    if (branch_id) {
      previousQuery.andWhere('expense.branch_id = :branch_id', { branch_id });
    }
    if (category_id) {
      previousQuery.andWhere('expense.category_id = :category_id', {
        category_id,
      });
    }

    const previousSummary = await previousQuery
      .select('COUNT(expense.id)', 'count')
      .addSelect('SUM(expense.amount)', 'amount')
      .getRawOne();

    const currentAmount = Number(currentSummary.amount) || 0;
    const previousAmount = Number(previousSummary.amount) || 0;
    const currentCount = Number(currentSummary.count) || 0;
    const previousCount = Number(previousSummary.count) || 0;

    return {
      current: {
        amount: currentAmount,
        count: currentCount,
      },
      previous: {
        amount: previousAmount,
        count: previousCount,
      },
      growth: {
        amount: calculateGrowthRate(currentAmount, previousAmount),
        count: calculateGrowthRate(currentCount, previousCount),
      },
    };
  }
}
