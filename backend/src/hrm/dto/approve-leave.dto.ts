import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ApproveLeaveDto {
  @ApiProperty({
    description: 'Comments from the approver',
    example: 'Approved as requested. Enjoy your leave!',
    required: false,
  })
  @IsString()
  @IsOptional()
  approverNotes?: string;
}