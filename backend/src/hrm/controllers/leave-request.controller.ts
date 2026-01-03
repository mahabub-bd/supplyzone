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
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { MinimalApprovalStatusDto } from '../dto/minimal-approval-status.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave-request.dto';
import { LeaveStatus, LeaveType } from '../entities/leave-request.entity';
import { LeaveRequestService } from '../services/leave-request.service';

@ApiTags('HRM - Leave Requests')
@ApiBearerAuth('token')
@Controller('hrm/leave-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @Permissions('leave.create')
  @ApiOperation({ summary: 'Create leave request' })
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestService.create(dto);
  }

  @Get()
  @Permissions('leave.view')
  @ApiOperation({ summary: 'Get all leave requests' })
  @ApiQuery({ name: 'employee_id', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'status', enum: LeaveStatus, required: false })
  @ApiQuery({ name: 'leave_type', enum: LeaveType, required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  findAll(
    @Query('employee_id') employee_id?: number,
    @Query('branch_id') branch_id?: number,
    @Query('status') status?: LeaveStatus,
    @Query('leave_type') leave_type?: LeaveType,
    @Query('start_date') start_date?: Date,
    @Query('end_date') end_date?: Date,
  ) {
    return this.leaveRequestService.findAll({
      employee_id,
      branch_id,
      status,
      leave_type,
      start_date,
      end_date,
    });
  }

  @Get('balance/:employee_id')
  @Permissions('leave.view')
  @ApiOperation({ summary: 'Get employee leave balance' })
  getLeaveBalance(@Param('employee_id') employee_id: number) {
    return this.leaveRequestService.getLeaveBalance(employee_id);
  }

  @Get('report/summary')
  @Permissions('leave.view')
  @ApiOperation({ summary: 'Get leave summary report' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'department', required: false })
  getLeaveSummary(
    @Query('year') year: number,
    @Query('branch_id') branch_id?: string,
    @Query('department') department?: string,
  ) {
    return this.leaveRequestService.getLeaveSummary(
      year,
      branch_id,
      department,
    );
  }

  @Get(':id')
  @Permissions('leave.view')
  @ApiOperation({ summary: 'Get specific leave request' })
  findOne(@Param('id') id: number) {
    return this.leaveRequestService.findById(id);
  }

  @Patch(':id')
  @Permissions('leave.update')
  @ApiOperation({ summary: 'Update leave request' })
  update(@Param('id') id: number, @Body() dto: UpdateLeaveRequestDto) {
    return this.leaveRequestService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('leave.delete')
  @ApiOperation({ summary: 'Delete leave request' })
  remove(@Param('id') id: number) {
    return this.leaveRequestService.delete(id);
  }


  @Patch(':id/cancel')
  @Permissions('leave.update')
  @ApiOperation({ summary: 'Cancel leave request' })
  cancel(@Param('id') id: number) {
    return this.leaveRequestService.cancel(id);
  }

  @Post('my-leave-request')
  @ApiOperation({ summary: 'Create own leave request (employee endpoint)' })
  createOwnLeaveRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestService.createOwnLeaveRequest(dto);
  }

  @Get('my-requests/:employee_id')
  @ApiOperation({ summary: 'Get own leave requests (employee endpoint)' })
  getOwnLeaveRequests(@Param('employee_id') employee_id: number) {
    return this.leaveRequestService.getOwnLeaveRequests(employee_id);
  }

  @Post(':id/initialize-workflow')
  @Permissions('leave.update')
  @ApiOperation({ summary: 'Initialize approval workflow for leave request' })
  async initializeWorkflow(@Param('id') id: number) {
    return this.leaveRequestService.initializeLeaveWorkflow(id);
  }

  @Get(':id/approval-status')
  @Permissions('leaveapprove.view')
  @ApiOperation({ summary: 'Get approval status of leave request' })
  async getApprovalStatus(@Param('id') id: number) {
    return this.leaveRequestService.getApprovalStatus(id);
  }

  @Get(':id/approval-status/minimal')
  @Permissions('leaveapprove.view')
  @ApiOperation({ summary: 'Get minimal approval status information' })
  async getMinimalApprovalStatus(@Param('id') id: number): Promise<MinimalApprovalStatusDto> {
    return this.leaveRequestService.getMinimalApprovalStatus(id);
  }

  @Get('my-pending-approvals/:approver_id')
  @Permissions('leave.approve.view')
  @ApiOperation({ summary: 'Get pending approvals for user (simplified endpoint)' })
  async getMyPendingApprovals(@Param('approver_id') approver_id: number) {
    return this.leaveRequestService.getMyPendingApprovals(approver_id);
  }
}
