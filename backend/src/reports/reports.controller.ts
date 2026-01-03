import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { EmployeeReportFilterDto } from './dto/employee-report-filter.dto';
import { ExpenseReportFilterDto } from './dto/expense-report-filter.dto';
import { ProductReportFilterDto } from './dto/product-report-filter.dto';
import { ProfitLossReportFilterDto } from './dto/profit-loss-report-filter.dto';
import { PurchaseReportFilterDto } from './dto/purchase-report-filter.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { SalesReportFilterDto } from './dto/sales-report-filter.dto';
import { SummaryReportFilterDto } from './dto/summary-report-filter.dto';
import { ReportsService } from './reports.service';
@ApiTags('Reports')
@ApiBearerAuth('token')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Permissions('report.sales')
  @ApiOperation({ summary: 'Generate sales report' })
  @ApiResponse({
    status: 200,
    description: 'Sales report generated successfully',
  })
  async getSalesReport(@Query() filters: SalesReportFilterDto) {
    return this.reportsService.generateSalesReport(filters);
  }

  @Get('purchase')
  @Permissions('report.purchase')
  @ApiOperation({ summary: 'Generate purchase report' })
  @ApiResponse({
    status: 200,
    description: 'Purchase report generated successfully',
  })
  async getPurchaseReport(@Query() filters: PurchaseReportFilterDto) {
    return this.reportsService.generatePurchaseReport(filters);
  }

  @Get('profit-loss')
  @Permissions('report.profitloss')
  @ApiOperation({ summary: 'Generate profit and loss report' })
  @ApiResponse({
    status: 200,
    description: 'Profit/Loss report generated successfully',
  })
  async getProfitLossReport(@Query() filters: ProfitLossReportFilterDto) {
    return this.reportsService.generateProfitLossReport(filters);
  }

  @Get('stock')
  @Permissions('report.inventory')
  @ApiOperation({ summary: 'Generate stock/inventory report' })
  @ApiQuery({ name: 'warehouse_id', required: false, type: Number })
  @ApiQuery({ name: 'product_id', required: false, type: Number })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'brand_id', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stock report generated successfully',
  })
  async getStockReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.generateStockReport(filters);
  }

  @Get('products')
  @ApiOperation({ summary: 'Generate product performance report' })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'brand_id', required: false, type: Number })
  @ApiQuery({ name: 'product_id', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Product report generated successfully',
  })
  async getProductReport(@Query() filters: ProductReportFilterDto) {
    return this.reportsService.generateProductReport(filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Generate comprehensive summary report' })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'branch_id', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Summary report generated successfully',
  })
  async getSummaryReport(@Query() filters: SummaryReportFilterDto) {
    return this.reportsService.generateSummaryReport(filters);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Generate employee performance report' })
  @ApiResponse({
    status: 200,
    description: 'Employee report generated successfully',
  })
  async getEmployeeReport(@Query() filters: EmployeeReportFilterDto) {
    return this.reportsService.generateEmployeeReport(filters);
  }

  @Get('expense')
  @Permissions('report.expense')
  @ApiOperation({ summary: 'Generate expense report' })
  @ApiResponse({
    status: 200,
    description: 'Expense report generated successfully',
  })
  async getExpenseReport(@Query() filters: ExpenseReportFilterDto) {
    return this.reportsService.generateExpenseReport(filters);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard quick overview with key metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@Query() filters: DashboardFilterDto) {
    return this.reportsService.generateDashboard(filters);
  }
}
