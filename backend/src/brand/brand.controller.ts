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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
@ApiTags('Brand')
@ApiBearerAuth('token')
@Controller('brand')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Permissions('brand.create')
  @ApiOperation({
    summary: 'Create a new brand (use attachment ID from upload)',
  })
  async createBrand(@Body() dto: CreateBrandDto, @Req() req: any) {
    return await this.brandService.create(dto, req.user.id);
  }
  @Permissions('brand.view')
  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  async findAll() {
    return await this.brandService.findAll();
  }
  @Permissions('brand.view')
  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  async findOne(@Param('id') id: string) {
    return await this.brandService.findOne(id);
  }
  @Permissions('brand.update')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update brand (send new logo_attachment_id if updating image)',
  })
  async updateBrand(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return await this.brandService.update(id, dto);
  }
  @Permissions('brand.delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  async deleteBrand(@Param('id') id: string) {
    return await this.brandService.remove(id);
  }
}