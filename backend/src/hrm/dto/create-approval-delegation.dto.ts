import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DelegationType } from '../entities/approval-delegation.entity';

export class CreateApprovalDelegationDto {
  @ApiProperty({
    description: 'Employee who is delegating approval authority',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  delegatorId: number;

  @ApiProperty({
    description: 'Employee who is receiving approval authority',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  delegateeId: number;

  @ApiProperty({
    description: 'Type of approval being delegated',
    enum: DelegationType,
    example: DelegationType.LEAVE_APPROVAL,
  })
  @IsEnum(DelegationType)
  @IsNotEmpty()
  delegationType: DelegationType;

  @ApiProperty({
    description: 'Start date of delegation',
    example: '2024-01-01',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date of delegation',
    example: '2024-01-31',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

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

  @ApiProperty({
    description: 'Branch where this delegation applies',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  branch_id: number;
}
