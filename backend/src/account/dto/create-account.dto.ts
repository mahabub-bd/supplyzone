import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountType } from 'src/common/enum';

export class CreateAccountDto {
  @ApiProperty({ example: '1001', description: 'Account number (unique)' })
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({ example: 'ASSET.CASH' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Cash in Hand' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'asset',
    description: 'Type of the account',
    enum: AccountType,
  })
  @IsEnum(AccountType, {
    message: 'Type must be one of: asset, liability, equity, income, expense',
  })
  type: AccountType;

  // 🔹 Add isCash
  @ApiPropertyOptional({ example: true, description: 'Is this a cash account?' })
  @IsBoolean()
  @IsOptional()
  isCash?: boolean;

  // 🔹 Add isBank
  @ApiPropertyOptional({ example: false, description: 'Is this a bank account?' })
  @IsBoolean()
  @IsOptional()
  isBank?: boolean;
}
