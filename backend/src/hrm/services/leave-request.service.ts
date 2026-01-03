import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { Between, Repository } from 'typeorm';
import { CreateLeaveRequestDto } from '../dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave-request.dto';
import { Employee, Gender } from '../entities/employee.entity';
import {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from '../entities/leave-request.entity';
import { calculateBusinessDays } from '../utils/business-days.util';
import { LeaveApprovalService } from './leave-approval.service';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly leaveApprovalService: LeaveApprovalService,
  ) {}

  async create(dto: CreateLeaveRequestDto) {
    // Validate employee
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employee_id },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Validate gender-based leave types
    this.validateGenderBasedLeave(employee.gender, dto.leave_type);

    // Validate branch
    const branch_id =
      typeof dto.branch_id === 'string'
        ? parseInt(dto.branch_id, 10)
        : dto.branch_id;
    const branch = await this.branchRepo.findOne({
      where: { id: branch_id },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    // Validate dates
    if (dto.start_date > dto.end_date) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Calculate days_count automatically based on business days (excluding Friday and Saturday)
    const daysCount = calculateBusinessDays(dto.start_date, dto.end_date);

    // Check for overlapping leave requests
    const overlappingLeave = await this.leaveRequestRepo
      .createQueryBuilder('leave')
      .where('leave.employee = :employeeId', { employeeId: dto.employee_id })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
      })
      .andWhere(
        '(leave.start_date <= :endDate AND leave.end_date >= :startDate)',
        {
          startDate: dto.start_date,
          endDate: dto.end_date,
        },
      )
      .getOne();

    if (overlappingLeave) {
      throw new BadRequestException(
        'Employee already has a leave request for this period',
      );
    }

    const leaveRequest = this.leaveRequestRepo.create({
      ...dto,
      days_count: daysCount,
      employee,
      branch,
      status: LeaveStatus.PENDING,
    });

    const savedLeaveRequest = await this.leaveRequestRepo.save(leaveRequest);

    // Initialize approval workflow after saving
    try {
      await this.leaveApprovalService.initializeApprovalWorkflow(
        savedLeaveRequest.id,
      );
    } catch (error) {
      // If workflow initialization fails, still return the leave request
      // The workflow can be initialized manually later
      console.warn('Approval workflow initialization failed:', error.message);
    }

    return savedLeaveRequest;
  }

  async createOwnLeaveRequest(dto: CreateLeaveRequestDto) {
    // Additional validation for employee creating their own request
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employee_id },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Validate gender-based leave types
    this.validateGenderBasedLeave(employee.gender, dto.leave_type);

    // Calculate days_count automatically based on business days (excluding Friday and Saturday)
    const daysCount = calculateBusinessDays(dto.start_date, dto.end_date);

    // Check leave balance
    const leaveBalance = await this.getLeaveBalance(dto.employee_id);

    if (
      dto.leave_type === LeaveType.ANNUAL &&
      leaveBalance.available.annual < daysCount
    ) {
      throw new BadRequestException('Insufficient annual leave balance');
    }

    if (
      dto.leave_type === LeaveType.SICK &&
      leaveBalance.available.sick < daysCount
    ) {
      throw new BadRequestException('Insufficient sick leave balance');
    }

    return this.create(dto);
  }

  async getOwnLeaveRequests(employeeId: number) {
    return await this.leaveRequestRepo.find({
      where: { employee: { id: employeeId } },
      relations: ['employee', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(filters: {
    employee_id?: number;
    branch_id?: number;
    status?: LeaveStatus;
    leave_type?: LeaveType;
    start_date?: Date;
    end_date?: Date;
  }) {
    const where: any = {};

    if (filters.employee_id) {
      where.employee = { id: filters.employee_id };
    }

    if (filters.branch_id) {
      where.branch = { id: filters.branch_id };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.leave_type) {
      where.leave_type = filters.leave_type;
    }

    if (filters.start_date && filters.end_date) {
      where.start_date = Between(filters.start_date, filters.end_date);
    }

    return await this.leaveRequestRepo.find({
      where,
      relations: ['employee', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number) {
    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id },
      relations: [
        'employee',
        'branch',
        'employee.user',
        'employee.designation',
        'employee.department',
      ],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Get employee's leave balance
    const leaveBalance = await this.getLeaveBalance(leaveRequest.employee.id);

    // Create a new object that includes both the leave request and balance
    const result: any = { ...leaveRequest };
    result.leave_balance = leaveBalance;

    return result;
  }

  async findByIdForUpdate(id: number) {
    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id },
      relations: ['employee', 'branch'],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    return leaveRequest;
  }

  async update(id: number, dto: UpdateLeaveRequestDto) {
    const leaveRequest = await this.findByIdForUpdate(id);

    if (leaveRequest.status === LeaveStatus.APPROVED) {
      throw new BadRequestException('Cannot update approved leave request');
    }

    if (dto.start_date || dto.end_date) {
      const startDate = dto.start_date || leaveRequest.start_date;
      const endDate = dto.end_date || leaveRequest.end_date;

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Check for overlapping leave requests
      const overlappingLeave = await this.leaveRequestRepo
        .createQueryBuilder('leave')
        .where('leave.employee = :employeeId', {
          employeeId: leaveRequest.employee.id,
        })
        .where('leave.id != :leaveId', { leaveId: id })
        .andWhere('leave.status IN (:...statuses)', {
          statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
        })
        .andWhere(
          '(leave.start_date <= :endDate AND leave.end_date >= :startDate)',
          {
            startDate,
            endDate,
          },
        )
        .getOne();

      if (overlappingLeave) {
        throw new BadRequestException(
          'Employee already has a leave request for this period',
        );
      }
    }

    Object.assign(leaveRequest, dto);
    return await this.leaveRequestRepo.save(leaveRequest);
  }

  async delete(id: number) {
    const leaveRequest = await this.findByIdForUpdate(id);

    if (leaveRequest.status === LeaveStatus.APPROVED) {
      throw new BadRequestException('Cannot delete approved leave request');
    }

    await this.leaveRequestRepo.remove(leaveRequest);
    return { message: 'Leave request deleted successfully' };
  }

  async cancel(id: number) {
    const leaveRequest = await this.findByIdForUpdate(id);

    if (leaveRequest.status === LeaveStatus.CANCELLED) {
      throw new BadRequestException('Leave request is already cancelled');
    }

    if (leaveRequest.status === LeaveStatus.APPROVED) {
      // Additional validation for cancelling approved leaves
      const today = new Date();
      if (leaveRequest.start_date <= today) {
        throw new BadRequestException(
          'Cannot cancel leave that has already started',
        );
      }
    }

    leaveRequest.status = LeaveStatus.CANCELLED;
    await this.leaveRequestRepo.save(leaveRequest);

    return { message: 'Leave request cancelled successfully' };
  }

  async getLeaveBalance(employeeId: number) {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get approved leaves for the current year
    const approvedLeaves = await this.leaveRequestRepo.find({
      where: {
        employee: { id: employeeId },
        status: LeaveStatus.APPROVED,
        start_date: Between(yearStart, yearEnd),
      },
    });

    // Calculate used leave days by type
    const usedDays = approvedLeaves.reduce(
      (acc, leave) => {
        acc[leave.leave_type] += leave.days_count;
        return acc;
      },
      {
        [LeaveType.ANNUAL]: 0,
        [LeaveType.SICK]: 0,
        [LeaveType.MATERNITY]: 0,
        [LeaveType.PATERNITY]: 0,
        [LeaveType.UNPAID]: 0,
        [LeaveType.COMPASSIONATE]: 0,
        [LeaveType.STUDY]: 0,
      },
    );

    // Define gender-specific leave entitlements (can be made configurable based on company policy)
    const baseEntitlements = {
      [LeaveType.ANNUAL]: 15, // 15 days annual leave
      [LeaveType.SICK]: 15, // 15 days sick leave
      [LeaveType.UNPAID]: 365, // Unlimited unpaid leave
      [LeaveType.COMPASSIONATE]: 3, // 3 days compassionate leave
      [LeaveType.STUDY]: 5, // 5 days study leave
    };

    // Add gender-specific leave entitlements
    const genderEntitlements = {
      ...baseEntitlements,
      [LeaveType.MATERNITY]: employee.gender === Gender.FEMALE ? 90 : 0, // 90 days maternity leave for females only
      [LeaveType.PATERNITY]: employee.gender === Gender.MALE ? 7 : 0, // 7 days paternity leave for males only
    };

    const entitlements = genderEntitlements;

    // Calculate available balance
    const availableBalance: Record<string, number> = Object.keys(
      entitlements,
    ).reduce(
      (acc, type) => {
        acc[type] = Math.max(0, entitlements[type] - usedDays[type]);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      employee_id: employeeId,
      year: currentYear,
      entitlements,
      used: usedDays,
      available: availableBalance,
    };
  }

  async getLeaveSummary(year: number, branch_id?: string, department?: string) {
    const where: any = {
      start_date: Between(new Date(year, 0, 1), new Date(year, 11, 31)),
    };

    if (branch_id) {
      where.branch = { id: branch_id };
    }

    if (department) {
      where.employee = { department };
    }

    const leaveRequests = await this.leaveRequestRepo.find({
      where,
      relations: ['employee', 'branch'],
    });

    const summary = {
      year,
      total_requests: leaveRequests.length,
      status_breakdown: {
        pending: leaveRequests.filter((l) => l.status === LeaveStatus.PENDING)
          .length,
        approved: leaveRequests.filter((l) => l.status === LeaveStatus.APPROVED)
          .length,
        rejected: leaveRequests.filter((l) => l.status === LeaveStatus.REJECTED)
          .length,
        cancelled: leaveRequests.filter(
          (l) => l.status === LeaveStatus.CANCELLED,
        ).length,
      },
      type_breakdown: {
        annual: leaveRequests.filter((l) => l.leave_type === LeaveType.ANNUAL)
          .length,
        sick: leaveRequests.filter((l) => l.leave_type === LeaveType.SICK)
          .length,
        maternity: leaveRequests.filter(
          (l) => l.leave_type === LeaveType.MATERNITY,
        ).length,
        paternity: leaveRequests.filter(
          (l) => l.leave_type === LeaveType.PATERNITY,
        ).length,
        unpaid: leaveRequests.filter((l) => l.leave_type === LeaveType.UNPAID)
          .length,
        compassionate: leaveRequests.filter(
          (l) => l.leave_type === LeaveType.COMPASSIONATE,
        ).length,
        study: leaveRequests.filter((l) => l.leave_type === LeaveType.STUDY)
          .length,
      },
      total_days_taken: leaveRequests
        .filter((l) => l.status === LeaveStatus.APPROVED)
        .reduce((sum, l) => sum + l.days_count, 0),
      employees_on_leave: new Set(
        leaveRequests
          .filter((l) => l.status === LeaveStatus.APPROVED)
          .map((l) => l.employee.id),
      ).size,
    };

    return summary;
  }

  async initializeLeaveWorkflow(leaveRequestId: number) {
    try {
      const leaveRequest =
        await this.leaveApprovalService.initializeApprovalWorkflow(
          leaveRequestId,
        );
      return {
        success: true,
        message: 'Approval workflow initialized successfully',
        data: leaveRequest,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getApprovalStatus(leaveRequestId: number) {
    const leaveRequest = await this.findById(leaveRequestId);
    const approvalHistory =
      await this.leaveApprovalService.getApprovalHistory(leaveRequestId);

    return {
      leaveRequest,
      approvalHistory,
      currentStatus: {
        status: leaveRequest.status,
        currentApprovalLevel: leaveRequest.currentApprovalLevel,
        totalApprovalLevels: leaveRequest.totalApprovalLevels,
        completedApprovalLevels: leaveRequest.completedApprovalLevels,
        currentApproverId: leaveRequest.currentApproverId,
        requiresMultiLevelApproval: leaveRequest.requiresMultiLevelApproval,
        isFullyApproved: leaveRequest.isFullyApproved,
      },
    };
  }

  async getMinimalApprovalStatus(leaveRequestId: number) {
    const leaveRequest = await this.findById(leaveRequestId);
    const approvalHistory =
      await this.leaveApprovalService.getApprovalHistory(leaveRequestId);

    // Get approver name
    let currentApproverName = null;
    if (
      leaveRequest.currentApproverId &&
      approvalHistory &&
      approvalHistory.length > 0
    ) {
      // For approved/rejected requests, get the name of the person who acted
      if (
        leaveRequest.status === 'approved' ||
        leaveRequest.status === 'rejected'
      ) {
        const actedApproval = approvalHistory.find(
          (a) => a.status === leaveRequest.status && a.approverId,
        );
        if (actedApproval && actedApproval.approver) {
          currentApproverName = `${actedApproval.approver.first_name} ${actedApproval.approver.last_name}`;
        }
      } else {
        // For pending requests, get the current approver name
        const currentApproval = approvalHistory.find(
          (a) =>
            a.status === 'pending' &&
            a.approverId === leaveRequest.currentApproverId,
        );
        if (currentApproval && currentApproval.approver) {
          currentApproverName = `${currentApproval.approver.first_name} ${currentApproval.approver.last_name}`;
        }
      }
    }

    return {
      leaveId: leaveRequest.id,
      status: leaveRequest.status,
      currentApprovalLevel: leaveRequest.currentApprovalLevel,
      totalApprovalLevels: leaveRequest.totalApprovalLevels,
      isFullyApproved: leaveRequest.isFullyApproved,
      currentApproverId: leaveRequest.currentApproverId,
      currentApproverName,
      leaveType: leaveRequest.leave_type,
      startDate: leaveRequest.start_date,
      endDate: leaveRequest.end_date,
      daysCount: leaveRequest.days_count,
      employeeName: `${leaveRequest.employee.first_name} ${leaveRequest.employee.last_name}`,
    };
  }

  async getMyPendingApprovals(approverId: number) {
    const pendingApprovals =
      await this.leaveApprovalService.getPendingApprovals(approverId);

    return {
      success: true,
      message: 'Pending approvals retrieved successfully',
      data: pendingApprovals,
      count: pendingApprovals.length,
    };
  }

  /**
   * Validate gender-based leave types
   */
  private validateGenderBasedLeave(gender: Gender, leaveType: LeaveType): void {
    switch (leaveType) {
      case LeaveType.MATERNITY:
        if (gender !== Gender.FEMALE) {
          throw new BadRequestException(
            'Maternity leave is only available for female employees',
          );
        }
        break;

      case LeaveType.PATERNITY:
        if (gender !== Gender.MALE) {
          throw new BadRequestException(
            'Paternity leave is only available for male employees',
          );
        }
        break;

      // Other leave types (annual, sick, unpaid, compassionate, study) are available for all genders
      default:
        break;
    }
  }
}
