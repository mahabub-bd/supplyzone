import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddBankBalanceDto {
  @ApiProperty({ example: 'ASSET.BANK_IBBL', description: 'Bank account code' })
  @IsString()
  @IsNotEmpty()
  bankAccountCode: string;

  @ApiProperty({ example: 100000, description: 'Amount to be added' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Capital injection into IBBL account'      })
  @IsString()
  narration: string;
}
