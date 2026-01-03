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
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';

@ApiTags('Warehouse')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private svc: WarehouseService) {}

  @Post()
  @Permissions('warehouse.create')
  create(@Body() dto: CreateWarehouseDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Permissions('warehouse.view')
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @Permissions('warehouse.view')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }

  @Patch(':id')
  @Permissions('warehouse.update')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.svc.update(+id, dto);
  }

  @Delete(':id')
  @Permissions('warehouse.delete')
  remove(@Param('id') id: string) {
    return this.svc.remove(+id);
  }
}
