import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { RbacModule } from '../rbac/rbac.module';

// Entities
import { Attendance } from './entities/attendance.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { Employee } from './entities/employee.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { PayrollItem } from './entities/payroll-item.entity';
import { PayrollRecord } from './entities/payroll-record.entity';

// Controllers
import { AttendanceController } from './controllers/attendance.controller';
import { DepartmentController } from './controllers/department.controller';
import { DesignationController } from './controllers/designation.controller';
import { EmployeeController } from './controllers/employee.controller';
import { LeaveRequestController } from './controllers/leave-request.controller';
import { PayrollController } from './controllers/payroll.controller';

// Services
import { AttendanceService } from './services/attendance.service';
import { DepartmentService } from './services/department.service';
import { DesignationService } from './services/designation.service';
import { EmployeeService } from './services/employee.service';
import { LeaveRequestService } from './services/leave-request.service';
import { PayrollService } from './services/payroll.service';

// Utils
import { Branch } from 'src/branch/entities/branch.entity';
import { Permission } from 'src/rbac/entities/permission.entity';
import { RbacService } from 'src/rbac/rbac.service';
import { Role } from 'src/roles/entities/role.entity';
import { ApprovalDelegationController } from './controllers/approval-delegation.controller';
import { LeaveApprovalController } from './controllers/leave-approval.controller';
import { ApprovalDelegation } from './entities/approval-delegation.entity';
import { LeaveApproval } from './entities/leave-approval.entity';
import { ApprovalDelegationService } from './services/approval-delegation.service';
import { LeaveApprovalService } from './services/leave-approval.service';
import { PayrollCalculatorUtil } from './utils/payroll-calculator.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      PayrollRecord,
      PayrollItem,
      Attendance,
      LeaveRequest,
      Designation,
      LeaveApproval,
      ApprovalDelegation,
      User,
      Role,
      Permission,
      Branch,
    ]),
    RbacModule,
  ],
  controllers: [
    EmployeeController,
    DepartmentController,
    PayrollController,
    AttendanceController,
    LeaveRequestController,
    DesignationController,
    ApprovalDelegationController,
    LeaveApprovalController,
  ],
  providers: [
    EmployeeService,
    DepartmentService,
    PayrollService,
    AttendanceService,
    LeaveRequestService,
    DesignationService,
    RbacService,
    ApprovalDelegationService,
    LeaveApprovalService,
    PayrollCalculatorUtil,
  ],
  exports: [
    EmployeeService,
    DepartmentService,
    PayrollService,
    AttendanceService,
    LeaveRequestService,
    DesignationService,
    ApprovalDelegationService,
    LeaveApprovalService,
    PayrollCalculatorUtil,
  ],
})
export class HrmModule {}
