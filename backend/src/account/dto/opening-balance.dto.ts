import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class OpeningBalanceDto {
  @ApiProperty({
    example: 'ASSET.CASH',
    description: 'Account code where the opening balance will be applied',
  })
  @IsString()
  @IsNotEmpty({ message: 'Account code cannot be empty' })
  account_code: string;

  @ApiProperty({
    example: 50000,
    description: 'Opening balance amount (must be greater than zero)',
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than zero' })
  amount: number;
}
