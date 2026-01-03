import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierService } from './supplier.service';
@ApiTags('Supplier')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Post()
  @Permissions('suppliers.create')
  async create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }
  @Permissions('suppliers.view')
  @Get()
  async findAll() {
    return this.supplierService.findAll();
  }
  @Permissions('suppliers.view')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.supplierService.findOne(id);
  }
  @Permissions('suppliers.update')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }
  @Permissions('suppliers.delete')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.supplierService.remove(id);
  }
}
