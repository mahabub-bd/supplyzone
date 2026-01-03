import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DiscountType, QuotationItemDto } from './quotation-item.dto';

export class CreateQuotationDto {
  @ApiProperty({
    description: 'List of products being quoted',
    type: [QuotationItemDto],
    example: [
      {
        product_id: 1,
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];

  @ApiPropertyOptional({
    description:
      'Quotation-level discount type: "fixed" for fixed amount or "percentage" for percentage discount',
    example: 'fixed',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType;

  @ApiPropertyOptional({
    description:
      'Quotation-level discount value. Applied to entire quotation after item discounts. If type is "percentage", this is % (e.g., 10 = 10%). If type is "fixed", this is amount (e.g., 1750)',
    example: 1750,
  })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiPropertyOptional({
    description:
      'Quotation-level tax percentage. Applied to entire quotation after discounts (e.g., 15 = 15% VAT). If 0 or not provided, no tax is applied',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;

  @ApiPropertyOptional({
    description: 'Customer ID for the quotation',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  customer_id?: number;

  @ApiPropertyOptional({
    description:
      'Custom quotation number (optional). Auto-generates if not provided.',
    example: 'QN-2025-0001',
  })
  @IsOptional()
  @IsString()
  quotation_no?: string;

  @ApiPropertyOptional({
    description: 'Branch ID where the quotation is created',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Valid until date for the quotation',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiPropertyOptional({
    description: 'Additional terms and conditions for the quotation',
    example: 'Payment terms: 50% advance, 50% on delivery',
  })
  @IsOptional()
  @IsString()
  terms_and_conditions?: string;

  @ApiPropertyOptional({
    description: 'Notes or internal comments about the quotation',
    example: 'Follow up with customer next week',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Initial status of the quotation',
    enum: ['draft', 'sent'],
    example: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'sent'])
  status?: 'draft' | 'sent';
}
