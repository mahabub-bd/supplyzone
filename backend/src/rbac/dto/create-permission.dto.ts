import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user.create' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Allow creating users', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
