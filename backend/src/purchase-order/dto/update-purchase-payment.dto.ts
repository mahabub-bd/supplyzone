import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdatePurchasePaymentDto {
  @ApiProperty({
    description: 'Payment amount to add',
    example: 250.0,
  })
  @IsNumber()
  @Min(0.01)
  payment_amount: number;
}
