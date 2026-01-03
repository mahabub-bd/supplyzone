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
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { ResignEmployeeDto } from '../dto/resign-employee.dto';
import { TerminateEmployeeDto } from '../dto/terminate-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { EmployeeStatus, EmployeeType } from '../entities/employee.entity';
import { EmployeeService } from '../services/employee.service';

@ApiTags('HRM - Employees')
@ApiBearerAuth('token')
@Controller('hrm/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Permissions('employee.create')
  @ApiOperation({ summary: 'Create new employee' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @Permissions('employee.view')
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({
    name: 'status',
    enum: EmployeeStatus,
    required: false,
    enumName: 'EmployeeStatus',
  })
  @ApiQuery({ name: 'employee_type', enum: EmployeeType, required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  findAll(
    @Query('branch_id') branch_id?: number,
    @Query('status') status?: EmployeeStatus,
    @Query('employee_type') employee_type?: EmployeeType,
    @Query('departmentId') departmentId?: number,
  ) {
    return this.employeeService.findAll({
      branch_id,
      status,
      employee_type,
      departmentId,
    });
  }

  @Get(':id')
  @Permissions('employee.view')
  @ApiOperation({ summary: 'Get specific employee' })
  findOne(@Param('id') id: number) {
    return this.employeeService.findById(id);
  }

  @Patch(':id')
  @Permissions('employee.update')
  @ApiOperation({ summary: 'Update employee information' })
  update(@Param('id') id: number, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('employee.delete')
  @ApiOperation({ summary: 'Delete employee' })
  remove(@Param('id') id: number) {
    return this.employeeService.delete(id);
  }

  @Get(':id/payroll-history')
  @Permissions('payroll.view')
  @ApiOperation({ summary: 'Get employee payroll history' })
  getPayrollHistory(@Param('id') id: number) {
    return this.employeeService.getPayrollHistory(id);
  }

  @Get(':id/attendance')
  @Permissions('attendance.view')
  @ApiOperation({ summary: 'Get employee attendance records' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  getAttendance(
    @Param('id') id: number,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ) {
    return this.employeeService.getAttendance(id, start_date, end_date);
  }

  @Post(':id/terminate')
  @Permissions('employee.update')
  @ApiOperation({ summary: 'Terminate employee (company-initiated)' })
  terminateEmployee(
    @Param('id') id: number,
    @Body() body: TerminateEmployeeDto,
  ) {
    return this.employeeService.terminateEmployee(
      id,
      body.termination_date,
      body.reason,
    );
  }

  @Post(':id/resign')
  @Permissions('employee.update')
  @ApiOperation({
    summary: 'Process employee resignation (employee-initiated)',
  })
  resignEmployee(@Param('id') id: number, @Body() body: ResignEmployeeDto) {
    return this.employeeService.resignEmployee(
      id,
      body.resignation_date,
      body.reason,
      body.notes,
    );
  }
}
