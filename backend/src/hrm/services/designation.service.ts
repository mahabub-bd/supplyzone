import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDesignationDto } from '../dto/create-designation.dto';
import { UpdateDesignationDto } from '../dto/update-designation.dto';
import { Designation, DesignationLevel } from '../entities/designation.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class DesignationService {
  constructor(
    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateDesignationDto) {
    // Check if designation code already exists
    const existingDesignation = await this.designationRepo.findOne({
      where: { code: dto.code },
    });

    if (existingDesignation) {
      throw new BadRequestException(
        'Designation with this code already exists',
      );
    }

    // Validate parent designation if provided
    if (dto.parentDesignationId) {
      const parentDesignation = await this.designationRepo.findOne({
        where: { id: dto.parentDesignationId, isActive: true },
      });
      if (!parentDesignation) {
        throw new BadRequestException(
          'Parent designation not found or inactive',
        );
      }
    }

    const designation = this.designationRepo.create(dto);

    return await this.designationRepo.save(designation);
  }

  async findAll(filters: {
    level?: DesignationLevel;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const { level, isActive, page, limit } = filters;

    const query = this.designationRepo
      .createQueryBuilder('designation')
      .leftJoinAndSelect('designation.parentDesignation', 'parentDesignation')
      .leftJoinAndSelect('designation.childDesignations', 'childDesignations')
      .leftJoinAndSelect('designation.employees', 'employees')
      .where('1=1');

    if (level) {
      query.andWhere('designation.level = :level', { level });
    }

    if (typeof isActive === 'boolean') {
      query.andWhere('designation.isActive = :isActive', { isActive });
    }

    const [items, total] = await query
      .orderBy('designation.sortOrder', 'ASC')
      .addOrderBy('designation.title', 'ASC')
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

  async getHierarchy() {
    const designations = await this.designationRepo.find({
      relations: ['parentDesignation', 'childDesignations'],
      where: { isActive: true },
      order: { sortOrder: 'ASC', title: 'ASC' },
    });

    // Build hierarchy tree
    const rootDesignations = designations.filter((d) => !d.parentDesignation);

    const buildTree = (parent: Designation): Designation => {
      parent.childDesignations = designations.filter(
        (d) => d.parentDesignation?.id === parent.id,
      );
      parent.childDesignations.forEach((child) => buildTree(child));
      return parent;
    };

    const hierarchy = rootDesignations.map((designation) =>
      buildTree(designation),
    );

    return hierarchy;
  }

  async findOne(id: number) {
    const designation = await this.designationRepo.findOne({
      where: { id },
      relations: ['parentDesignation', 'childDesignations', 'employees'],
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return designation;
  }

  async update(id: number, dto: UpdateDesignationDto) {
    const designation = await this.findOne(id);

    // Validate parent designation if provided
    if (dto.parentDesignationId) {
      if (dto.parentDesignationId && dto.parentDesignationId === id) {
        throw new BadRequestException('Cannot set self as parent designation');
      }

      const parentDesignation = await this.designationRepo.findOne({
        where: { id: dto.parentDesignationId, isActive: true },
      });
      if (!parentDesignation) {
        throw new BadRequestException(
          'Parent designation not found or inactive',
        );
      }

      // Check for circular reference
      const wouldCreateCircular = await this.checkCircularReference(
        dto.parentDesignationId,
        id,
      );
      if (wouldCreateCircular) {
        throw new BadRequestException(
          'Cannot create circular reference in designation hierarchy',
        );
      }
    }

    // Update designation
    Object.assign(designation, dto);
    return await this.designationRepo.save(designation);
  }

  async checkCircularReference(
    parentId: number,
    childId: number,
  ): Promise<boolean> {
    const parent = await this.designationRepo.findOne({
      where: { id: parentId },
      relations: ['parentDesignation'],
    });

    if (!parent) return false;

    if (parent.parentDesignation?.id === childId) {
      return true;
    }

    if (parent.parentDesignation) {
      return this.checkCircularReference(parent.parentDesignation.id, childId);
    }

    return false;
  }

  async remove(id: number) {
    const designation = await this.findOne(id);

    // Check if there are employees assigned to this designation
    const employeeCount = await this.employeeRepo.count({
      where: { designation: { id } },
    });

    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete designation. ${employeeCount} employee(s) are assigned to this designation.`,
      );
    }

    // Check if there are child designations
    const childCount = await this.designationRepo.count({
      where: { parentDesignation: { id } },
    });

    if (childCount > 0) {
      throw new BadRequestException(
        'Cannot delete designation with child designations. Please reassign or delete child designations first.',
      );
    }

    await this.designationRepo.softDelete(id);
  }

  async assignEmployeeToDesignation(designationId: number, employeeId: number) {
    const designation = await this.findOne(designationId);
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    employee.designationId = designationId;
    await this.employeeRepo.save(employee);

    return employee;
  }

  async findByLevel(level: DesignationLevel) {
    return await this.designationRepo.find({
      where: { level, isActive: true },
      order: { title: 'ASC' },
    });
  }
}
