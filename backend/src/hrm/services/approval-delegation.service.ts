import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { Repository } from 'typeorm';
import { CreateApprovalDelegationDto } from '../dto/create-approval-delegation.dto';
import { UpdateApprovalDelegationDto } from '../dto/update-approval-delegation.dto';
import {
  ApprovalDelegation,
  DelegationType,
} from '../entities/approval-delegation.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class ApprovalDelegationService {
  constructor(
    @InjectRepository(ApprovalDelegation)
    private readonly delegationRepo: Repository<ApprovalDelegation>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateApprovalDelegationDto) {
    // Validate delegator
    const delegator = await this.employeeRepo.findOne({
      where: { id: dto.delegatorId },
      relations: ['user'],
    });
    if (!delegator) {
      throw new BadRequestException('Delegator not found');
    }

    // Validate delegatee
    const delegatee = await this.employeeRepo.findOne({
      where: { id: dto.delegateeId },
      relations: ['user'],
    });
    if (!delegatee) {
      throw new BadRequestException('Delegatee not found');
    }

    // Validate branch
    const branch = await this.branchRepo.findOne({
      where: { id: dto.branch_id },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    // Validate dates
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if delegator and delegatee are in the same branch
    if (
      delegator.branch?.id !== branch.id ||
      delegatee.branch?.id !== branch.id
    ) {
      throw new BadRequestException(
        'Delegator and delegatee must belong to the same branch',
      );
    }

    // Check for overlapping delegations
    const overlappingDelegation = await this.findOverlappingDelegation(
      dto.delegatorId,
      dto.delegateeId,
      dto.delegationType,
      dto.startDate.toISOString().split('T')[0],
      dto.endDate.toISOString().split('T')[0],
    );

    if (overlappingDelegation) {
      throw new BadRequestException(
        'An overlapping delegation already exists for these dates',
      );
    }

    const delegation = this.delegationRepo.create({
      ...dto,
      delegator,
      delegatee,
      branch,
    });

    return await this.delegationRepo.save(delegation);
  }

  async findOverlappingDelegation(
    delegatorId: number,
    delegateeId: number,
    delegationType: DelegationType,
    startDate: string,
    endDate: string,
  ): Promise<ApprovalDelegation | null> {
    return await this.delegationRepo
      .createQueryBuilder('delegation')
      .where('delegation.delegatorId = :delegatorId', { delegatorId })
      .andWhere('delegation.delegateeId = :delegateeId', { delegateeId })
      .andWhere('delegation.delegationType = :delegationType', {
        delegationType,
      })
      .andWhere('delegation.isActive = :isActive', { isActive: true })
      .andWhere(
        '(delegation.startDate <= :endDate AND delegation.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getOne();
  }

  async findAll(filters: {
    delegatorId?: string;
    delegateeId?: string;
    delegationType?: DelegationType;
    isActive?: boolean;
    branch_id?: string;
    page: number;
    limit: number;
  }) {
    const {
      delegatorId,
      delegateeId,
      delegationType,
      isActive,
      branch_id,
      page,
      limit,
    } = filters;

    const query = this.delegationRepo
      .createQueryBuilder('delegation')
      .leftJoinAndSelect('delegation.delegator', 'delegator')
      .leftJoinAndSelect('delegation.delegatee', 'delegatee')
      .leftJoinAndSelect('delegation.branch', 'branch')
      .leftJoinAndSelect('delegator.user', 'delegatorUser')
      .leftJoinAndSelect('delegatee.user', 'delegateeUser')
      .where('1=1');

    if (delegatorId) {
      query.andWhere('delegator.id = :delegatorId', { delegatorId });
    }

    if (delegateeId) {
      query.andWhere('delegatee.id = :delegateeId', { delegateeId });
    }

    if (delegationType) {
      query.andWhere('delegation.delegationType = :delegationType', {
        delegationType,
      });
    }

    if (typeof isActive === 'boolean') {
      query.andWhere('delegation.isActive = :isActive', { isActive });
    }

    if (branch_id) {
      query.andWhere('branch.id = :branch_id', { branch_id });
    }

    const [items, total] = await query
      .orderBy('delegation.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const delegation = await this.delegationRepo.findOne({
      where: { id },
      relations: [
        'delegator',
        'delegatee',
        'branch',
        'delegator.user',
        'delegatee.user',
      ],
    });

    if (!delegation) {
      throw new NotFoundException('Approval delegation not found');
    }

    return delegation;
  }

  async update(id: number, dto: UpdateApprovalDelegationDto) {
    const delegation = await this.findOne(id);

    // Validate dates if provided
    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Check for overlapping delegations if dates or type is changed
    if (dto.startDate || dto.endDate || dto.delegationType) {
      const startDate = dto.startDate
        ? dto.startDate.toISOString().split('T')[0]
        : delegation.startDate.toISOString().split('T')[0];
      const endDate = dto.endDate
        ? dto.endDate.toISOString().split('T')[0]
        : delegation.endDate.toISOString().split('T')[0];
      const delegationType = dto.delegationType || delegation.delegationType;

      const overlappingDelegation = await this.findOverlappingDelegation(
        delegation.delegatorId,
        delegation.delegateeId,
        delegationType,
        startDate,
        endDate,
      );

      if (overlappingDelegation && overlappingDelegation.id !== id) {
        throw new BadRequestException(
          'An overlapping delegation already exists for these dates',
        );
      }
    }

    Object.assign(delegation, dto);
    return await this.delegationRepo.save(delegation);
  }

  async remove(id: number) {
    const delegation = await this.findOne(id);
    await this.delegationRepo.softDelete(id);
  }

  async getActiveDelegationsForDelegator(
    delegatorId: number,
    delegationType?: DelegationType,
  ) {
    const query = this.delegationRepo
      .createQueryBuilder('delegation')
      .leftJoinAndSelect('delegation.delegator', 'delegator')
      .leftJoinAndSelect('delegation.delegatee', 'delegatee')
      .leftJoinAndSelect('delegator.user', 'delegatorUser')
      .leftJoinAndSelect('delegatee.user', 'delegateeUser')
      .where('delegation.delegatorId = :delegatorId', { delegatorId })
      .andWhere('delegation.isActive = :isActive', { isActive: true })
      .andWhere('delegation.startDate <= :currentDate', {
        currentDate: new Date(),
      })
      .andWhere('delegation.endDate >= :currentDate', {
        currentDate: new Date(),
      });

    if (delegationType) {
      query.andWhere('delegation.delegationType = :delegationType', {
        delegationType,
      });
    }

    return await query.getMany();
  }

  async getActiveDelegationsForDelegatee(
    delegateeId: number,
    delegationType?: DelegationType,
  ) {
    const query = this.delegationRepo
      .createQueryBuilder('delegation')
      .leftJoinAndSelect('delegation.delegator', 'delegator')
      .leftJoinAndSelect('delegation.delegatee', 'delegatee')
      .leftJoinAndSelect('delegator.user', 'delegatorUser')
      .leftJoinAndSelect('delegatee.user', 'delegateeUser')
      .where('delegation.delegateeId = :delegateeId', { delegateeId })
      .andWhere('delegation.isActive = :isActive', { isActive: true })
      .andWhere('delegation.startDate <= :currentDate', {
        currentDate: new Date(),
      })
      .andWhere('delegation.endDate >= :currentDate', {
        currentDate: new Date(),
      });

    if (delegationType) {
      query.andWhere('delegation.delegationType = :delegationType', {
        delegationType,
      });
    }

    return await query.getMany();
  }

  async deactivate(id: number) {
    const delegation = await this.findOne(id);
    delegation.isActive = false;
    await this.delegationRepo.save(delegation);
  }

  async useDelegation(id: number) {
    const delegation = await this.findOne(id);

    if (!delegation.isActive) {
      throw new BadRequestException('Cannot use inactive delegation');
    }

    if (delegation.isReusable === false && delegation.usedApprovals >= 1) {
      throw new BadRequestException('This delegation has already been used');
    }

    if (
      delegation.maxApprovals !== null &&
      delegation.usedApprovals >= delegation.maxApprovals
    ) {
      throw new BadRequestException(
        'Maximum approvals limit reached for this delegation',
      );
    }

    delegation.usedApprovals += 1;

    // Deactivate if it's not reusable and has reached max approvals
    if (
      delegation.isReusable === false ||
      (delegation.maxApprovals !== null &&
        delegation.usedApprovals >= delegation.maxApprovals)
    ) {
      delegation.isActive = false;
    }

    await this.delegationRepo.save(delegation);
  }

  async checkDelegation(
    delegatorId: number,
    delegationType: DelegationType,
  ): Promise<ApprovalDelegation | null> {
    return await this.delegationRepo
      .createQueryBuilder('delegation')
      .leftJoinAndSelect('delegation.delegator', 'delegator')
      .leftJoinAndSelect('delegation.delegatee', 'delegatee')
      .leftJoinAndSelect('delegatee.user', 'delegateeUser')
      .where('delegation.delegatorId = :delegatorId', { delegatorId })
      .andWhere('delegation.delegationType = :delegationType', {
        delegationType,
      })
      .andWhere('delegation.isActive = :isActive', { isActive: true })
      .andWhere('delegation.startDate <= :currentDate', {
        currentDate: new Date(),
      })
      .andWhere('delegation.endDate >= :currentDate', {
        currentDate: new Date(),
      })
      .andWhere(
        '(delegation.isReusable = true OR delegation.usedApprovals < 1)',
      )
      .andWhere(
        '(delegation.maxApprovals IS NULL OR delegation.usedApprovals < delegation.maxApprovals)',
      )
      .orderBy('delegation.createdAt', 'DESC')
      .getOne();
  }
}
