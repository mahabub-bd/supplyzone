import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { User } from 'src/user/entities/user.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Attendance } from '../entities/attendance.entity';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { PayrollRecord } from '../entities/payroll-record.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PayrollRecord)
    private readonly payrollRepo: Repository<PayrollRecord>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async create(dto: CreateEmployeeDto) {
    // Check if employee code already exists
    const existingEmployee = await this.employeeRepo.findOne({
      where: { employee_code: dto.employee_code },
    });
    if (existingEmployee) {
      throw new BadRequestException('Employee code already exists');
    }

    // Check if email already exists
    const existingEmail = await this.employeeRepo.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    // Validate branch
    const branch = await this.branchRepo.findOne({
      where: { id: dto.branch_id },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    // Validate user if provided
    if (dto.userId) {
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
    }

    const employee = this.employeeRepo.create({
      ...dto,
      branch,
      user: dto.userId ? { id: dto.userId } : null,
    });

    return await this.employeeRepo.save(employee);
  }

  async findAll(filters) {
    const where: any = {};

    if (filters.branch_id) where.branch = { id: filters.branch_id };
    if (filters.status) where.status = filters.status;
    if (filters.employee_type) where.employee_type = filters.employee_type;
    if (filters.departmentId) where.department = { id: filters.departmentId };

    const employees = await this.employeeRepo.find({
      where,
      relations: ['department', 'designation', 'branch'],
      order: { created_at: 'DESC' },
    });

    return employees;
  }

  async findById(id: number) {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: [
        'branch',
        'user',
        'designation',
        'department',
        'reportingManager',
        'subordinates',
      ],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.findById(id);

    // Check if employee code already exists (and is different from current)
    if (dto.employee_code && dto.employee_code !== employee.employee_code) {
      const existingEmployeeCode = await this.employeeRepo.findOne({
        where: { employee_code: dto.employee_code },
      });
      if (existingEmployeeCode) {
        throw new BadRequestException('Employee code already exists');
      }
    }

    if (dto.email && dto.email !== employee.email) {
      const existingEmail = await this.employeeRepo.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (dto.branch_id) {
      const branch = await this.branchRepo.findOne({
        where: { id: dto.branch_id },
      });
      if (!branch) {
        throw new BadRequestException('Branch not found');
      }
      employee.branch = branch;
    }

    if (dto.userId) {
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      employee.user = user;
    }

    Object.assign(employee, dto);
    return await this.employeeRepo.save(employee);
  }

  async delete(id: number) {
    const employee = await this.findById(id);

    // Check if employee has payroll records
    const payrollCount = await this.payrollRepo.count({
      where: { employee: { id } },
    });

    if (payrollCount > 0) {
      throw new BadRequestException(
        'Cannot delete employee with existing payroll records',
      );
    }

    await this.employeeRepo.remove(employee);
    return { message: 'Employee deleted successfully' };
  }

  async getPayrollHistory(employeeId: number) {
    const employee = await this.findById(employeeId);

    return await this.payrollRepo.find({
      where: { employee: { id: employeeId } },
      relations: ['branch'],
      order: { pay_period_start: 'DESC' },
    });
  }

  async getAttendance(employeeId: number, startDate?: Date, endDate?: Date) {
    const employee = await this.findById(employeeId);

    const where: any = { employee: { id: employeeId } };

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    return await this.attendanceRepo.find({
      where,
      relations: ['branch'],
      order: { date: 'DESC' },
    });
  }

  async terminateEmployee(id: number, terminationDate: Date, reason: string) {
    const employee = await this.findById(id);

    if (employee.status === EmployeeStatus.TERMINATED) {
      throw new BadRequestException('Employee is already terminated');
    }

    // Validate termination date
    if (!terminationDate) {
      throw new BadRequestException('Termination date is required');
    }

    const termDate = new Date(terminationDate);
    if (isNaN(termDate.getTime())) {
      throw new BadRequestException('Invalid termination date format');
    }

    // Ensure termination date is not before hire date
    if (termDate < employee.hire_date) {
      throw new BadRequestException(
        'Termination date cannot be before hire date',
      );
    }

    employee.status = EmployeeStatus.TERMINATED;
    employee.termination_date = termDate;
    employee.notes = reason;

    await this.employeeRepo.save(employee);
    return { message: 'Employee terminated successfully' };
  }

  async resignEmployee(
    id: number,
    resignationDate: Date,
    reason: string,
    notes?: string,
  ) {
    const employee = await this.findById(id);

    if (employee.status === EmployeeStatus.RESIGNED) {
      throw new BadRequestException('Employee has already resigned');
    }

    if (employee.status === EmployeeStatus.TERMINATED) {
      throw new BadRequestException('Employee has already been terminated');
    }

    // Validate resignation date
    if (!resignationDate) {
      throw new BadRequestException('Resignation date is required');
    }

    const resigDate = new Date(resignationDate);
    if (isNaN(resigDate.getTime())) {
      throw new BadRequestException('Invalid resignation date format');
    }

    // Ensure resignation date is not before hire date
    if (resigDate < employee.hire_date) {
      throw new BadRequestException(
        'Resignation date cannot be before hire date',
      );
    }

    employee.status = EmployeeStatus.RESIGNED;
    employee.termination_date = resigDate; // Using same field but for resignation
    employee.notes = `Resignation: ${reason}${notes ? ` | ${notes}` : ''}`;

    await this.employeeRepo.save(employee);
    return {
      message: 'Employee resignation processed successfully',
      resignation_date: resigDate,
      status: EmployeeStatus.RESIGNED,
    };
  }

  // Generate employee code
  async generateEmployeeCode(): Promise<string> {
    const count = await this.employeeRepo.count();
    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(4, '0');
    return `EMP${year}${paddedCount}`;
  }

  // Get employees by department
  async getEmployeesByDepartment(departmentId: number) {
    return await this.employeeRepo.find({
      where: { department: { id: departmentId } },
      relations: ['branch', 'user', 'designation', 'department'],
    });
  }

  // Get active employees count
  async getActiveEmployeesCount(branch_id?: number) {
    const where: any = { status: EmployeeStatus.ACTIVE };
    if (branch_id) {
      where.branch = { id: branch_id };
    }

    return await this.employeeRepo.count({ where });
  }
}
