import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDate, IsBoolean, IsNumber } from 'class-validator';
import { DelegationType } from '../entities/approval-delegation.entity';

export class UpdateApprovalDelegationDto {
  @ApiProperty({
    description: 'Type of approval being delegated',
    enum: DelegationType,
    example: DelegationType.LEAVE_APPROVAL,
    required: false,
  })
  @IsEnum(DelegationType)
  @IsOptional()
  delegationType?: DelegationType;

  @ApiProperty({
    description: 'Start date of delegation',
    example: '2024-01-01',
    type: Date,
    required: false,
  })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date of delegation',
    example: '2024-01-31',
    type: Date,
    required: false,
  })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Reason for delegation',
    example: 'On vacation',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Is delegation currently active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Can this delegation be used multiple times',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isReusable?: boolean;

  @ApiProperty({
    description: 'Maximum number of approvals can be delegated',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  maxApprovals?: number;
}