import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpdateDateColumn } from 'typeorm';

export class CreateUserDto {
  @ApiProperty({ example: 'mahabub' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Mahabub Hossain' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'StrongPassword123!@#' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Array of role names to assign',
    example: ['admin', 'staff'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  roles?: string[];

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
