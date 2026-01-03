import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

@ApiBearerAuth()
@ApiTags('Category')
@ApiBearerAuth('token')
@Controller('category')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoryController {
  constructor(private service: CategoryService) {}

  // Create Main Category
  @Post()
  @Permissions('category.create')
  @ApiOperation({ summary: 'Create a new main category' })
  async create(@Body() dto: CreateCategoryDto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  @Post('sub-category')
  @Permissions('category.create')
  @ApiOperation({ summary: 'Create a new subcategory' })
  async createSubCategory(@Body() dto: CreateSubCategoryDto, @Req() req) {
    return this.service.createSubCategory(dto, req.user);
  }

  // Get all categories
  @Get()
  @Permissions('category.view')
  async findAll() {
    return this.service.findAll();
  }

  // Get nested category tree
  @Get('tree')
  @Permissions('category.view')
  async getTree() {
    return this.service.getTree();
  }

  // Get category by ID
  @Get(':id')
  @Permissions('category.view')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  // Get subcategories by category ID
  @Get(':id/subcategories')
  @Permissions('category.view')
  @ApiOperation({ summary: 'Get subcategories under a main category' })
  @ApiResponse({ status: 200, description: 'List of subcategories returned.' })
  async getSubcategoriesByCategory(@Param('id') id: string) {
    return this.service.getSubcategoriesByCategory(id);
  }

  // Update category
  @Patch(':id')
  @Permissions('category.update')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  // Delete category (with subcategories)
  @Delete(':id')
  @Permissions('category.delete')
  @ApiOperation({ summary: 'Delete a category and its subcategories' })
  async delete(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Update subcategory
  @Patch('sub-category/:id')
  @Permissions('category.update')
  @ApiOperation({ summary: 'Update an existing subcategory' })
  async updateSubCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto, // or UpdateSubCategoryDto (recommended)
  ) {
    return this.service.updateSubCategory(id, dto);
  }

  // Delete subcategory
  @Delete('sub-category/:id')
  @Permissions('category.delete')
  @ApiOperation({ summary: 'Delete a subcategory' })
  async removeSubCategory(@Param('id') id: string) {
    return this.service.removeSubCategory(id);
  }
}
