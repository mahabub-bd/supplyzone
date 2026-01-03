import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { UserStatus } from 'src/common/enum';
import { UpdateDateColumn } from 'typeorm';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsEnum(UserStatus, {
    message: `status must be one of: pending, active, suspend, deactive`,
  })
  status?: UserStatus;

  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Array of branch IDs to assign',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  branch_ids?: number[];

  @UpdateDateColumn({ nullable: true, type: 'timestamp with time zone' })
  last_login_at: Date;
}
