import { ApiProperty } from '@nestjs/swagger';

export class RoleInfoDto {
  @ApiProperty({ example: 1, description: 'Role ID' })
  id: number;

  @ApiProperty({ example: 'superadmin', description: 'Role name' })
  name: string;

  @ApiProperty({ example: 'All Access', description: 'Role description' })
  description: string;
}

export class BranchInfoDto {
  @ApiProperty({ example: 1, description: 'Branch ID' })
  id: number;

  @ApiProperty({ example: 'BR-001', description: 'Branch code' })
  code: string;

  @ApiProperty({ example: 'Main Branch', description: 'Branch name' })
  name: string;

  @ApiProperty({ example: true, description: 'Whether the branch is active' })
  is_active: boolean;
}

export class UserInfoDto {
  @ApiProperty({ example: 5, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'superadmin', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'superadmin@gmail.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'Super Admin', description: 'Full name' })
  full_name: string;

  @ApiProperty({ example: '01711852202', description: 'Phone number' })
  phone: string;

  @ApiProperty({
    type: [RoleInfoDto],
    description: 'User roles with permissions',
  })
  roles: RoleInfoDto[];

  @ApiProperty({
    type: [BranchInfoDto],
    description: 'Branches assigned to user (essential fields only)',
  })
  branches: BranchInfoDto[];

  @ApiProperty({ example: 'active', description: 'Account status' })
  status: string;

  @ApiProperty({
    example: '2025-12-30T13:28:35.081Z',
    description: 'Last login timestamp',
  })
  last_login_at: Date;

  @ApiProperty({
    example: '2025-11-17T18:36:37.027Z',
    description: 'Account creation timestamp',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-12-30T07:28:36.486Z',
    description: 'Last update timestamp',
  })
  updated_at: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 201,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Created successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    type: UserInfoDto,
    description: 'User information with roles and branches',
  })
  user: UserInfoDto;
}
