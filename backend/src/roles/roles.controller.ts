import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth('token')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * CREATE ROLE
   */
  @Post()
  @Permissions('role.create')
  @ApiOperation({ summary: 'Create new role' })
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  /**
   * GET ALL ROLES
   */
  @Get()
  @Permissions('role.view')
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    return this.roleService.findAll();
  }

  /**
   * GET ROLE BY ID
   */
  @Get(':id')
  @Permissions('role.view')
  @ApiOperation({ summary: 'Get a role by ID' })
  async findById(@Param('id') id: string) {
    const role = await this.roleService.findById(id);
    if (!role) throw new NotFoundException(`Role with ID "${id}" not found`);
    return role;
  }

  /**
   * UPDATE ROLE
   */
  @Patch(':id')
  @Permissions('role.update')
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiBody({ type: UpdateRoleDto })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const role = await this.roleService.findById(id);
    if (!role) throw new NotFoundException(`Role with ID "${id}" not found`);

    Object.assign(role, dto);
    return this.roleService.update(id, role); // <— use update method
  }

  /**
   * DELETE ROLE
   */
  @Delete(':id')
  @Permissions('role.delete')
  @ApiOperation({ summary: 'Delete a role by ID' })
  async remove(@Param('id') id: string) {
    const role = await this.roleService.findById(id);
    if (!role) throw new NotFoundException(`Role with ID "${id}" not found`);

    return this.roleService.delete(id);
  }
}
