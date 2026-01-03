import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ProductionOrderStatus,
  ProductionPriority,
} from '../entities/production-order.entity';

export class ProductionQueryDto {
  @ApiProperty({
    description: 'Search term (searches in title, description, order number)',

    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ProductionOrderStatus,
    example: ProductionOrderStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @ApiProperty({
    description: 'Filter by priority',
    enum: ProductionPriority,
    example: ProductionPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductionPriority)
  priority?: ProductionPriority;

  @ApiProperty({
    description: 'Filter by brand ID',

    required: false,
  })
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiProperty({
    description: 'Filter by warehouse ID',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  warehouse_id?: number;

  @ApiProperty({
    description: 'Filter by assigned user ID',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  assigned_to?: number;

  @ApiProperty({
    description: 'Filter by created by user ID',
    example: 5,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  created_by?: number;

  @ApiProperty({
    description: 'Filter by start date from',
    
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @ApiProperty({
    description: 'Filter by start date to',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date_to?: string;

  @ApiProperty({
    description: 'Filter by completion date from',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  completion_date_from?: string;

  @ApiProperty({
    description: 'Filter by completion date to',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  completion_date_to?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  page?: number;

  @ApiProperty({
    description: 'Items per page for pagination',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  limit?: number;
}
