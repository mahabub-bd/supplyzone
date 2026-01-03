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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagService } from './tag.service';

@ApiTags('Tag')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @Permissions('tag.create')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @Get()
  @Permissions('tag.view')
  @ApiOperation({ summary: 'Retrieve all tags' })
  @ApiResponse({ status: 200, description: 'Returns list of tags' })
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  @Permissions('tag.view')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('tag.update')
  @ApiOperation({ summary: 'Update tag by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagService.update(+id, dto);
  }

  @Delete(':id')
  @Permissions('tag.delete')
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
