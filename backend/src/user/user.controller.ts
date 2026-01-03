import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Permissions } from '../decorator/permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('token')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private service: UserService) {}

  // CREATE USER
  @Post()
  @Permissions('user.create')
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  // GET ALL USERS
  @Get()
  @Permissions('user.view')
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.service.findAll();
  }

  // GET ONE USER
  @Get(':id')
  @Permissions('user.view')
  @ApiOperation({ summary: 'Get a specific user' })
  findOne(@Param('id') id: number) {
    return this.service.findById(id);
  }

  // UPDATE USER
  @Patch(':id')
  @Permissions('user.update')
  @ApiOperation({ summary: 'Update user info' })
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  // DELETE USER
  @Delete(':id')
  @Permissions('user.delete')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
