import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Permissions } from 'src/decorator/permissions.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { ApproveLeaveDto } from '../dto/approve-leave.dto';
import { RejectLeaveDto } from '../dto/reject-leave.dto';
import { LeaveApprovalService } from '../services/leave-approval.service';

@ApiTags('HRM - Leave Approvals')
@Controller('hrm/leave-approvals')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveApprovalController {
  constructor(private readonly leaveApprovalService: LeaveApprovalService) {}

  @Post(':leaveRequestId/approve')
  @Permissions('leave.approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiParam({
    name: 'leaveRequestId',
    description: 'Leave request ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave request approved successfully.',
  })
  async approveLeave(
    @Param('leaveRequestId') leaveRequestId: number,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @Request() req,
  ) {
    const approverId = req.user.id;

    return await this.leaveApprovalService.approveLeaveRequest(
      leaveRequestId,
      approverId,
      approveLeaveDto.approverNotes,
    );
  }

  @Post(':leaveRequestId/reject')
  @Permissions('leaveapprove.reject')
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiParam({
    name: 'leaveRequestId',
    description: 'Leave request ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave request rejected successfully.',
  })
  async rejectLeave(
    @Param('leaveRequestId') leaveRequestId: number,
    @Body() rejectLeaveDto: RejectLeaveDto,
    @Request() req,
  ) {
    const approverId = req.user.id;

    return await this.leaveApprovalService.rejectLeaveRequest(
      leaveRequestId,
      approverId,
      rejectLeaveDto.rejectionReason,
    );
  }

  @Get('pending')
  @Permissions('leaveapprove.view')
  @ApiOperation({ summary: 'Get pending leave approvals for the current user' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending approvals retrieved successfully.',
  })
  async getPendingApprovals(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const approverId = req.user.id;
    const pendingApprovals =
      await this.leaveApprovalService.getPendingApprovals(approverId);

    // Apply pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedApprovals = pendingApprovals.slice(startIndex, endIndex);

    return {
      success: true,
      message: 'Pending approvals retrieved successfully',
      data: paginatedApprovals,
      total: pendingApprovals.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(pendingApprovals.length / limitNum),
    };
  }

  @Get('dashboard/stats')
  @Permissions('leaveapprove.view')
  @ApiOperation({ summary: 'Get leave approval dashboard statistics' })
  @ApiQuery({
    name: 'approverId',
    required: false,
    type: String,
    description: 'Approver ID (default: current user)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard statistics retrieved successfully.',
  })
  async getDashboardStats(
    @Request() req,
    @Query('approverId') approverId?: string,
  ) {
    const targetApproverId = approverId || req.user.id;
    const pendingApprovals =
      await this.leaveApprovalService.getPendingApprovals(targetApproverId);

    // Get daily activity
    const dailyActivity = await this.leaveApprovalService.getDailyApprovalActivity(targetApproverId);

    const stats = {
      pending: {
        count: pendingApprovals.length,
        urgent: pendingApprovals.filter((approval) => {
          const leaveRequest = approval.leaveRequest;
          const daysUntilStart = Math.ceil(
            (new Date(leaveRequest.start_date).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return daysUntilStart <= 3; // Urgent if leave starts in 3 days or less
        }).length,
        today: pendingApprovals.filter((approval) => {
          const leaveRequest = approval.leaveRequest;
          const today = new Date();
          const startDate = new Date(leaveRequest.start_date);
          return startDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: pendingApprovals.filter((approval) => {
          const leaveRequest = approval.leaveRequest;
          const today = new Date();
          const weekStart = new Date(
            today.setDate(today.getDate() - today.getDay()),
          );
          const weekEnd = new Date(
            today.setDate(today.getDate() - today.getDay() + 6),
          );
          return (
            new Date(leaveRequest.start_date) >= weekStart &&
            new Date(leaveRequest.start_date) <= weekEnd
          );
        }).length,
      },
      activity: {
        approvedToday: dailyActivity.approvedToday,
        rejectedToday: dailyActivity.rejectedToday,
        totalProcessedToday: dailyActivity.totalProcessedToday,
      },
    };

    return {
      data: stats,
    };
  }
}
