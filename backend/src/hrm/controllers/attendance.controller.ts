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
import { BulkAttendanceDto } from '../dto/bulk-attendance.dto';
import { CheckInDto, CheckOutDto } from '../dto/check-in.dto';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { AttendanceStatus } from '../entities/attendance.entity';
import { AttendanceService } from '../services/attendance.service';

@ApiTags('HRM - Attendance')
@ApiBearerAuth('token')
@Controller('hrm/attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Permissions('attendance.create')
  @ApiOperation({ summary: 'Check in employee' })
  checkIn(@Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto.employee_id, dto.branch_id, dto.check_in_time);
  }

  @Post('check-out')
  @Permissions('attendance.update')
  @ApiOperation({ summary: 'Check out employee' })
  checkOut(@Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(dto.employee_id, dto.branch_id, dto.check_out_time);
  }

  @Post()
  @Permissions('attendance.create')
  @ApiOperation({ summary: 'Create attendance record' })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Post('bulk')
  @Permissions('attendance.create')
  @ApiOperation({ summary: 'Create multiple attendance records' })
  bulkCreate(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkCreate(dto);
  }

  @Get()
  @Permissions('attendance.view')
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'status', enum: AttendanceStatus, required: false })
  findAll(
    @Query('employee_id') employee_id?: string,
    @Query('branch_id') branch_id?: string,
    @Query('date') date?: Date,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
    @Query('status') status?: AttendanceStatus,
  ) {
    return this.attendanceService.findAll({
      employee_id,
      branch_id,
      date,
      start_date,
      end_date,
      status,
    });
  }

  @Get(':id')
  @Permissions('attendance.view')
  @ApiOperation({ summary: 'Get specific attendance record' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findById(id);
  }

  @Patch(':id')
  @Permissions('attendance.update')
  @ApiOperation({ summary: 'Update attendance record' })
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('attendance.delete')
  @ApiOperation({ summary: 'Delete attendance record' })
  remove(@Param('id') id: string) {
    return this.attendanceService.delete(id);
  }

  @Get('report/summary')
  @Permissions('attendance.view')
  @ApiOperation({ summary: 'Get attendance summary report' })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'department', required: false })
  getAttendanceSummary(
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Query('branch_id') branch_id?: string,
    @Query('department') department?: string,
  ) {
    return this.attendanceService.getAttendanceSummary(
      start_date,
      end_date,
      branch_id,
      department,
    );
  }

  @Get('report/overtime')
  @Permissions('attendance.view')
  @ApiOperation({ summary: 'Get overtime report' })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  @ApiQuery({ name: 'branch_id', required: false })
  getOvertimeReport(
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Query('branch_id') branch_id?: string,
  ) {
    return this.attendanceService.getOvertimeReport(
      start_date,
      end_date,
      branch_id,
    );
  }
}
