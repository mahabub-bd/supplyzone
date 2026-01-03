import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateQuotationDto {
  @ApiPropertyOptional({
    description: 'List of products being quoted',
    type: [QuotationItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];

  @ApiPropertyOptional({
    description:
      'Quotation-level discount type: "fixed" for fixed amount or "percentage" for percentage discount',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType;

  @ApiPropertyOptional({
    description:
      'Quotation-level discount value. Applied to entire quotation after item discounts. If type is "percentage", this is % (e.g., 10 = 10%). If type is "fixed", this is amount (e.g., 1750)',
  })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiPropertyOptional({
    description:
      'Quotation-level tax percentage. Applied to entire quotation after discounts (e.g., 15 = 15% VAT). If 0 or not provided, no tax is applied',
  })
  @IsOptional()
  @IsNumber()
  tax_percentage?: number;

  @ApiPropertyOptional({
    description: 'Customer ID for the quotation',
  })
  @IsOptional()
  @IsInt()
  customer_id?: number;

  @ApiPropertyOptional({
    description: 'Branch ID where the quotation is created',
  })
  @IsOptional()
  @IsInt()
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Valid until date for the quotation',
  })
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiPropertyOptional({
    description: 'Additional terms and conditions for the quotation',
  })
  @IsOptional()
  @IsString()
  terms_and_conditions?: string;

  @ApiPropertyOptional({
    description: 'Notes or internal comments about the quotation',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Status of the quotation',
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
  })
  @IsOptional()
  @IsEnum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'])
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
}