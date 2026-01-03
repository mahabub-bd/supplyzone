import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { DelegationType } from '../entities/approval-delegation.entity';
import { Designation, DesignationLevel } from '../entities/designation.entity';
import { Employee } from '../entities/employee.entity';
import {
  ApprovalLevel,
  ApprovalStatus,
  LeaveApproval,
} from '../entities/leave-approval.entity';
import {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from '../entities/leave-request.entity';
import { ApprovalDelegationService } from './approval-delegation.service';

@Injectable()
export class LeaveApprovalService {
  constructor(
    @InjectRepository(LeaveApproval)
    private readonly leaveApprovalRepo: Repository<LeaveApproval>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,
    private readonly approvalDelegationService: ApprovalDelegationService,
  ) {}

  async initializeApprovalWorkflow(leaveRequestId: number) {
    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId },
      relations: [
        'employee',
        'employee.designation',
        'employee.reportingManager',
      ],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    // Determine if multi-level approval is needed
    const requiresMultiLevel =
      await this.determineApprovalRequirement(leaveRequest);

    leaveRequest.requiresMultiLevelApproval = requiresMultiLevel;

    if (requiresMultiLevel) {
      const approvalLevels = await this.generateApprovalLevels(leaveRequest);
      leaveRequest.totalApprovalLevels = approvalLevels.length;

      // Create approval records
      for (const level of approvalLevels) {
        const approval = this.leaveApprovalRepo.create({
          leaveRequest: { id: leaveRequestId },
          approver: { id: level.approverId },
          approvalLevel: level.level,
          isFinalApproval: level.isFinal,
          minRequiredLevel: level.level,
          sequence: level.sequence,
          status: ApprovalStatus.PENDING,
        });

        await this.leaveApprovalRepo.save(approval);
      }

      // Set current approver
      const firstApproval = approvalLevels[0];
      leaveRequest.currentApproverId = firstApproval.approverId;
      leaveRequest.currentApprovalLevel = 1;
    } else {
      // Auto-approve for short leaves based on designation settings
      if (await this.canAutoApprove(leaveRequest)) {
        leaveRequest.status = LeaveStatus.APPROVED;
        leaveRequest.approved_date = new Date();
        leaveRequest.isFullyApproved = true;
      } else {
        // Single level approval
        const reportingManager = await this.getReportingManager(
          leaveRequest.employee.id,
        );
        if (reportingManager) {
          const approval = this.leaveApprovalRepo.create({
            leaveRequest: { id: leaveRequestId },
            approver: { id: reportingManager.id },
            approvalLevel: ApprovalLevel.LEVEL_1,
            isFinalApproval: true,
            minRequiredLevel: 1,
            sequence: 1,
            status: ApprovalStatus.PENDING,
          });

          await this.leaveApprovalRepo.save(approval);

          leaveRequest.currentApproverId = reportingManager.id;
          leaveRequest.currentApprovalLevel = 1;
          leaveRequest.totalApprovalLevels = 1;
        }
      }
    }

    await this.leaveRequestRepo.save(leaveRequest);
    return leaveRequest;
  }

  async determineApprovalRequirement(
    leaveRequest: LeaveRequest,
  ): Promise<boolean> {
    // Long leaves (>3 days) require multi-level approval
    if (leaveRequest.days_count > 3) {
      return true;
    }

    // Certain leave types always require multi-level approval
    const multiLevelLeaveTypes = [LeaveType.MATERNITY, LeaveType.STUDY];
    if (multiLevelLeaveTypes.includes(leaveRequest.leave_type)) {
      return true;
    }

    // Check employee designation level
    if (leaveRequest.employee.designation) {
      const seniorLevels = [
        DesignationLevel.MANAGER,
        DesignationLevel.SENIOR_MANAGER,
        DesignationLevel.HEAD_OF_DEPARTMENT,
        DesignationLevel.CFO,
        DesignationLevel.CTO,
        DesignationLevel.CIO,
        DesignationLevel.COO,
        DesignationLevel.DIRECTOR,
        DesignationLevel.MANAGING_DIRECTOR,
      ];

      if (seniorLevels.includes(leaveRequest.employee.designation.level)) {
        return true;
      }
    }

    return false;
  }

  async generateApprovalLevels(leaveRequest: LeaveRequest): Promise<
    Array<{
      approverId: number;
      level: ApprovalLevel;
      isFinal: boolean;
      sequence: number;
    }>
  > {
    const levels: Array<{
      approverId: number;
      level: ApprovalLevel;
      isFinal: boolean;
      sequence: number;
    }> = [];

    // Get reporting chain
    const approvalChain = await this.getApprovalChain(leaveRequest.employee);

    // Determine number of levels needed based on leave duration and type
    let requiredLevels = 1;
    if (leaveRequest.days_count > 7) {
      requiredLevels = 2;
    }
    if (
      leaveRequest.days_count > 15 ||
      leaveRequest.leave_type === LeaveType.MATERNITY
    ) {
      requiredLevels = 3;
    }

    // Create approval levels
    for (let i = 0; i < Math.min(requiredLevels, approvalChain.length); i++) {
      const approver = approvalChain[i];
      levels.push({
        approverId: approver.id,
        level: (i + 1) as ApprovalLevel,
        isFinal: i === Math.min(requiredLevels, approvalChain.length) - 1,
        sequence: i + 1,
      });
    }

    // If we don't have enough approvers in the chain, add HR or designated approvers
    if (levels.length < requiredLevels) {
      const hrApprovers = await this.getHRApprovers(
        leaveRequest.employee.branch?.id || 0,
      );
      const remainingLevels = requiredLevels - levels.length;

      for (let i = 0; i < Math.min(remainingLevels, hrApprovers.length); i++) {
        levels.push({
          approverId: hrApprovers[i].id,
          level: (levels.length + 1) as ApprovalLevel,
          isFinal: levels.length + 1 === requiredLevels,
          sequence: levels.length + 1,
        });
      }
    }

    return levels;
  }

  async getApprovalChain(employee: Employee): Promise<Employee[]> {
    const chain: Employee[] = [];
    let currentManager = employee.reportingManager;

    while (currentManager && chain.length < 5) {
      // Limit to 5 levels to prevent infinite loops
      chain.push(currentManager);
      currentManager = currentManager.reportingManager;
    }

    return chain;
  }

  async getHRApprovers(branch_id: number): Promise<Employee[]> {
    return await this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.designation', 'designation')
      .leftJoinAndSelect('employee.user', 'user')
      .where('employee.branch.id = :branch_id', { branch_id })
      .andWhere('designation.canApproveLeave = :canApprove', {
        canApprove: true,
      })
      .andWhere('employee.status = :status', { status: 'active' })
      .getMany();
  }

  async canAutoApprove(leaveRequest: LeaveRequest): Promise<boolean> {
    if (!leaveRequest.employee.designation) {
      return false;
    }

    // C-level executives are automatically approved regardless of leave duration
    const cLevelDesignations = [
      DesignationLevel.CFO,
      DesignationLevel.CTO,
      DesignationLevel.CIO,
      DesignationLevel.COO,
      DesignationLevel.CEO,
      DesignationLevel.DIRECTOR,
      DesignationLevel.MANAGING_DIRECTOR,
    ];

    if (cLevelDesignations.includes(leaveRequest.employee.designation.level)) {
      return true;
    }

    const autoApproveDays =
      leaveRequest.employee.designation.autoApproveLeaveDays || 0;

    if (leaveRequest.days_count <= autoApproveDays) {
      return true;
    }

    return false;
  }

  async getReportingManager(employeeId: number): Promise<Employee | null> {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
      relations: ['reportingManager'],
    });

    return employee?.reportingManager || null;
  }

  async approveLeaveRequest(
    leaveRequestId: number,
    approverId: number,
    approverNotes?: string,
  ) {
    // Find the employee record for this user ID
    const approverEmployee = await this.employeeRepo.findOne({
      where: { userId: approverId },
    });

    if (!approverEmployee) {
      throw new ForbiddenException('Employee record not found for this user');
    }

    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId },
      relations: ['employee', 'employee.reportingManager'],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    // Get the current pending approval for this approver (using employee ID)
    let currentApproval = await this.leaveApprovalRepo.findOne({
      where: {
        leaveRequest: { id: leaveRequestId },
        approver: { id: approverEmployee.id },
        status: ApprovalStatus.PENDING,
        approvalLevel: leaveRequest.currentApprovalLevel,
      },
    });

    if (!currentApproval) {
      // Check if there's an active delegation (using employee ID)
      const delegation = await this.approvalDelegationService.checkDelegation(
        approverEmployee.id,
        DelegationType.LEAVE_APPROVAL,
      );

      if (delegation) {
        // The approver has delegated their authority, find the delegated approval
        currentApproval = await this.leaveApprovalRepo.findOne({
          where: {
            leaveRequest: { id: leaveRequestId },
            approver: { id: delegation.delegateeId },
            status: ApprovalStatus.PENDING,
            approvalLevel: leaveRequest.currentApprovalLevel,
          },
        });

        if (currentApproval) {
          currentApproval.originalApproverId = approverEmployee.id;
        }
      }

      if (!currentApproval) {
        throw new ForbiddenException(
          'You are not authorized to approve this leave request',
        );
      }
    }

    // Update the approval record
    currentApproval.status = ApprovalStatus.APPROVED;
    currentApproval.approvalDate = new Date();
    currentApproval.approverComments = approverNotes;

    await this.leaveApprovalRepo.save(currentApproval);

    // Update leave request
    leaveRequest.completedApprovalLevels += 1;

    // Check if this is the final approval
    if (
      currentApproval.isFinalApproval ||
      leaveRequest.completedApprovalLevels >= leaveRequest.totalApprovalLevels
    ) {
      leaveRequest.status = LeaveStatus.APPROVED;
      leaveRequest.approved_date = new Date();
      leaveRequest.isFullyApproved = true;
      leaveRequest.approver_notes = approverNotes;

      // Clean up any remaining pending approval records for this leave request
      await this.leaveApprovalRepo.update(
        {
          leaveRequest: { id: leaveRequestId },
          status: ApprovalStatus.PENDING,
        },
        {
          status: ApprovalStatus.SKIPPED,
          approvalDate: new Date(),
          approverComments: 'Auto-skipped - leave already approved',
        },
      );
    } else {
      // Move to next approval level
      const nextApproval = await this.leaveApprovalRepo.findOne({
        where: {
          leaveRequest: { id: leaveRequestId },
          approvalLevel: leaveRequest.currentApprovalLevel + 1,
          status: ApprovalStatus.PENDING,
        },
        relations: ['approver'],
      });

      if (nextApproval) {
        leaveRequest.currentApproverId = nextApproval.approver.id;
        leaveRequest.currentApprovalLevel += 1;
      }
    }

    await this.leaveRequestRepo.save(leaveRequest);

    return {
      success: true,
      message: leaveRequest.isFullyApproved
        ? 'Leave request fully approved'
        : 'Leave request approved and forwarded to next level',
      data: leaveRequest,
    };
  }

  async rejectLeaveRequest(
    leaveRequestId: number,
    approverId: number,
    rejectionReason: string,
  ) {
    // Find the employee record for this user ID
    const approverEmployee = await this.employeeRepo.findOne({
      where: { userId: approverId },
    });

    if (!approverEmployee) {
      throw new ForbiddenException('Employee record not found for this user');
    }

    const leaveRequest = await this.leaveRequestRepo.findOne({
      where: { id: leaveRequestId },
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    // Get the current pending approval for this approver (using employee ID)
    const currentApproval = await this.leaveApprovalRepo.findOne({
      where: {
        leaveRequest: { id: leaveRequestId },
        approver: { id: approverEmployee.id },
        status: ApprovalStatus.PENDING,
      },
    });

    if (!currentApproval) {
      // Check if there's an active delegation
      const delegation = await this.approvalDelegationService.checkDelegation(
        approverId,
        DelegationType.LEAVE_APPROVAL,
      );

      if (!delegation) {
        throw new ForbiddenException(
          'You are not authorized to reject this leave request',
        );
      }
    }

    // Update the approval record
    if (currentApproval) {
      currentApproval.status = ApprovalStatus.REJECTED;
      currentApproval.rejectionReason = rejectionReason;
      currentApproval.approvalDate = new Date();
      await this.leaveApprovalRepo.save(currentApproval);
    }

    // Update leave request
    leaveRequest.status = LeaveStatus.REJECTED;
    leaveRequest.rejection_reason = rejectionReason;

    await this.leaveRequestRepo.save(leaveRequest);

    return {
      success: true,
      message: 'Leave request rejected',
      data: leaveRequest,
    };
  }

  async getApprovalHistory(leaveRequestId: number) {
    const approvals = await this.leaveApprovalRepo.find({
      where: { leaveRequest: { id: leaveRequestId } },
      relations: [
        'approver',
        'approver.user',
        'originalApprover',
        'originalApprover.user',
      ],
      order: { approvalLevel: 'ASC', createdAt: 'ASC' },
    });

    return approvals;
  }

  async getPendingApprovals(approverId: number) {
    // Find the employee record for this user ID
    const approverEmployee = await this.employeeRepo.findOne({
      where: { userId: approverId },
    });

    if (!approverEmployee) {
      return [];
    }

    const approvals = await this.leaveApprovalRepo.find({
      where: {
        approver: { id: approverEmployee.id },
        status: ApprovalStatus.PENDING,
        leaveRequest: {
          status: LeaveStatus.PENDING,
        },
      },
      relations: [
        'leaveRequest',
        'leaveRequest.employee',
        'leaveRequest.employee.user',
        'leaveRequest.employee.designation',
      ],
      order: { createdAt: 'ASC' },
    });

    // Also check for delegated approvals
    const delegatedApprovals =
      await this.approvalDelegationService.getActiveDelegationsForDelegatee(
        approverId,
        DelegationType.LEAVE_APPROVAL,
      );

    for (const delegation of delegatedApprovals) {
      const delegatorApprovals = await this.leaveApprovalRepo.find({
        where: {
          approver: { id: delegation.delegatorId },
          status: ApprovalStatus.PENDING,
          leaveRequest: {
            status: LeaveStatus.PENDING,
          },
        },
        relations: [
          'leaveRequest',
          'leaveRequest.employee',
          'leaveRequest.employee.user',
          'leaveRequest.employee.designation',
        ],
      });

      // Mark these as delegated
      delegatorApprovals.forEach((approval) => {
        (approval as any).isDelegated = true;
        (approval as any).originalApproverId = delegation.delegatorId;
      });

      approvals.push(...delegatorApprovals);
    }

    return approvals;
  }

  async getDailyApprovalActivity(approverId: number) {
    // Find the employee record for this user ID
    const approverEmployee = await this.employeeRepo.findOne({
      where: { userId: approverId },
    });

    if (!approverEmployee) {
      return {
        approvedToday: 0,
        rejectedToday: 0,
        totalProcessedToday: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get approvals and rejections for today
    const todayApprovals = await this.leaveApprovalRepo.find({
      where: {
        approver: { id: approverEmployee.id },
        approvalDate: Between(today, tomorrow),
        status: In([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]),
      },
      relations: ['leaveRequest'],
    });

    const approvedToday = todayApprovals.filter(
      (a) => a.status === ApprovalStatus.APPROVED,
    ).length;
    const rejectedToday = todayApprovals.filter(
      (a) => a.status === ApprovalStatus.REJECTED,
    ).length;
    const totalProcessedToday = approvedToday + rejectedToday;

    return {
      approvedToday,
      rejectedToday,
      totalProcessedToday,
    };
  }
}
