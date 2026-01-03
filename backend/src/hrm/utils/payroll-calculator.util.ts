import { Injectable } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { Employee, EmployeeType } from '../entities/employee.entity';
import { LeaveRequest } from '../entities/leave-request.entity';

export interface PayrollCalculationInput {
  employee: Employee;
  attendanceRecords: Attendance[];
  leaveRequests: LeaveRequest[];
  payPeriodStart: Date;
  payPeriodEnd: Date;
  customAllowances?: Array<{ name: string; amount: number; percentage?: number }>;
  customDeductions?: Array<{ name: string; amount: number; percentage?: number }>;
  bonuses?: number;
  overtimeRate?: number;
  taxRate?: number;
}

export interface PayrollCalculationResult {
  base_salary: number;
  worked_days: number;
  overtime_hours: number;
  overtime_pay: number;
  gross_allowances: number;
  gross_deductions: number;
  tax: number;
  gross_salary: number;
  net_salary: number;
  breakdown: {
    regular_pay: number;
    overtime_pay: number;
    allowances: Array<{ name: string; amount: number; type: string }>;
    deductions: Array<{ name: string; amount: number; type: string }>;
  };
}

@Injectable()
export class PayrollCalculatorUtil {
  // Tax brackets (example rates - should be configurable based on local laws)
  private readonly TAX_BRACKETS = [
    { min: 0, max: 20000, rate: 0 },
    { min: 20001, max: 40000, rate: 0.1 },
    { min: 40001, max: 80000, rate: 0.15 },
    { min: 80001, max: 160000, rate: 0.2 },
    { min: 160001, max: Infinity, rate: 0.25 },
  ];

  calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
    const { employee, attendanceRecords, leaveRequests, payPeriodStart, payPeriodEnd } = input;

    // Calculate working days in pay period
    const totalWorkingDays = this.calculateWorkingDays(payPeriodStart, payPeriodEnd);

    // Calculate worked days from attendance
    const workedDays = attendanceRecords.filter(
      record => record.status === 'present' || record.status === 'late' || record.status === 'half_day'
    ).length;

    // Calculate approved leave days
    const approvedLeaveDays = leaveRequests
      .filter(leave => leave.status === 'approved')
      .reduce((total, leave) => total + leave.days_count, 0);

    // Calculate daily rate
    const dailyRate = employee.base_salary / totalWorkingDays;

    // Calculate base pay (pro-rated if partial period)
    const basePay = dailyRate * (workedDays + approvedLeaveDays);

    // Calculate overtime
    const totalOvertimeHours = attendanceRecords.reduce(
      (total, record) => total + parseFloat(record.overtime_hours?.toString() || '0'),
      0
    );
    const overtimeRate = input.overtimeRate || 1.5; // Default 1.5x
    const hourlyRate = dailyRate / 8; // Assuming 8-hour work day
    const overtimePay = totalOvertimeHours * hourlyRate * overtimeRate;

    // Calculate allowances
    const allowances = this.calculateAllowances(employee, input.customAllowances || [], basePay);

    // Calculate deductions
    const deductions = this.calculateDeductions(employee, input.customDeductions || [], basePay);

    // Calculate gross salary
    const grossSalary = basePay + overtimePay + allowances.total + (input.bonuses || 0);

    // Calculate tax
    const tax = this.calculateTax(grossSalary - deductions.total, input.taxRate);

    // Calculate net salary
    const netSalary = grossSalary - tax - deductions.total;

    return {
      base_salary: basePay,
      worked_days: workedDays + approvedLeaveDays,
      overtime_hours: totalOvertimeHours,
      overtime_pay: overtimePay,
      gross_allowances: allowances.total,
      gross_deductions: deductions.total,
      tax,
      gross_salary: grossSalary,
      net_salary: netSalary,
      breakdown: {
        regular_pay: basePay,
        overtime_pay: overtimePay,
        allowances: allowances.items,
        deductions: deductions.items,
      },
    };
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Assuming Monday (1) to Friday (5) are working days
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  private calculateAllowances(
    employee: Employee,
    customAllowances: Array<{ name: string; amount: number; percentage?: number }>,
    basePay: number
  ): { total: number; items: Array<{ name: string; amount: number; type: string }> } {
    const allowances: Array<{ name: string; amount: number; type: string }> = [];
    let total = 0;

    // Add custom allowances
    customAllowances.forEach(allowance => {
      const amount = allowance.percentage
        ? basePay * (allowance.percentage / 100)
        : allowance.amount;

      allowances.push({
        name: allowance.name,
        amount,
        type: 'custom',
      });
      total += amount;
    });

    // No standard allowances - only custom allowances are applied

    return { total, items: allowances };
  }

  private calculateDeductions(
    employee: Employee,
    customDeductions: Array<{ name: string; amount: number; percentage?: number }>,
    basePay: number
  ): { total: number; items: Array<{ name: string; amount: number; type: string }> } {
    const deductions: Array<{ name: string; amount: number; type: string }> = [];
    let total = 0;

    // Add custom deductions
    customDeductions.forEach(deduction => {
      const amount = deduction.percentage
        ? basePay * (deduction.percentage / 100)
        : deduction.amount;

      deductions.push({
        name: deduction.name,
        amount,
        type: 'custom',
      });
      total += amount;
    });

    // Add standard deductions
    // Example: Pension contribution
    const pensionContribution = basePay * 0.07; // 7% of base pay
    deductions.push({
      name: 'Pension Contribution',
      amount: pensionContribution,
      type: 'standard',
    });
    total += pensionContribution;

    return { total, items: deductions };
  }

  private calculateTax(taxableIncome: number, customTaxRate?: number): number {
    if (customTaxRate !== undefined) {
      return taxableIncome * customTaxRate;
    }

    // Use tax brackets
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of this.TAX_BRACKETS) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max - bracket.min + 1
      );

      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return tax;
  }

  
  // Helper method to generate payroll periods
  generatePayrollPeriods(year: number, month: number): { start: Date; end: Date }[] {
    const periods: { start: Date; end: Date }[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Monthly payroll (single period)
    periods.push({
      start: firstDay,
      end: lastDay,
    });

    // Can be extended for bi-weekly or weekly payrolls
    return periods;
  }

  // Helper method to validate payroll calculation
  validatePayrollCalculation(input: PayrollCalculationInput): string[] {
    const errors: string[] = [];

    if (!input.employee.base_salary || input.employee.base_salary <= 0) {
      errors.push('Employee must have a valid base salary');
    }

    if (input.payPeriodStart >= input.payPeriodEnd) {
      errors.push('Pay period start must be before end date');
    }

    if (input.attendanceRecords.length === 0) {
      errors.push('No attendance records found for the pay period');
    }

    // Validate attendance dates are within pay period
    const invalidAttendance = input.attendanceRecords.some(
      record => record.date < input.payPeriodStart || record.date > input.payPeriodEnd
    );

    if (invalidAttendance) {
      errors.push('Some attendance records are outside the pay period');
    }

    return errors;
  }
}