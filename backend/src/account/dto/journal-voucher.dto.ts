import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class JournalLineDto {
  @ApiProperty({ example: 'ASSET.CASH', description: 'Account code to debit or credit' })
  @IsString()
  @IsNotEmpty()
  account_code: string;

  @ApiProperty({ example: 5000, description: 'Debit amount' })
  @IsNumber()
  @Min(0)
  debit: number;

  @ApiProperty({ example: 0, description: 'Credit amount' })
  @IsNumber()
  @Min(0)
  credit: number;

  @ApiProperty({ example: 'Cash received', description: 'Details of the journal entry' })
  @IsString()
  @IsNotEmpty()
  narration: string;
}

export class JournalVoucherDto {
  @ApiProperty({
    type: [JournalLineDto],
    description: 'List of journal lines (must be balanced: total debit = total credit)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];

  @ApiProperty({
    example: 'manual_journal',
    description: 'Transaction source reference (e.g. purchase, payment, adjustment)',
  })
  @IsString()
  @IsNotEmpty()
  reference_type: string;

  @ApiProperty({
    example: 0,
    description: 'Reference record id (e.g. purchase_id, payment_id). Use 0 if not related',
  })
  @IsNumber()
  reference_id: number;
}
