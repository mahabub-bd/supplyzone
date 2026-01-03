import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '../enums/purchase-order-status.enum';
import { PaymentTerm } from '../enums/payment-term.enum';

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({ description: 'Quantity to order' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiPropertyOptional({ description: 'Discount per unit', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_per_unit?: number;

  @ApiPropertyOptional({ description: 'Tax rate percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_rate?: number;
}

export class CreatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Purchase Order Number (auto-generated from backend)', example: 'PO-2025-001', readOnly: true })
  @IsOptional()
  @IsString()
  po_no?: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  @IsNotEmpty()
  supplier_id: number;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  @IsNotEmpty()
  warehouse_id: number;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expected_delivery_date?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms_and_conditions?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: PaymentTerm, description: 'Payment terms', default: PaymentTerm.NET_30 })
  @IsOptional()
  @IsEnum(PaymentTerm)
  payment_term?: PaymentTerm;

  @ApiPropertyOptional({ description: 'Custom payment days (required when payment_term is CUSTOM)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  custom_payment_days?: number;

  @ApiPropertyOptional({ enum: PurchaseOrderStatus, description: 'Purchase Order status', default: PurchaseOrderStatus.DRAFT })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ description: 'Tax amount (calculated automatically if not provided)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Paid amount (advance payment)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paid_amount?: number;

  @ApiProperty({ type: [PurchaseOrderItemDto], description: 'Purchase Order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}