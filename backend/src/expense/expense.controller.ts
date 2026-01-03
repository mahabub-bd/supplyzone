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
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseService } from './expense.service';

@ApiTags('Expenses')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @Permissions('expense.create')
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiCreatedResponse({
    type: Expense,
    description: 'Expense successfully created',
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async create(@Body() dto: CreateExpenseDto, @Req() req: any) {
    return this.expenseService.create(dto, req.user);
  }

  @Get()
  @Permissions('expense.view')
  @ApiOperation({ summary: 'Get all expenses (filterable)' })
  @ApiQuery({ name: 'branch_id', required: false, example: 1 })
  @ApiQuery({ name: 'category', required: false, example: 'Rent Expense' })
  @ApiQuery({ name: 'start', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'end', required: false, example: '2025-01-31' })
  @ApiOkResponse({ type: [Expense], description: 'List of expenses' })
  async findAll(
    @Query('branch_id') branch_id?: number,
    @Query('category') category?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.expenseService.findAll({ branch_id, category, start, end });
  }

  @Get(':id')
  @Permissions('expense.view')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiOkResponse({ type: Expense, description: 'Expense retrieved' })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  async findOne(@Param('id') id: number) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  @Permissions('expense.update')
  @ApiOperation({ summary: 'Update an expense by ID' })
  @ApiOkResponse({ type: Expense, description: 'Expense updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  async update(@Param('id') id: number, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('expense.delete')
  @ApiOperation({ summary: 'Delete an expense by ID' })
  @ApiOkResponse({ description: 'Expense deleted successfully' })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  async remove(@Param('id') id: number) {
    return this.expenseService.remove(id);
  }
}
