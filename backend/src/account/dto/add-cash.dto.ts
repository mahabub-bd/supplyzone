import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class AddCashDto {
  @ApiProperty({
    example: 10000,
    description: 'Amount of cash being added to the business (must be greater than zero)',
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than zero' })
  amount: number;



  @ApiProperty({
    example: 'Business Capital Injection',
    description: 'Reason or source of the cash being added',
  })
  @IsString()
  narration: string;
}
