import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { ProcessPayrollDto } from '../dto/process-payroll.dto';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';
import { Attendance } from '../entities/attendance.entity';
import { Employee } from '../entities/employee.entity';
import { LeaveRequest, LeaveStatus } from '../entities/leave-request.entity';
import { PayrollItem, PayrollItemType } from '../entities/payroll-item.entity';
import {
  PaymentMethod,
  PayrollRecord,
  PayrollStatus,
} from '../entities/payroll-record.entity';
import {
  PayrollCalculationInput,
  PayrollCalculatorUtil,
} from '../utils/payroll-calculator.util';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRecord)
    private readonly payrollRepo: Repository<PayrollRecord>,
    @InjectRepository(PayrollItem)
    private readonly payrollItemRepo: Repository<PayrollItem>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly payrollCalculator: PayrollCalculatorUtil,
  ) {}

  async create(dto: CreatePayrollDto) {
    // Validate employee
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employee_id },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Validate branch
    const branch = await this.branchRepo.findOne({
      where: { id: dto.branch_id },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    // Check if payroll already exists for this period and employee
    const existingPayroll = await this.payrollRepo.findOne({
      where: {
        employee: { id: dto.employee_id },
        pay_period_start: dto.pay_period_start,
        pay_period_end: dto.pay_period_end,
      },
    });

    if (existingPayroll) {
      throw new BadRequestException(
        'Payroll already exists for this employee and period',
      );
    }

    const payroll = this.payrollRepo.create({
      ...dto,
      employee,
      branch,
    });

    const savedPayroll = await this.payrollRepo.save(payroll);

    // Create payroll items if provided
    if (dto.payroll_items && dto.payroll_items.length > 0) {
      const payrollItems = dto.payroll_items.map((item) =>
        this.payrollItemRepo.create({
          ...item,
          payroll_record: savedPayroll,
        }),
      );

      await this.payrollItemRepo.save(payrollItems);
    }

    return this.findById(savedPayroll.id);
  }

  async findAll(filters: {
    branch_id?: string;
    employee_id?: string;
    status?: PayrollStatus;
    pay_period_start?: Date;
    pay_period_end?: Date;
  }) {
    const where: any = {};

    if (filters.branch_id) {
      where.branch = { id: filters.branch_id };
    }

    if (filters.employee_id) {
      where.employee = { id: filters.employee_id };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.pay_period_start && filters.pay_period_end) {
      where.pay_period_start = filters.pay_period_start;
      where.pay_period_end = filters.pay_period_end;
    }

    return await this.payrollRepo.find({
      where,
      relations: ['employee', 'branch', 'payroll_items'],
      order: { pay_period_start: 'DESC' },
    });
  }

  async findById(id: string) {
    const payroll = await this.payrollRepo.findOne({
      where: { id },
      relations: ['employee', 'branch', 'payroll_items'],
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    return payroll;
  }

  async update(id: string, dto: UpdatePayrollDto) {
    const payroll = await this.findById(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot update paid payroll');
    }

    Object.assign(payroll, dto);
    const updatedPayroll = await this.payrollRepo.save(payroll);

    // Recalculate totals if salary components changed
    const grossSalary =
      payroll.base_salary +
      payroll.overtime_pay +
      payroll.allowances +
      (dto.bonuses || payroll.bonuses || 0);

    const totalDeductions =
      payroll.deductions + payroll.tax + payroll.other_deductions;

    const netSalary = grossSalary - totalDeductions;

    await this.payrollRepo.update(id, {
      gross_salary: grossSalary,
      net_salary: netSalary,
    });

    return this.findById(id);
  }

  async delete(id: string) {
    const payroll = await this.findById(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException('Cannot delete paid payroll');
    }

    // Delete payroll items first
    await this.payrollItemRepo.delete({
      payroll_record: { id },
    });

    await this.payrollRepo.remove(payroll);
    return { message: 'Payroll record deleted successfully' };
  }

  async approvePayroll(id: string) {
    const payroll = await this.findById(id);

    if (
      payroll.status !== PayrollStatus.DRAFT &&
      payroll.status !== PayrollStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only draft or pending payroll can be approved',
      );
    }

    payroll.status = PayrollStatus.APPROVED;
    await this.payrollRepo.save(payroll);

    return { message: 'Payroll approved successfully' };
  }

  async markAsPaid(
    id: string,
    paymentMethod: PaymentMethod,
    paymentReference?: string,
  ) {
    const payroll = await this.findById(id);

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved payroll can be marked as paid',
      );
    }

    payroll.status = PayrollStatus.PAID;
    payroll.payment_method = paymentMethod;
    payroll.payment_reference = paymentReference;
    payroll.payment_date = new Date();

    await this.payrollRepo.save(payroll);
    return { message: 'Payroll marked as paid successfully' };
  }

  async batchApprove(payrollIds: string[]) {
    const payrolls = await this.payrollRepo.find({
      where: { id: In(payrollIds) },
    });

    const validPayrolls = payrolls.filter(
      (p) =>
        p.status === PayrollStatus.DRAFT || p.status === PayrollStatus.PENDING,
    );

    if (validPayrolls.length === 0) {
      throw new BadRequestException('No valid payrolls to approve');
    }

    await this.payrollRepo.update(
      { id: In(validPayrolls.map((p) => p.id)) },
      { status: PayrollStatus.APPROVED },
    );

    return {
      message: `${validPayrolls.length} payroll records approved successfully`,
      approved_count: validPayrolls.length,
    };
  }

  async getMonthlySummary(month: number, year: number, branch_id?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const where: any = {
      pay_period_start: { $gte: startDate },
      pay_period_end: { $lte: endDate },
    };

    if (branch_id) {
      where.branch = { id: branch_id };
    }

    const payrolls = await this.payrollRepo.find({
      where,
      relations: ['employee', 'branch'],
    });

    const summary = {
      total_employees: new Set(payrolls.map((p) => p.employee.id)).size,
      total_gross_salary: payrolls.reduce(
        (sum, p) => sum + Number(p.gross_salary),
        0,
      ),
      total_net_salary: payrolls.reduce(
        (sum, p) => sum + Number(p.net_salary),
        0,
      ),
      total_tax: payrolls.reduce((sum, p) => sum + Number(p.tax), 0),
      total_overtime: payrolls.reduce(
        (sum, p) => sum + Number(p.overtime_pay),
        0,
      ),
      status_breakdown: {
        draft: payrolls.filter((p) => p.status === PayrollStatus.DRAFT).length,
        pending: payrolls.filter((p) => p.status === PayrollStatus.PENDING)
          .length,
        approved: payrolls.filter((p) => p.status === PayrollStatus.APPROVED)
          .length,
        paid: payrolls.filter((p) => p.status === PayrollStatus.PAID).length,
      },
    };

    return summary;
  }

  async generatePayslip(id: string) {
    const payroll = await this.findById(id);

    const payslip = {
      employee_info: {
        name: `${payroll.employee.first_name} ${payroll.employee.last_name}`,
        employee_code: payroll.employee.employee_code,
        designation: payroll.employee.designation?.title || 'N/A',
        department: payroll.employee.department?.name || 'N/A',
        email: payroll.employee.email,
      },
      period_info: {
        start_date: payroll.pay_period_start,
        end_date: payroll.pay_period_end,
        payment_date: payroll.payment_date,
        payment_method: payroll.payment_method,
      },
      earnings: {
        basic_salary: payroll.base_salary,
        overtime_pay: payroll.overtime_pay,
        allowances: payroll.allowances,
        bonuses: payroll.bonuses,
        gross_earnings: payroll.gross_salary,
      },
      deductions: {
        tax: payroll.tax,
        other_deductions: payroll.deductions + payroll.other_deductions,
        total_deductions:
          payroll.deductions + payroll.tax + payroll.other_deductions,
      },
      net_salary: payroll.net_salary,
      payroll_items: payroll.payroll_items,
    };

    return payslip;
  }

  async processPayroll(dto: ProcessPayrollDto) {
    const results = [];

    for (const employeeData of dto.employees) {
      try {
        // Get employee
        const employee = await this.employeeRepo.findOne({
          where: { id: employeeData.employee_id },
        });

        if (!employee) {
          results.push({
            employee_id: employeeData.employee_id,
            success: false,
            error: 'Employee not found',
          });
          continue;
        }

        // Get attendance records for the period
        const attendanceRecords = await this.attendanceRepo.find({
          where: {
            employee: { id: employeeData.employee_id },
            date: Between(dto.pay_period_start, dto.pay_period_end),
          },
        });

        // Get approved leave requests for the period
        const leaveRequests = await this.leaveRequestRepo.find({
          where: [
            {
              employee: { id: employeeData.employee_id },
              start_date: LessThanOrEqual(dto.pay_period_end),
              end_date: MoreThanOrEqual(dto.pay_period_start),
              status: LeaveStatus.APPROVED,
            },
          ],
        });

        // Calculate payroll
        const calculationInput: PayrollCalculationInput = {
          employee,
          attendanceRecords,
          leaveRequests,
          payPeriodStart: dto.pay_period_start,
          payPeriodEnd: dto.pay_period_end,
          customAllowances: employeeData.allowances || [],
          customDeductions: employeeData.deductions || [],
          bonuses: employeeData.bonus,
          overtimeRate: dto.overtime_rate,
          taxRate: dto.custom_tax_rate,
        };

        const calculation =
          this.payrollCalculator.calculatePayroll(calculationInput);

        // Get branch for payroll
        let branch: Branch | null = null;
        if (dto.branch_id) {
          const branch_idNum =
            typeof dto.branch_id === 'string'
              ? parseInt(dto.branch_id, 10)
              : dto.branch_id;
          branch = await this.branchRepo.findOne({
            where: { id: branch_idNum },
          });
        } else {
          branch = employee.branch;
        }

        if (!branch) {
          results.push({
            employee_id: employeeData.employee_id,
            success: false,
            error: 'Branch not found',
          });
          continue;
        }

        // Create payroll record
        const payrollData = {
          pay_period_start: dto.pay_period_start,
          pay_period_end: dto.pay_period_end,
          payment_date: dto.payment_date,
          payment_method: dto.payment_method,
          base_salary: calculation.base_salary,
          overtime_hours: calculation.overtime_hours,
          overtime_pay: calculation.overtime_pay,
          allowances: calculation.gross_allowances,
          bonuses: employeeData.bonus || 0,
          deductions: calculation.gross_deductions,
          tax: calculation.tax,
          gross_salary: calculation.gross_salary,
          net_salary: calculation.net_salary,
          status: PayrollStatus.DRAFT,
          notes: dto.notes,
        };

        const payroll = this.payrollRepo.create({
          ...payrollData,
          employee,
          branch,
        });

        const createdPayroll = await this.payrollRepo.save(payroll);

        // Create payroll items from breakdown
        const payrollItems = [
          ...calculation.breakdown.allowances.map((item) => ({
            payroll_record_id: createdPayroll.id,
            name: item.name,
            type:
              item.type === 'custom'
                ? PayrollItemType.ALLOWANCE
                : PayrollItemType.ALLOWANCE,
            amount: item.amount,
            description: `${item.name} - ${item.type}`,
          })),
          ...calculation.breakdown.deductions.map((item) => ({
            payroll_record_id: createdPayroll.id,
            name: item.name,
            type:
              item.type === 'custom'
                ? PayrollItemType.DEDUCTION
                : PayrollItemType.DEDUCTION,
            amount: item.amount,
            description: `${item.name} - ${item.type}`,
          })),
        ];

        if (payrollItems.length > 0) {
          await this.payrollItemRepo.save(
            payrollItems.map((item) => this.payrollItemRepo.create(item)),
          );
        }

        results.push({
          employee_id: employeeData.employee_id,
          success: true,
          payroll_id: createdPayroll.id,
          net_salary: calculation.net_salary,
        });
      } catch (error) {
        results.push({
          employee_id: employeeData.employee_id,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      message: 'Payroll processing completed',
      total_processed: dto.employees.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
