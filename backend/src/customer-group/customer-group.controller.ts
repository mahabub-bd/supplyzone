import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CustomerGroupService } from './customer-group.service';
import { CreateCustomerGroupDto } from './dto/create-customer-group.dto';
import { UpdateCustomerGroupDto } from './dto/update-customer-group.dto';
import { CustomerGroup } from './entities/customer-group.entity';

@ApiTags('Customer Groups')
@ApiBearerAuth('token')
@Controller('customer-groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomerGroupController {
  constructor(private readonly customerGroupService: CustomerGroupService) {}

  @Post()
  @Permissions('customergroup.create')
  @ApiOperation({ summary: 'Create a new customer group' })
  @ApiOkResponse({
    description: 'Customer group created successfully',
    type: CustomerGroup,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateCustomerGroupDto) {
    return this.customerGroupService.create(dto);
  }

  @Get()
  @Permissions('customergroup.view')
  @ApiOperation({ summary: 'Get all customer groups' })
  @ApiOkResponse({
    description: 'List of customer groups',
    type: [CustomerGroup],
  })
  async findAll() {
    return this.customerGroupService.findAll();
  }

  @Get(':id')
  @Permissions('customergroup.view')
  @ApiOperation({ summary: 'Get customer group by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Customer Group ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Customer group details',
    type: CustomerGroup,
  })
  @ApiResponse({ status: 404, description: 'Customer group not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerGroupService.findOne(id);
  }

  @Patch(':id')
  @Permissions('customergroup.update')
  @ApiOperation({ summary: 'Update customer group' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Customer Group ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Customer group updated successfully',
    type: CustomerGroup,
  })
  @ApiResponse({ status: 404, description: 'Customer group not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerGroupDto,
  ) {
    return this.customerGroupService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('customergroup.delete')
  @ApiOperation({ summary: 'Delete customer group' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Customer Group ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Customer group deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer group not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.customerGroupService.remove(id);
  }
}
