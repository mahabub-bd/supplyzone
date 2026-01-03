import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { Department, DepartmentStatus } from '../entities/department.entity';
import { DepartmentService } from '../services/department.service';
@ApiTags('HRM - Departments')
@Controller('departments')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Permissions('department.create')
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department successfully created.',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Department already exists.',
  })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @Permissions('department.view')
  @ApiOperation({ summary: 'Get all departments with optional filters' })
 
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive'],
    description: 'Filter by department status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search departments by name or description',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Departments retrieved successfully.',
    type: [Department],
  })
  async findAll(
    @Query()
    filters: {
      branch_id?: string;
      status?: DepartmentStatus;
      search?: string;
    },
  ) {
    return await this.departmentService.findAll(filters);
  }

  @Get(':id')
  @Permissions('department.view')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department retrieved successfully.',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found.',
  })
  async findById(@Param('id') id: number) {
    return await this.departmentService.findById(id);
  }

  @Patch(':id')
  @Permissions('department.update')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department successfully updated.',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found.',
  })
  async update(
    @Param('id') id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return await this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Permissions('department.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department (soft delete)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Department successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete department with employees.',
  })
  async delete(@Param('id') id: number) {
    return await this.departmentService.delete(id);
  }

  @Patch(':id/restore')
  @Permissions('department.update')
  @ApiOperation({ summary: 'Restore deleted department' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department successfully restored.',
    type: Department,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Department not found.',
  })
  async restore(@Param('id') id: number) {
    return await this.departmentService.restore(id);
  }

  

  @Get(':id/employee-count')
  @Permissions('department.view')
  @ApiOperation({ summary: 'Get employee count for a department' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Department ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee count retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        total_employees: { type: 'number' },
        active_employees: { type: 'number' },
      },
    },
  })
  async getEmployeeCount(@Param('id') id: number) {
    return await this.departmentService.getEmployeeCount(id);
  }
}
