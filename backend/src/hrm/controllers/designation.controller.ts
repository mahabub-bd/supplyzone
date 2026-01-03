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
import { CreateDesignationDto } from '../dto/create-designation.dto';
import { UpdateDesignationDto } from '../dto/update-designation.dto';
import { Designation, DesignationLevel } from '../entities/designation.entity';
import { DesignationService } from '../services/designation.service';

@ApiTags('HRM - Designations')
@Controller('designations')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @Permissions('designation.create')
  @ApiOperation({ summary: 'Create a new designation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Designation successfully created.',
    type: Designation,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Designation code already exists.',
  })
  async create(@Body() createDesignationDto: CreateDesignationDto) {
    return {
      success: true,
      message: 'Designation created successfully',
      data: await this.designationService.create(createDesignationDto),
    };
  }

  @Get()
  @Permissions('designation.view')
  @ApiOperation({ summary: 'Get all designations' })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: DesignationLevel,
    description: 'Filter by designation level',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Designations retrieved successfully.',
  })
  async findAll(
    @Query('level') level?: DesignationLevel,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.designationService.findAll({
      level,
      isActive,
      page: page || 1,
      limit: limit || 16,
    });

    return {
      success: true,
      message: 'Designations retrieved successfully',
      ...result,
    };
  }

  @Get('hierarchy')
  @Permissions('designation.view')
  @ApiOperation({ summary: 'Get designation hierarchy tree' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Designation hierarchy retrieved successfully.',
  })
  async getHierarchy() {
    const hierarchy = await this.designationService.getHierarchy();

    return {
      success: true,
      message: 'Designation hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  @Get(':id')
  @Permissions('designation.view')
  @ApiOperation({ summary: 'Get designation by ID' })
  @ApiParam({
    name: 'id',
    description: 'Designation ID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Designation retrieved successfully.',
    type: Designation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Designation not found.',
  })
  async findOne(@Param('id') id: number) {
    const designation = await this.designationService.findOne(id);

    return {
      success: true,
      message: 'Designation retrieved successfully',
      data: designation,
    };
  }

  @Patch(':id')
  @Permissions('designation.update')
  @ApiOperation({ summary: 'Update designation' })
  @ApiParam({
    name: 'id',
    description: 'Designation ID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Designation updated successfully.',
    type: Designation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Designation not found.',
  })
  async update(
    @Param('id') id: number,
    @Body() updateDesignationDto: UpdateDesignationDto,
  ) {
    const designation = await this.designationService.update(
      id,
      updateDesignationDto,
    );

    return {
      success: true,
      message: 'Designation updated successfully',
      data: designation,
    };
  }

  @Delete(':id')
  @Permissions('designation.delete')
  @ApiOperation({ summary: 'Delete designation' })
  @ApiParam({
    name: 'id',
    description: 'Designation ID',
    type: Number,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Designation deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Designation not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete designation with assigned employees.',
  })
  async remove(@Param('id') id: number) {
    await this.designationService.remove(id);

    return {
      success: true,
      message: 'Designation deleted successfully',
    };
  }

  @Post(':id/assign-employee/:employeeId')
  @Permissions('designation.update')
  @ApiOperation({ summary: 'Assign employee to designation' })
  @ApiParam({
    name: 'id',
    description: 'Designation ID',
    type: Number,
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee assigned to designation successfully.',
  })
  async assignEmployee(
    @Param('id') id: number,
    @Param('employeeId') employeeId: number,
  ) {
    await this.designationService.assignEmployeeToDesignation(id, employeeId);

    return {
      success: true,
      message: 'Employee assigned to designation successfully',
    };
  }

  @Get('by-level/:level')
  @Permissions('designation.view')
  @ApiOperation({ summary: 'Get designations by level' })
  @ApiParam({
    name: 'level',
    description: 'Designation level',
    enum: DesignationLevel,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Designations retrieved successfully.',
  })
  async findByLevel(@Param('level') level: DesignationLevel) {
    const designations = await this.designationService.findByLevel(level);

    return {
      success: true,
      message: 'Designations retrieved successfully',
      data: designations,
    };
  }
}
