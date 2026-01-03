import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RejectLeaveDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Insufficient staff coverage during requested period',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  rejectionReason: string;
}