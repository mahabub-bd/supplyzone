import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiProperty({ example: 'Administrator access' })
  description: string;
}

export class BranchResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'BR-001' })
  code: string;

  @ApiProperty({ example: 'Main Branch' })
  name: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ required: false })
  created_at?: Date;

  @ApiProperty({ required: false })
  updated_at?: Date;
}

export class UserResponseDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ type: [RoleResponseDto] })
  roles: RoleResponseDto[];

  @ApiProperty({ type: [BranchResponseDto] })
  branches: BranchResponseDto[];

  @ApiProperty()
  status: string;

  @ApiProperty()
  last_login_at: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
