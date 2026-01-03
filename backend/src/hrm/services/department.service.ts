import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { Department, DepartmentStatus } from '../entities/department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    // Check if department name already exists
    const existingDepartment = await this.departmentRepo.findOne({
      where: { name: dto.name },
    });

    if (existingDepartment) {
      throw new BadRequestException('Department with this name already exists');
    }

    const department = this.departmentRepo.create(dto);

    return await this.departmentRepo.save(department);
  }

  async findAll(filters: {
    status?: DepartmentStatus;
    search?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.name = Like(`%${filters.search}%`);
    }

    return await this.departmentRepo.find({
      where,
      relations: ['employees'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number) {
    const department = await this.departmentRepo.findOne({
      where: { id },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const department = await this.findById(id);

    // Check if name already exists (excluding current department)
    if (dto.name && dto.name !== department.name) {
      const existingDepartment = await this.departmentRepo.findOne({
        where: {
          name: dto.name,
          id: Not(id)
        },
      });

      if (existingDepartment) {
        throw new BadRequestException('Department with this name already exists');
      }
    }

    Object.assign(department, dto);
    return await this.departmentRepo.save(department);
  }

  async delete(id: number) {
    const department = await this.findById(id);

    // Check if department has employees
    const employeeCount = await this.employeeRepo.count({
      where: { department: { id } },
    });

    if (employeeCount > 0) {
      throw new BadRequestException('Cannot delete department with assigned employees');
    }

    await this.departmentRepo.softRemove(department);
    return { message: 'Department deleted successfully' };
  }

  async restore(id: number) {
    const department = await this.departmentRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.deleted_at) {
      throw new BadRequestException('Department is not deleted');
    }

    await this.departmentRepo.restore(id);
    return this.findById(id);
  }

  
  async getEmployeeCount(id: number) {
    const department = await this.findById(id);

    const totalEmployees = await this.employeeRepo.count({
      where: { department: { id } },
    });

    const activeEmployees = await this.employeeRepo.count({
      where: {
        department: { id },
        status: EmployeeStatus.ACTIVE,
      },
    });

    return {
      department_name: department.name,
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      inactive_employees: totalEmployees - activeEmployees,
    };
  }
}