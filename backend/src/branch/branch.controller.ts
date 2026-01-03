import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
@ApiTags('Branches')
@Controller('branches')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Permissions('branch.create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiCreatedResponse({ description: 'Branch created successfully' })
  @ApiBody({ type: CreateBranchDto })
  create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  @Permissions('branch.view')
  @ApiOperation({ summary: 'Get all branches' })
  @ApiOkResponse({ description: 'List of branches retrieved successfully' })
  findAll() {
    return this.branchService.findAll();
  }

  @Get(':id')
  @Permissions('branch.view')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch ID', example: 1 })
  @ApiOkResponse({ description: 'Branch retrieved successfully' })
  findOne(@Param('id') id: number) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  @Permissions('branch.update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch ID', example: 1 })
  @ApiOkResponse({ description: 'Branch updated successfully' })
  @ApiBody({ type: UpdateBranchDto })
  update(@Param('id') id: number, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('branch.delete')
  @ApiOperation({ summary: 'Delete branch' })
  @ApiParam({ name: 'id', description: 'Branch ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Branch deleted successfully' })
  remove(@Param('id') id: number) {
    return this.branchService.remove(id);
  }
}
