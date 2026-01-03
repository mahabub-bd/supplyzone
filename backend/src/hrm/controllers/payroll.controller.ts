import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';
import { ProcessPayrollDto } from '../dto/process-payroll.dto';
import { PayrollService } from '../services/payroll.service';
import { PayrollStatus, PaymentMethod } from '../entities/payroll-record.entity';

@ApiTags('HRM - Payroll')
@ApiBearerAuth('token')
@Controller('hrm/payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('process')
  @Permissions('payroll.process')
  @ApiOperation({ summary: 'Process payroll for employees' })
  processPayroll(@Body() dto: ProcessPayrollDto) {
    return this.payrollService.processPayroll(dto);
  }

  @Post()
  @Permissions('payroll.create')
  @ApiOperation({ summary: 'Create payroll record' })
  create(@Body() dto: CreatePayrollDto) {
    return this.payrollService.create(dto);
  }

  @Get()
  @Permissions('payroll.view')
  @ApiOperation({ summary: 'Get all payroll records' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'status', enum: PayrollStatus, required: false })
  @ApiQuery({ name: 'pay_period_start', required: false })
  @ApiQuery({ name: 'pay_period_end', required: false })
  findAll(
    @Query('branch_id') branch_id?: string,
    @Query('employee_id') employee_id?: string,
    @Query('status') status?: PayrollStatus,
    @Query('pay_period_start') pay_period_start?: Date,
    @Query('pay_period_end') pay_period_end?: Date,
  ) {
    return this.payrollService.findAll({
      branch_id,
      employee_id,
      status,
      pay_period_start,
      pay_period_end,
    });
  }

  @Get(':id')
  @Permissions('payroll.view')
  @ApiOperation({ summary: 'Get specific payroll record' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findById(id);
  }

  @Patch(':id')
  @Permissions('payroll.update')
  @ApiOperation({ summary: 'Update payroll record' })
  update(@Param('id') id: string, @Body() dto: UpdatePayrollDto) {
    return this.payrollService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('payroll.delete')
  @ApiOperation({ summary: 'Delete payroll record' })
  remove(@Param('id') id: string) {
    return this.payrollService.delete(id);
  }

  @Patch(':id/approve')
  @Permissions('payroll.approve')
  @ApiOperation({ summary: 'Approve payroll record' })
  approve(@Param('id') id: string) {
    return this.payrollService.approvePayroll(id);
  }

  @Patch(':id/paid')
  @Permissions('payroll.process')
  @ApiOperation({ summary: 'Mark payroll as paid' })
  markAsPaid(
    @Param('id') id: string,
    @Body() body: { payment_method: PaymentMethod; payment_reference?: string },
  ) {
    return this.payrollService.markAsPaid(id, body.payment_method, body.payment_reference);
  }

  @Post('batch-approve')
  @Permissions('payroll.approve')
  @ApiOperation({ summary: 'Approve multiple payroll records' })
  batchApprove(@Body() body: { payroll_ids: string[] }) {
    return this.payrollService.batchApprove(body.payroll_ids);
  }

  @Get('summary/monthly')
  @Permissions('payroll.view')
  @ApiOperation({ summary: 'Get monthly payroll summary' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  getMonthlySummary(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('branch_id') branch_id?: string,
  ) {
    return this.payrollService.getMonthlySummary(
      month || new Date().getMonth() + 1,
      year || new Date().getFullYear(),
      branch_id,
    );
  }

  @Get('payslip/:id')
  @Permissions('payroll.view')
  @ApiOperation({ summary: 'Generate payslip' })
  generatePayslip(@Param('id') id: string) {
    return this.payrollService.generatePayslip(id);
  }
}