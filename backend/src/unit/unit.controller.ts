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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';
import { UnitService } from './unit.service';

@ApiTags('Units')
@Controller('units')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}
  @Permissions('unit.create')
  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({ status: 201, description: 'Created successfully', type: Unit })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(createUnitDto);
  }
  @Permissions('unit.view')
  @Get()
  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({ status: 200, description: 'Success', type: [Unit] })
  findAll() {
    return this.unitService.findAll();
  }
  @Permissions('unit.view')
  @Get(':id')
  @ApiOperation({ summary: 'Get a unit by ID' })
  @ApiResponse({ status: 200, description: 'Success', type: Unit })
  findOne(@Param('id') id: number) {
    return this.unitService.findOne(id);
  }
  @Permissions('unit.update')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({ status: 200, description: 'Updated successfully', type: Unit })
  update(@Param('id') id: number, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitService.update(id, updateUnitDto);
  }
  @Permissions('unit.delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  remove(@Param('id') id: number) {
    return this.unitService.remove(id);
  }
}
