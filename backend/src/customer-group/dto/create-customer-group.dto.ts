import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCustomerGroupDto {
  @ApiProperty({
    description: 'Name of the customer group',
    example: 'VIP Customers',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the customer group',
    example: 'High-value customers with special discounts',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Discount percentage for this group (0-100)',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;

  @ApiPropertyOptional({
    description: 'Status of the customer group',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}