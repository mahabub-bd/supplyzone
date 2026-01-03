import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateQuotationStatusDto {
  @ApiProperty({
    description: 'New status for the quotation',
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
    example: 'accepted',
  })
  @IsEnum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'])
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

  @ApiPropertyOptional({
    description: 'Reason or notes for status change',
    example: 'Customer accepted the quotation via phone',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}