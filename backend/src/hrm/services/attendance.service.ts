import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/entities/branch.entity';
import { Between, MoreThan, Repository } from 'typeorm';
import { BulkAttendanceDto } from '../dto/bulk-attendance.dto';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { Employee } from '../entities/employee.entity';
import {
  calculateBusinessDays,
  calculateTotalDays,
  isWeekend,
} from '../utils/business-days.util';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async checkIn(
    employeeId: number,
    branch_id?: number,
    checkInDateTime?: Date,
  ) {
    // Validate employee
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        employee: { id: employeeId },
        date: today,
      },
    });

    if (existingAttendance && existingAttendance.check_in) {
      throw new BadRequestException('Employee already checked in today');
    }

    // Get branch
    const branch_idToUse = branch_id || employee.branch?.id;
    if (!branch_idToUse) {
      throw new BadRequestException('Branch ID is required');
    }
    const branch = await this.branchRepo.findOne({
      where: { id: branch_idToUse },
    });

    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const now = checkInDateTime ? new Date(checkInDateTime) : new Date();
    const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let status = AttendanceStatus.PRESENT;
    const checkInHour = now.getHours();

    // Determine status based on check-in time
    if (checkInHour > 9) {
      status = AttendanceStatus.LATE;
    }

    // Create or update attendance record
    let attendance = existingAttendance;
    if (!attendance) {
      attendance = this.attendanceRepo.create({
        date: today,
        employee,
        branch,
        status,
        check_in: checkInTime,
        regular_hours: 0,
        overtime_hours: 0,
      });
    } else {
      // Convert time string to Date for the time column
      const [hours, minutes, seconds] = checkInTime.split(':').map(Number);
      const checkInDate = new Date();
      checkInDate.setHours(hours, minutes, seconds || 0, 0);
      attendance.check_in = checkInDate;
      attendance.status = status;
    }

    await this.attendanceRepo.save(attendance);

    return {
      message: 'Check-in successful',
      check_in_time: checkInTime,
      status,
    };
  }

  async checkOut(
    employeeId: number,
    branch_id?: number,
    checkOutDateTime?: Date,
  ) {
    // Validate employee
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceRepo.findOne({
      where: {
        employee: { id: employeeId },
        date: today,
      },
    });

    if (!attendance || !attendance.check_in) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (attendance.check_out) {
      throw new BadRequestException('Employee already checked out today');
    }

    const now = checkOutDateTime ? new Date(checkOutDateTime) : new Date();
    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Calculate hours worked
    const checkInDateTime = new Date(
      `${today.toISOString().split('T')[0]} ${attendance.check_in}`,
    );
    const checkOutDate = new Date(
      `${today.toISOString().split('T')[0]} ${checkOutTime}`,
    );

    const totalHours =
      (checkOutDate.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60);

    let regularHours = Math.min(totalHours, 8); // 8 hours regular
    let overtimeHours = Math.max(totalHours - 8, 0); // Anything over 8 hours is overtime

    // Convert time string to Date for the time column
    const [hours, minutes, seconds] = checkOutTime.split(':').map(Number);

    checkOutDate.setHours(hours, minutes, seconds || 0, 0);
    attendance.check_out = checkOutDate;
    attendance.regular_hours = regularHours;
    attendance.overtime_hours = overtimeHours;

    await this.attendanceRepo.save(attendance);

    return {
      message: 'Check-out successful',
      check_out_time: checkOutTime,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
    };
  }

  async create(dto: CreateAttendanceDto) {
    // Validate employee
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employee_id },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

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

    // Check if attendance already exists for this date and employee
    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        employee: { id: dto.employee_id },
        date: dto.date,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        'Attendance already exists for this employee and date',
      );
    }

    const attendanceData: any = {
      date: dto.date,
      regular_hours: dto.regular_hours,
      overtime_hours: dto.overtime_hours,
      status: dto.status,
      notes: dto.notes,
      employee,
      branch,
    };

    // Convert time strings to Date objects if provided
    if (dto.check_in) {
      const [hours, minutes, seconds] = dto.check_in.split(':').map(Number);
      const checkInDate = new Date();
      checkInDate.setHours(hours, minutes, seconds || 0, 0);
      attendanceData.check_in = checkInDate;
    }

    if (dto.check_out) {
      const [hours, minutes, seconds] = dto.check_out.split(':').map(Number);
      const checkOutDate = new Date();
      checkOutDate.setHours(hours, minutes, seconds || 0, 0);
      attendanceData.check_out = checkOutDate;
    }

    const attendance = this.attendanceRepo.create(attendanceData);

    return await this.attendanceRepo.save(attendance);
  }

  async bulkCreate(dto: BulkAttendanceDto) {
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

    const results = [];
    const errors = [];

    for (const record of dto.attendance_records) {
      try {
        // Validate employee
        const employee = await this.employeeRepo.findOne({
          where: { id: record.employee_id },
        });

        if (!employee) {
          errors.push({
            employee_id: record.employee_id,
            date: record.date,
            error: 'Employee not found',
          });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await this.attendanceRepo.findOne({
          where: {
            employee: { id: record.employee_id },
            date: record.date,
          },
        });

        if (existingAttendance) {
          errors.push({
            employee_id: record.employee_id,
            date: record.date,
            error: 'Attendance already exists',
          });
          continue;
        }

        const attendanceData: any = {
          date: record.date,
          regular_hours: record.regular_hours,
          overtime_hours: record.overtime_hours,
          status: record.status,
          notes: record.notes,
          employee,
          branch,
        };

        // Convert time strings to Date objects if provided
        if (record.check_in) {
          const [hours, minutes, seconds] = record.check_in
            .split(':')
            .map(Number);
          const checkInDate = new Date();
          checkInDate.setHours(hours, minutes, seconds || 0, 0);
          attendanceData.check_in = checkInDate;
        }

        if (record.check_out) {
          const [hours, minutes, seconds] = record.check_out
            .split(':')
            .map(Number);
          const checkOutDate = new Date();
          checkOutDate.setHours(hours, minutes, seconds || 0, 0);
          attendanceData.check_out = checkOutDate;
        }

        const attendance = this.attendanceRepo.create(attendanceData);

        const saved = await this.attendanceRepo.save(attendance);
        results.push(saved);
      } catch (error) {
        errors.push({
          employee_id: record.employee_id,
          date: record.date,
          error: error.message,
        });
      }
    }

    return {
      message: 'Bulk attendance processing completed',
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async findAll(filters: {
    employee_id?: string;
    branch_id?: string;
    date?: Date;
    start_date?: Date;
    end_date?: Date;
    status?: AttendanceStatus;
  }) {
    const where: any = {};

    if (filters.employee_id) {
      where.employee = { id: filters.employee_id };
    }

    if (filters.branch_id) {
      where.branch = { id: filters.branch_id };
    }

    if (filters.date) {
      where.date = filters.date;
    } else if (filters.start_date && filters.end_date) {
      where.date = Between(filters.start_date, filters.end_date);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return await this.attendanceRepo.find({
      where,
      relations: ['employee', 'branch'],
      order: { date: 'DESC', check_in: 'ASC' },
    });
  }

  async findById(id: string) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: ['employee', 'branch'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    const attendance = await this.findById(id);

    Object.assign(attendance, dto);
    return await this.attendanceRepo.save(attendance);
  }

  async delete(id: string) {
    const attendance = await this.findById(id);
    await this.attendanceRepo.remove(attendance);
    return { message: 'Attendance record deleted successfully' };
  }

  async getAttendanceSummary(
    startDate: Date,
    endDate: Date,
    branch_id?: string,
    department?: string,
  ) {
    const where: any = {
      date: Between(startDate, endDate),
    };

    if (branch_id) {
      where.branch = { id: branch_id };
    }

    if (department) {
      where.employee = { department };
    }

    const attendanceRecords = await this.attendanceRepo.find({
      where,
      relations: ['employee', 'branch'],
    });

    // Calculate business days for the period
    const totalBusinessDays = calculateBusinessDays(startDate, endDate);
    const totalCalendarDays = calculateTotalDays(startDate, endDate);

    const summary = {
      period: {
        start_date: startDate,
        end_date: endDate,
        total_calendar_days: totalCalendarDays,
        total_business_days: totalBusinessDays,
        weekend_days: totalCalendarDays - totalBusinessDays,
      },
      total_records: attendanceRecords.length,
      total_employees: new Set(attendanceRecords.map((a) => a.employee.id))
        .size,
      status_breakdown: {
        present: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.PRESENT,
        ).length,
        absent: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.ABSENT,
        ).length,
        late: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.LATE,
        ).length,
        half_day: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.HALF_DAY,
        ).length,
        on_leave: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.ON_LEAVE,
        ).length,
      },
      attendance_rates: {
        attendance_rate: 0, // Will be calculated below
        absence_rate: 0, // Will be calculated below
        punctuality_rate: 0, // Will be calculated below
      },
      total_regular_hours: parseFloat(
        attendanceRecords
          .reduce(
            (sum, a) => sum + parseFloat(a.regular_hours?.toString() || '0'),
            0,
          )
          .toFixed(2),
      ),
      total_overtime_hours: parseFloat(
        attendanceRecords
          .reduce(
            (sum, a) => sum + parseFloat(a.overtime_hours?.toString() || '0'),
            0,
          )
          .toFixed(2),
      ),
    };

    // Calculate attendance rates
    const totalPresent =
      summary.status_breakdown.present +
      summary.status_breakdown.late +
      summary.status_breakdown.half_day;
    const totalExpectedAttendance = totalBusinessDays * summary.total_employees;

    if (totalExpectedAttendance > 0) {
      summary.attendance_rates.attendance_rate = parseFloat(
        ((totalPresent / totalExpectedAttendance) * 100).toFixed(2),
      );
      summary.attendance_rates.absence_rate = parseFloat(
        (
          (summary.status_breakdown.absent / totalExpectedAttendance) *
          100
        ).toFixed(2),
      );
    }

    // Calculate punctuality rate (employees who were present on time)
    const totalOnTime = summary.status_breakdown.present;
    if (totalPresent > 0) {
      summary.attendance_rates.punctuality_rate = parseFloat(
        ((totalOnTime / totalPresent) * 100).toFixed(2),
      );
    }

    return summary;
  }

  async getOvertimeReport(startDate: Date, endDate: Date, branch_id?: string) {
    const where: any = {
      date: Between(startDate, endDate),
      overtime_hours: MoreThan(0),
    };

    if (branch_id) {
      where.branch = { id: branch_id };
    }

    const overtimeRecords = await this.attendanceRepo.find({
      where,
      relations: ['employee', 'branch'],
      order: { overtime_hours: 'DESC' },
    });

    const report = {
      total_overtime_hours: parseFloat(
        overtimeRecords
          .reduce(
            (sum, a) => sum + parseFloat(a.overtime_hours?.toString() || '0'),
            0,
          )
          .toFixed(2),
      ),
      total_employees_with_overtime: new Set(
        overtimeRecords.map((a) => a.employee.id),
      ).size,
      employee_breakdown: overtimeRecords.map((record) => ({
        employee_id: record.employee.id,
        employee_name: `${record.employee.first_name} ${record.employee.last_name}`,
        employee_code: record.employee.employee_code,
        total_overtime_hours: parseFloat(
          parseFloat(record.overtime_hours?.toString() || '0').toFixed(2),
        ),
        dates: overtimeRecords
          .filter((o) => o.employee.id === record.employee.id)
          .map((o) => ({
            date: o.date,
            hours: parseFloat(
              parseFloat(o.overtime_hours?.toString() || '0').toFixed(2),
            ),
          })),
      })),
    };

    return report;
  }

  /**
   * Get individual employee attendance summary for a period
   * Includes business day calculations for accurate attendance rates
   */
  async getEmployeeAttendanceSummary(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ) {
    // Validate employee
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const attendanceRecords = await this.attendanceRepo.find({
      where: {
        employee: { id: employeeId },
        date: Between(startDate, endDate),
      },
      relations: ['employee', 'branch'],
      order: { date: 'ASC' },
    });

    // Calculate business days for the period
    const totalBusinessDays = calculateBusinessDays(startDate, endDate);
    const totalCalendarDays = calculateTotalDays(startDate, endDate);

    // Daily breakdown
    const dailyRecords = attendanceRecords.map((record) => ({
      date: record.date,
      status: record.status,
      check_in: record.check_in,
      check_out: record.check_out,
      regular_hours: record.regular_hours,
      overtime_hours: record.overtime_hours,
      is_weekend: isWeekend(record.date),
    }));

    // Summary calculations
    const summary = {
      employee: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_code: employee.employee_code,
      },
      period: {
        start_date: startDate,
        end_date: endDate,
        total_calendar_days: totalCalendarDays,
        total_business_days: totalBusinessDays,
        weekend_days: totalCalendarDays - totalBusinessDays,
      },
      attendance_breakdown: {
        present: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.PRESENT,
        ).length,
        absent: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.ABSENT,
        ).length,
        late: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.LATE,
        ).length,
        half_day: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.HALF_DAY,
        ).length,
        on_leave: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.ON_LEAVE,
        ).length,
      },
      metrics: {
        attendance_rate: 0,
        absence_rate: 0,
        punctuality_rate: 0,
        total_regular_hours: parseFloat(
          attendanceRecords
            .reduce(
              (sum, a) => sum + parseFloat(a.regular_hours?.toString() || '0'),
              0,
            )
            .toFixed(2),
        ),
        total_overtime_hours: parseFloat(
          attendanceRecords
            .reduce(
              (sum, a) => sum + parseFloat(a.overtime_hours?.toString() || '0'),
              0,
            )
            .toFixed(2),
        ),
        average_regular_hours: 0,
        average_overtime_hours: 0,
      },
      daily_records: dailyRecords,
    };

    // Calculate attendance rates based on business days
    const totalPresent =
      summary.attendance_breakdown.present +
      summary.attendance_breakdown.late +
      summary.attendance_breakdown.half_day;

    if (totalBusinessDays > 0) {
      summary.metrics.attendance_rate = parseFloat(
        ((totalPresent / totalBusinessDays) * 100).toFixed(2),
      );
      summary.metrics.absence_rate = parseFloat(
        (
          (summary.attendance_breakdown.absent / totalBusinessDays) *
          100
        ).toFixed(2),
      );

      // Calculate averages
      summary.metrics.average_regular_hours = parseFloat(
        (summary.metrics.total_regular_hours / totalPresent).toFixed(2),
      );
      summary.metrics.average_overtime_hours = parseFloat(
        (summary.metrics.total_overtime_hours / totalPresent).toFixed(2),
      );
    }

    // Calculate punctuality rate
    if (totalPresent > 0) {
      summary.metrics.punctuality_rate = parseFloat(
        ((summary.attendance_breakdown.present / totalPresent) * 100).toFixed(
          2,
        ),
      );
    }

    return summary;
  }
}
