import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseCategoryService } from './expense-category.service';

@ApiTags('Expense Categories')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('expense-categories')
export class ExpenseCategoryController {
  constructor(private readonly categoryService: ExpenseCategoryService) {}

  @Post()
  @Permissions('expensecategory.create')
  @ApiOperation({ summary: 'Create a new expense category' })
  @ApiCreatedResponse({
    type: ExpenseCategory,
    description: 'Expense category successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() dto: CreateExpenseCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @Permissions('expensecategory.view')
  @ApiOperation({ summary: 'Get all expense categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or description' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiOkResponse({
    description: 'Paginated list of expense categories',
    schema: {
      example: {
        data: [],
        meta: {
          total: 100,
          page: 1,
          limit: 50,
          totalPages: 2,
        },
      },
    },
  })
  findAll(@Query() paginationDto: PaginationDto & {
    search?: string;
    isActive?: boolean;
  }) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(':id')
  @Permissions('expensecategory.view')
  @ApiOperation({ summary: 'Get expense category by ID' })
  @ApiOkResponse({
    type: ExpenseCategory,
    description: 'Expense category details',
  })
  @ApiNotFoundResponse({ description: 'Expense category not found' })
  findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Permissions('expensecategory.update')
  @ApiOperation({ summary: 'Update an existing expense category' })
  @ApiOkResponse({
    type: ExpenseCategory,
    description: 'Expense category updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Expense category not found' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  update(@Param('id') id: number, @Body() dto: UpdateExpenseCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('expensecategory.delete')
  @ApiOperation({ summary: 'Delete an expense category' })
  @ApiOkResponse({ description: 'Expense category deleted successfully' })
  @ApiNotFoundResponse({ description: 'Expense category not found' })
  remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }
}
