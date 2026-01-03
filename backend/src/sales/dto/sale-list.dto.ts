import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SaleListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by sale type',
    enum: ['pos', 'regular'],
  })
  @IsOptional()
  @IsString()
  saleType?: 'pos' | 'regular';

  @ApiPropertyOptional({
    description: 'Filter by sale status',
    enum: ['held', 'completed', 'refunded', 'partial_refund', 'draft'],
    example: 'completed',
  })
  @IsOptional()
  @IsString()
  status?: 'held' | 'completed' | 'refunded' | 'partial_refund' | 'draft';

  @ApiPropertyOptional({
    description: 'Filter by branch ID',
    example: 1,
  })
  @IsOptional()
  branch_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by customer ID',
    example: 1,
  })
  @IsOptional()
  customer_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}