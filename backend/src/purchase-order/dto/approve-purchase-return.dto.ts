import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApprovePurchaseReturnDto {
  @ApiPropertyOptional({
    description: 'Notes about approval decision',
    example: 'Items verified as defective - approval granted',
  })
  @IsOptional()
  @IsString()
  approval_notes?: string;
}
