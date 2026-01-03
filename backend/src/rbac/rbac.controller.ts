import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Role } from 'src/common/enum';
import { Roles } from 'src/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { RoleService } from 'src/roles/roles.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';
import { RbacService } from './rbac.service';

@ApiTags('Role Base Access Control')
@ApiBearerAuth('token')
@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class RbacController {
  constructor(
    private readonly rbacService: RbacService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  @Post('permission')
  @ApiOperation({ summary: 'Create new permission' })
  @ApiBody({ type: CreatePermissionDto })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionService.createPermission(dto);
  }

  @Get('permission')
  @ApiOperation({ summary: 'Get all permissions' })
  async getAllPermissions() {
    return this.permissionService.findAll();
  }
  @Get('permission/:id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  async getPermissionById(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findById(id.toString());
  }

  @Patch('permission/:id')
  @ApiOperation({ summary: 'Update permission' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdatePermissionDto })
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(id.toString(), dto);
  }

  @Delete('permission/:id')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiParam({ name: 'id', type: 'number' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.deletePermission(id.toString());
  }
  @Get('role/:name/permissions')
  @ApiOperation({ summary: 'Get permissions assigned to a role' })
  async getRolePermissions(@Param('name') name: string) {
    const role = await this.roleService.findByName(name);
    if (!role) throw new NotFoundException(`Role "${name}" not found`);
    return role.permissions;
  }

  @Post('role/:roleName/assign')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiBody({
    schema: {
      properties: {
        permissionKeys: {
          type: 'array',
          items: { type: 'string' },
          example: ['user.create', 'user.update'],
        },
      },
    },
  })
  async assignPermissions(
    @Param('roleName') roleName: string,
    @Body('permissionKeys') permissionKeys: string[],
  ) {
    const role = await this.roleService.findByName(roleName);
    if (!role) throw new NotFoundException(`Role "${roleName}" not found`);

    // Fetch permissions
    const permissions = await Promise.all(
      permissionKeys.map(async (key) => {
        const perm = await this.permissionService.findByKey(key);
        if (!perm) {
          throw new NotFoundException(`Permission "${key}" not found`);
        }
        return perm;
      }),
    );

    // Replace existing permissions
    role.permissions = permissions;

    // ✔ Save directly (update instead of create)
    return this.roleService.save(role); // <--- NEW
  }

  @Post('permissions/from-roles')
  @ApiOperation({ summary: 'Get merged permissions for multiple roles' })
  @ApiBody({
    schema: {
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string' },
          example: ['admin', 'staff'],
        },
      },
    },
  })
  async getPermissionsForRoles(@Body('roles') roles: string[]) {
    return this.rbacService.getPermissionsForRoles(roles);
  }
}
