import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BillingAddressDto } from './billing-address.dto';
import { ShippingAddressDto } from './shipping-address.dto';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Mahabub Hossain' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '01700000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'email@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Customer group ID'
  })
  @IsOptional()
  @IsInt()
  group_id?: number;

  @ApiPropertyOptional({
    description: 'Billing address information',
    type: () => BillingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billing_address?: BillingAddressDto;

  @ApiPropertyOptional({
    description: 'Shipping address information',
    type: () => ShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address?: ShippingAddressDto;
}
