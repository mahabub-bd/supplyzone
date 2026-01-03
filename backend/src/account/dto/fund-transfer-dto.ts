import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FundTransferDto {
    @ApiProperty({ example: 'ASSET.CASH', description: 'From Account Code' })
    @IsString()
    @IsNotEmpty()
    fromAccountCode: string;

    @ApiProperty({ example: 'ASSET.BANK_IBBL', description: 'To Account Code' })
    @IsString()
    @IsNotEmpty()
    toAccountCode: string;

    @ApiProperty({ example: 50000 })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'Cash to IBBL Bank transfer' })
    @IsString()
    @IsNotEmpty()
    narration: string;
}
