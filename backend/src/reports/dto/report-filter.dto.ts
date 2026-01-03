import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum ReportType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  PROFIT_LOSS = 'profit_loss',
  STOCK = 'stock',
  PRODUCT = 'product',
  SUMMARY = 'summary',
  EMPLOYEE = 'employee',
  EXPENSE = 'expense',
}

export enum DateRangeType {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export enum GroupByType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  PRODUCT = 'product',
  CATEGORY = 'category',
  CUSTOMER = 'customer',
  EMPLOYEE = 'employee',
  BRANCH = 'branch',
  SUPPLIER = 'supplier',
}

export class ReportFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Start date for custom range (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom range (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Start date for custom range (alias for fromDate, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for custom range (alias for toDate, YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ enum: DateRangeType, description: 'Predefined date range' })
  @IsOptional()
  @IsEnum(DateRangeType)
  dateRange?: DateRangeType;

  @ApiPropertyOptional({ enum: GroupByType, description: 'How to group the data' })
  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType;

  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  branch_id?: number;

  @ApiPropertyOptional({ description: 'Filter by warehouse ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customer_id?: number;

  @ApiPropertyOptional({ description: 'Filter by supplier ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplier_id?: number;

  @ApiPropertyOptional({ description: 'Filter by employee/user ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  employee_id?: number;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  product_id?: number;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({ description: 'Filter by brand ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brand_id?: number;

  @ApiPropertyOptional({ description: 'Filter by expense category ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expense_category_id?: number;

  @ApiPropertyOptional({ description: 'Include comparison with previous period' })
  @IsOptional()
  includeComparison?: boolean;

  @ApiPropertyOptional({ description: 'Format type for export' })
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv' | 'xlsx' | 'pdf';
}
