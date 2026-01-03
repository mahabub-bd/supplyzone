import { ApiProperty } from '@nestjs/swagger';

export class MinimalApprovalStatusDto {
  @ApiProperty({ example: 4 })
  leaveId: number;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 1 })
  currentApprovalLevel: number;

  @ApiProperty({ example: 1 })
  totalApprovalLevels: number;

  @ApiProperty({ example: false })
  isFullyApproved: boolean;

  @ApiProperty({ example: 2 })
  currentApproverId?: number;

  @ApiProperty({ example: 'Arif Hassan' })
  currentApproverName?: string;

  @ApiProperty({ example: 'annual' })
  leaveType: string;

  @ApiProperty({ example: '2025-12-27' })
  startDate: string;

  @ApiProperty({ example: '2025-12-30' })
  endDate: string;

  @ApiProperty({ example: 3 })
  daysCount: number;

  @ApiProperty({ example: 'Imran Khan' })
  employeeName: string;
}