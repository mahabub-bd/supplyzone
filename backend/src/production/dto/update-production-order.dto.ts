import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductionOrderStatus, ProductionPriority } from '../entities/production-order.entity';

export class UpdateProductionOrderItemDto {
  @ApiProperty({
    description: 'Production Order Item ID',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Planned quantity to produce',
    example: 1200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  planned_quantity?: number;

  @ApiProperty({
    description: 'Actual quantity produced',
    example: 1150,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  actual_quantity?: number;

  @ApiProperty({
    description: 'Quantity of good items (quality passed)',
    example: 1130,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  good_quantity?: number;

  @ApiProperty({
    description: 'Quantity of defective items',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  defective_quantity?: number;

  @ApiProperty({
    description: 'Unit cost per item',
    example: 445.75,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @ApiProperty({
    description: 'Actual cost incurred',
    example: 512662.50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  actual_cost?: number;

  @ApiProperty({
    description: 'Production specifications',
    example: 'Updated specifications with premium materials',
    required: false,
  })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({
    description: 'Quality control notes',
    example: 'All items passed final QC inspection',
    required: false,
  })
  @IsOptional()
  @IsString()
  quality_notes?: string;

  @ApiProperty({
    description: 'Batch number for this production run',
    example: 'BATCH-S24-2025-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  batch_number?: string;

  @ApiProperty({
    description: 'Serial number range',
    example: 'SN001000-SN002150',
    required: false,
  })
  @IsOptional()
  @IsString()
  serial_number_range?: string;

  @ApiProperty({
    description: 'Expiry date (if applicable)',
    example: '2028-02-28',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}

export class UpdateProductionOrderDto {
  @ApiProperty({
    description: 'Production Order title',
    example: 'Updated Samsung Galaxy S24 Production Batch',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Updated description',
    example: 'Updated production of 1200 units of Samsung Galaxy S24',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Brand ID',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiProperty({
    description: 'Target warehouse ID',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  warehouse_id?: number;

  @ApiProperty({
    description: 'Production Order status',
    enum: ProductionOrderStatus,
    example: ProductionOrderStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @ApiProperty({
    description: 'Production priority',
    enum: ProductionPriority,
    example: ProductionPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductionPriority)
  priority?: ProductionPriority;

  @ApiProperty({
    description: 'Planned start date',
    example: '2025-01-26T09:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  planned_start_date?: string;

  @ApiProperty({
    description: 'Planned completion date',
    example: '2025-02-08T18:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  planned_completion_date?: string;

  @ApiProperty({
    description: 'Actual start date',
    example: '2025-01-26T08:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  actual_start_date?: string;

  @ApiProperty({
    description: 'Actual completion date',
    example: '2025-02-07T16:45:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  actual_completion_date?: string;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assigned_to?: number;

  @ApiProperty({
    description: 'Production order notes',
    example: 'Updated special packaging requirements',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Production order items to update',
    type: [UpdateProductionOrderItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductionOrderItemDto)
  items?: UpdateProductionOrderItemDto[];
}