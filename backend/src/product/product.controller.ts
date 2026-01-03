import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

@ApiTags('Product')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('product')
export class ProductController {
  constructor(private svc: ProductService) {}

  @Post()
  @Permissions('product.create')
  create(@Body() dto: CreateProductDto,@Req() req) {
    return this.svc.create(dto,req.user);
  }

  @Get()
  @Permissions('product.view')
  @ApiOperation({ summary: 'Get all products with search and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, SKU, or barcode' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'brandId', required: false, description: 'Filter by brand ID' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'subcategoryId', required: false, description: 'Filter by subcategory ID' })
  @ApiQuery({ name: 'origin', required: false, description: 'Filter by origin' })
  @ApiQuery({ name: 'hasExpiry', required: false, description: 'Filter products with expiry dates (true/false)' })

  @ApiQuery({ name: 'product_type', required: false, description: 'Filter by product type (supports comma-separated values)' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('brandId') brandId?: number,
    @Query('supplierId') supplierId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('subcategoryId') subcategoryId?: number,
    @Query('origin') origin?: string,
    @Query('hasExpiry') hasExpiry?: boolean,
    @Query('product_type') product_type?: string,
  ) {
    return this.svc.findAll(
      search,
      Number(page),
      Number(limit),
      brandId ? Number(brandId) : undefined,
      supplierId ? Number(supplierId) : undefined,
      categoryId ? Number(categoryId) : undefined,
      subcategoryId ? Number(subcategoryId) : undefined,
      origin,
      hasExpiry,
      product_type,
    );
  }

  @Get(':id')
  @Permissions('product.view')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }

  @Patch(':id')
  @Permissions('product.update')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.update(+id, dto);
  }

  @Delete(':id')
  @Permissions('product.delete')
  remove(@Param('id') id: string) {
    return this.svc.remove(+id);
  }

  // Brand and supplier query endpoints
  @Get('brand/:brandId')
  @Permissions('product.view')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findByBrand(
    @Param('brandId') brandId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.svc.findByBrand(Number(brandId), Number(page), Number(limit));
  }

  @Get('supplier/:supplierId')
  @Permissions('product.view')
  @ApiOperation({ summary: 'Get products by supplier' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findBySupplier(
    @Param('supplierId') supplierId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.svc.findBySupplier(Number(supplierId), Number(page), Number(limit));
  }

  @Get('origin/:origin')
  @Permissions('product.view')
  @ApiOperation({ summary: 'Get products by origin' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findByOrigin(
    @Param('origin') origin: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.svc.findByOrigin(origin, Number(page), Number(limit));
  }

  // Product type query endpoints
}
