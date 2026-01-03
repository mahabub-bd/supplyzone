# HRM (Human Resource Management) Module API Documentation

## Overview
The HRM module provides comprehensive human resource management functionality including employee management, department organization, payroll processing, attendance tracking, and leave management.

## Base URL: `/api`

## Table of Contents
1. [Authentication & Permissions](#authentication--permissions)
2. [Departments](#departments)
3. [Employees](#employees)
4. [Payroll Management](#payroll-management)
5. [Attendance Tracking](#attendance-tracking)
6. [Leave Management](#leave-management)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)

---

## Authentication & Permissions

All endpoints require:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Permissions**: Specific permissions for each action

### Required Permissions:
- `create_department` - Create new departments
- `view_departments` - View department information
- `update_department` - Update department details
- `delete_department` - Delete departments
- `create_employee` - Create new employees
- `view_employees` - View employee information
- `update_employee` - Update employee details
- `delete_employee` - Delete employees
- `process_payroll` - Process payroll
- `view_payroll` - View payroll information
- `approve_payroll` - Approve payroll
- `manage_attendance` - Manage attendance records
- `manage_leaves` - Manage leave requests

---

## Departments

### 1. Create Department
**POST** `/departments`

**Required Permission:** `create_department`

**Request Body:**
```json
{
  "name": "Engineering",
  "description": "Software development and IT support",
  "status": "active",
  "code": "ENG-001",
  "manager_name": "John Doe",
  "manager_email": "john.doe@company.com",
  "notes": "Main development team",
  "branch_id": "1"
}
```

**Response:**
```json
{
  "id": "dept-uuid-123",
  "name": "Engineering",
  "description": "Software development and IT support",
  "status": "active",
  "code": "ENG-001",
  "manager_name": "John Doe",
  "manager_email": "john.doe@company.com",
  "notes": "Main development team",
  "branch": {
    "id": 1,
    "name": "Main Branch",
    "code": "BR-001"
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### 2. Get All Departments
**GET** `/departments`

**Required Permission:** `view_departments`

**Query Parameters:**
- `branch_id` (optional, string) - Filter by branch ID
- `status` (optional, enum: "active", "inactive") - Filter by status
- `search` (optional, string) - Search by name or description

**Response:**
```json
[
  {
    "id": "dept-uuid-123",
    "name": "Engineering",
    "status": "active",
    "code": "ENG-001",
    "branch": {
      "id": 1,
      "name": "Main Branch"
    },
    "employees": [
      {
        "id": "emp-uuid-456",
        "first_name": "Jane",
        "last_name": "Smith",
        "employee_code": "EMP2024001"
      }
    ]
  }
]
```

### 3. Get Department by ID
**GET** `/departments/{id}`

**Required Permission:** `view_departments`

**Response:** Same as single department object in Create Department response

### 4. Update Department
**PATCH** `/departments/{id}`

**Required Permission:** `update_department`

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Engineering",
  "description": "Updated description",
  "status": "active",
  "manager_name": "New Manager",
  "manager_email": "new.manager@company.com"
}
```

### 5. Delete Department
**DELETE** `/departments/{id}`

**Required Permission:** `delete_department`

**Response:** 204 No Content

### 6. Restore Deleted Department
**PATCH** `/departments/{id}/restore`

**Required Permission:** `update_department`

### 7. Get Departments by Branch
**GET** `/departments/branch/{branch_id}`

**Required Permission:** `view_departments`

### 8. Get Department Employee Count
**GET** `/departments/{id}/employee-count`

**Required Permission:** `view_departments`

**Response:**
```json
{
  "department_name": "Engineering",
  "total_employees": 25,
  "active_employees": 23,
  "inactive_employees": 2
}
```

---

## Employees

### 1. Create Employee
**POST** `/employees`

**Required Permission:** `create_employee`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "phone": "+8801712345678",
  "address": "123 Street, Dhaka",
  "employee_code": "EMP2024001",
  "hire_date": "2025-01-01",
  "job_title": "Software Engineer",
  "branch_id": "1",
  "department_id": "dept-uuid-123",
  "base_salary": 50000.00,
  "bank_name": "ABC Bank",
  "bank_account_number": "1234567890",
  "tax_id": "TAX123456"
}
```

**Response:**
```json
{
  "id": "emp-uuid-456",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "employee_code": "EMP2024001",
  "status": "active",
  "job_title": "Software Engineer",
  "base_salary": 50000.00,
  "branch": {
    "id": 1,
    "name": "Main Branch"
  },
  "department_relation": {
    "id": "dept-uuid-123",
    "name": "Engineering"
  },
  "hire_date": "2025-01-01",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### 2. Get All Employees
**GET** `/employees`

**Required Permission:** `view_employees`

**Query Parameters:**
- `branch_id` (optional, string) - Filter by branch
- `department_id` (optional, string) - Filter by department
- `status` (optional, enum: "active", "inactive", "terminated") - Filter by status
- `search` (optional, string) - Search by name, email, or employee code
- `page` (optional, number) - Page number for pagination
- `limit` (optional, number) - Items per page

### 3. Get Employee by ID
**GET** `/employees/{id}`

**Required Permission:** `view_employees`

### 4. Update Employee
**PATCH** `/employees/{id}`

**Required Permission:** `update_employee`

### 5. Delete Employee
**DELETE** `/employees/{id}`

**Required Permission:** `delete_employee`

### 6. Get Employees by Department
**GET** `/employees/department/{department_id}`

**Required Permission:** `view_employees`

### 7. Get Active Employees Count
**GET** `/employees/active-count`

**Required Permission:** `view_employees`

**Response:**
```json
{
  "total_active_employees": 150,
  "branch_breakdown": [
    {
      "branch_id": 1,
      "branch_name": "Main Branch",
      "active_count": 100
    }
  ]
}
```

---

## Payroll Management

### 1. Process Payroll
**POST** `/payroll/process`

**Required Permission:** `process_payroll`

**Request Body:**
```json
{
  "employee_ids": ["emp-uuid-456", "emp-uuid-789"],
  "pay_period_start": "2025-01-01",
  "pay_period_end": "2025-01-31",
  "payment_date": "2025-02-05",
  "payment_method": "bank_transfer",
  "notes": "Monthly salary January 2025"
}
```

**Response:**
```json
[
  {
    "id": "payroll-uuid-123",
    "employee": {
      "id": "emp-uuid-456",
      "name": "John Doe",
      "employee_code": "EMP2024001"
    },
    "pay_period_start": "2025-01-01",
    "pay_period_end": "2025-01-31",
    "base_salary": 50000.00,
    "overtime_pay": 5000.00,
    "gross_salary": 55000.00,
    "tax_deduction": 5500.00,
    "other_deductions": 2000.00,
    "net_salary": 47500.00,
    "status": "draft",
    "payment_method": "bank_transfer"
  }
]
```

### 2. Get All Payroll Records
**GET** `/payroll`

**Required Permission:** `view_payroll`

**Query Parameters:**
- `employee_id` (optional, string) - Filter by employee
- `pay_period_start` (optional, string) - Filter by period start
- `pay_period_end` (optional, string) - Filter by period end
- `status` (optional, enum: "draft", "approved", "paid") - Filter by status
- `branch_id` (optional, string) - Filter by branch

### 3. Get Payroll by ID
**GET** `/payroll/{id}`

**Required Permission:** `view_payroll`

### 4. Approve Payroll
**PATCH** `/payroll/{id}/approve`

**Required Permission:** `approve_payroll`

**Request Body:**
```json
{
  "approved_by": "manager-uuid",
  "approval_notes": "Approved for payment"
}
```

### 5. Mark Payroll as Paid
**PATCH** `/payroll/{id}/paid`

**Required Permission:** `approve_payroll`

**Request Body:**
```json
{
  "payment_reference": "BANK-REF-12345",
  "payment_date": "2025-02-05"
}
```

### 6. Generate Payslip
**GET** `/payroll/{id}/payslip`

**Required Permission:** `view_payroll`

**Response:**
```json
{
  "employee_info": {
    "name": "John Doe",
    "employee_code": "EMP2024001",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "email": "john.doe@company.com"
  },
  "period_info": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "payment_date": "2025-02-05",
    "payment_method": "bank_transfer"
  },
  "earnings": {
    "basic_salary": 50000.00,
    "overtime_pay": 5000.00,
    "allowances": 1000.00,
    "total_earnings": 56000.00
  },
  "deductions": {
    "tax": 5600.00,
    "other_deductions": 2000.00,
    "total_deductions": 7600.00
  },
  "summary": {
    "gross_salary": 56000.00,
    "net_salary": 48400.00
  }
}
```

### 7. Get Payroll Summary
**GET** `/payroll/summary`

**Required Permission:** `view_payroll`

**Query Parameters:**
- `period_start` (optional, string) - Filter by period start
- `period_end` (optional, string) - Filter by period end
- `branch_id` (optional, string) - Filter by branch

**Response:**
```json
{
  "total_employees": 150,
  "total_gross_salary": 7500000.00,
  "total_net_salary": 6500000.00,
  "total_tax": 1000000.00,
  "status_breakdown": [
    {
      "status": "draft",
      "count": 50,
      "total_amount": 2500000.00
    },
    {
      "status": "approved",
      "count": 70,
      "total_amount": 3500000.00
    },
    {
      "status": "paid",
      "count": 30,
      "total_amount": 1500000.00
    }
  ]
}
```

---

## Attendance Tracking

### 1. Check In Employee
**POST** `/attendance/check-in`

**Required Permission:** `manage_attendance`

**Request Body:**
```json
{
  "employee_id": "emp-uuid-456",
  "check_in_time": "2025-01-15T09:00:00Z",
  "location": "Main Office",
  "notes": "Regular check-in"
}
```

**Response:**
```json
{
  "id": "attendance-uuid-123",
  "employee": {
    "id": "emp-uuid-456",
    "name": "John Doe",
    "employee_code": "EMP2024001"
  },
  "date": "2025-01-15",
  "check_in_time": "2025-01-15T09:00:00Z",
  "check_out_time": null,
  "status": "present",
  "location": "Main Office",
  "working_hours": 0
}
```

### 2. Check Out Employee
**POST** `/attendance/check-out`

**Required Permission:** `manage_attendance`

**Request Body:**
```json
{
  "employee_id": "emp-uuid-456",
  "check_out_time": "2025-01-15T17:30:00Z",
  "notes": "Regular check-out"
}
```

### 3. Get Attendance Records
**GET** `/attendance`

**Required Permission:** `view_attendance`

**Query Parameters:**
- `employee_id` (optional, string) - Filter by employee
- `date_from` (optional, string) - Filter by start date
- `date_to` (optional, string) - Filter by end date
- `status` (optional, enum: "present", "absent", "late", "half_day") - Filter by status
- `branch_id` (optional, string) - Filter by branch

### 4. Get Employee Attendance History
**GET** `/attendance/employee/{employee_id}`

**Required Permission:** `view_attendance`

**Query Parameters:**
- `date_from` (optional, string) - Start date
- `date_to` (optional, string) - End date
- `page` (optional, number) - Page number
- `limit` (optional, number) - Items per page

### 5. Get Attendance Summary
**GET** `/attendance/summary`

**Required Permission:** `view_attendance`

**Query Parameters:**
- `date_from` (optional, string) - Start date
- `date_to` (optional, string) - End date
- `branch_id` (optional, string) - Filter by branch
- `department_id` (optional, string) - Filter by department

**Response:**
```json
{
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "summary": {
    "total_days": 22,
    "working_days": 22,
    "total_employees": 150,
    "total_present": 3100,
    "total_absent": 150,
    "total_late": 200,
    "total_half_day": 50
  },
  "attendance_rate": 93.33,
  "breakdown_by_department": [
    {
      "department_name": "Engineering",
      "total_employees": 25,
      "attendance_rate": 95.2
    }
  ]
}
```

### 6. Mark Attendance
**POST** `/attendance/mark`

**Required Permission:** `manage_attendance`

**Request Body:**
```json
{
  "attendance_records": [
    {
      "employee_id": "emp-uuid-456",
      "date": "2025-01-15",
      "status": "present",
      "check_in_time": "09:00",
      "check_out_time": "17:30",
      "working_hours": 8.5
    }
  ]
}
```

---

## Leave Management

### 1. Create Leave Request
**POST** `/leaves`

**Required Permission:** `manage_leaves`

**Request Body:**
```json
{
  "employee_id": "emp-uuid-456",
  "leave_type": "annual",
  "start_date": "2025-01-20",
  "end_date": "2025-01-22",
  "reason": "Family vacation",
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

**Response:**
```json
{
  "id": "leave-uuid-123",
  "employee": {
    "id": "emp-uuid-456",
    "name": "John Doe",
    "employee_code": "EMP2024001"
  },
  "leave_type": "annual",
  "start_date": "2025-01-20",
  "end_date": "2025-01-22",
  "total_days": 3,
  "reason": "Family vacation",
  "status": "pending",
  "created_at": "2025-01-15T10:00:00Z"
}
```

### 2. Get Leave Requests
**GET** `/leaves`

**Required Permission:** `view_leaves`

**Query Parameters:**
- `employee_id` (optional, string) - Filter by employee
- `status` (optional, enum: "pending", "approved", "rejected", "cancelled") - Filter by status
- `leave_type` (optional, enum: "annual", "sick", "maternity", "paternity", "unpaid") - Filter by type
- `date_from` (optional, string) - Filter by start date
- `date_to` (optional, string) - Filter by end date
- `branch_id` (optional, string) - Filter by branch
- `department_id` (optional, string) - Filter by department

### 3. Get Leave Request by ID
**GET** `/leaves/{id}`

**Required Permission:** `view_leaves`

### 4. Approve Leave Request
**PATCH** `/leaves/{id}/approve`

**Required Permission:** `manage_leaves`

**Request Body:**
```json
{
  "approved_by": "manager-uuid",
  "approval_notes": "Approved as requested",
  "approved_days": 3
}
```

### 5. Reject Leave Request
**PATCH** `/leaves/{id}/reject`

**Required Permission:** `manage_leaves`

**Request Body:**
```json
{
  "rejected_by": "manager-uuid",
  "rejection_reason": "Insufficient staff coverage"
}
```

### 6. Cancel Leave Request
**PATCH** `/leaves/{id}/cancel`

**Required Permission:** `manage_leaves`

### 7. Get Leave Balance
**GET** `/leaves/balance/{employee_id}`

**Required Permission:** `view_leaves`

**Response:**
```json
{
  "employee_id": "emp-uuid-456",
  "employee_name": "John Doe",
  "current_year": 2025,
  "leave_balances": {
    "annual": {
      "total": 21,
      "used": 5,
      "available": 16
    },
    "sick": {
      "total": 10,
      "used": 2,
      "available": 8
    },
    "maternity": {
      "total": 180,
      "used": 0,
      "available": 180
    },
    "paternity": {
      "total": 7,
      "used": 0,
      "available": 7
    },
    "unpaid": {
      "total": 30,
      "used": 0,
      "available": 30
    }
  }
}
```

### 8. Update Leave Balance
**PATCH** `/leaves/balance/{employee_id}`

**Required Permission:** `manage_leaves`

**Request Body:**
```json
{
  "leave_type": "annual",
  "additional_days": 5,
  "adjustment_type": "add",
  "reason": "Carry forward from previous year",
  "effective_date": "2025-01-01"
}
```

---

## Data Models

### Employee Entity
```typescript
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  employee_code: string;
  status: 'active' | 'inactive' | 'terminated';
  hire_date: Date;
  job_title?: string;
  base_salary?: number;
  bank_name?: string;
  bank_account_number?: string;
  tax_id?: string;
  branch: Branch;
  department_relation?: Department;
  created_at: Date;
  updated_at: Date;
}
```

### Department Entity
```typescript
interface Department {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  code?: string;
  manager_name?: string;
  manager_email?: string;
  notes?: string;
  branch: Branch;
  employees: Employee[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### Payroll Record Entity
```typescript
interface PayrollRecord {
  id: string;
  employee: Employee;
  pay_period_start: Date;
  pay_period_end: Date;
  base_salary: number;
  overtime_pay: number;
  allowances: number;
  tax_deduction: number;
  other_deductions: number;
  gross_salary: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  payment_method: 'cash' | 'bank_transfer' | 'check';
  payment_date?: Date;
  payment_reference?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Attendance Entity
```typescript
interface Attendance {
  id: string;
  employee: Employee;
  date: Date;
  check_in_time?: Date;
  check_out_time?: Date;
  status: 'present' | 'absent' | 'late' | 'half_day';
  location?: string;
  notes?: string;
  working_hours: number;
  overtime_hours: number;
  created_at: Date;
  updated_at: Date;
}
```

### Leave Request Entity
```typescript
interface LeaveRequest {
  id: string;
  employee: Employee;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid';
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  attachments?: string[];
  approved_by?: string;
  approval_date?: Date;
  approval_notes?: string;
  rejected_by?: string;
  rejection_date?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "Invalid email format"
      }
    }
  ]
}
```

### Common Error Codes
- **400 Bad Request** - Validation errors, invalid input data
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource, constraint violations
- **500 Internal Server Error** - Server-side errors

### Business Logic Errors
```json
{
  "statusCode": 409,
  "message": "Department with this name already exists in this branch"
}
```

```json
{
  "statusCode": 400,
  "message": "Cannot delete department with assigned employees"
}
```

---

## Payroll Calculation Rules

### Basic Salary Processing
- Base salary is calculated from employee's configured salary
- Considered for full month unless partial period
- Pro-rated for partial periods based on working days

### Overtime Calculation
- Overtime rate = 1.5 × hourly rate (configurable)
- Calculated based on attendance overtime hours
- Applied only for approved overtime

### Tax Deduction
- Tax rate = 10% of gross salary (configurable)
- Applied to gross salary (base + overtime + allowances)
- Minimum tax threshold: ৳25,000 monthly (configurable)

### Allowances & Deductions
- Custom allowances and deductions supported
- Can be percentage-based or fixed amounts
- Applied during payroll processing

### Net Salary Formula
```
Gross Salary = Base Salary + Overtime Pay + Allowances
Net Salary = Gross Salary - Tax Deduction - Other Deductions
```

---

## Usage Examples

### Example 1: Complete Employee Onboarding Workflow
```bash
# 1. Create department first
POST /departments
{
  "name": "Sales",
  "branch_id": "1"
}

# 2. Create employee
POST /employees
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice@company.com",
  "department_id": "dept-uuid-123",
  "base_salary": 45000
}

# 3. Set initial leave balance
PATCH /leaves/balance/emp-uuid-456
{
  "leave_type": "annual",
  "additional_days": 21,
  "adjustment_type": "add"
}
```

### Example 2: Monthly Payroll Processing
```bash
# 1. Process payroll for all active employees
POST /payroll/process
{
  "employee_ids": [], // Empty means all active employees
  "pay_period_start": "2025-01-01",
  "pay_period_end": "2025-01-31",
  "payment_date": "2025-02-05",
  "payment_method": "bank_transfer"
}

# 2. Review and approve payroll
PATCH /payroll/payroll-uuid-123/approve
{
  "approved_by": "manager-uuid",
  "approval_notes": "Approved for February payment"
}

# 3. Mark as paid after bank transfer
PATCH /payroll/payroll-uuid-123/paid
{
  "payment_reference": "BANK-REF-12345",
  "payment_date": "2025-02-05"
}
```

### Example 3: Attendance Management
```bash
# 1. Daily check-in
POST /attendance/check-in
{
  "employee_id": "emp-uuid-456",
  "check_in_time": "2025-01-15T09:00:00Z"
}

# 2. Daily check-out
POST /attendance/check-out
{
  "employee_id": "emp-uuid-456",
  "check_out_time": "2025-01-15T17:30:00Z"
}

# 3. Generate attendance report
GET /attendance/summary?date_from=2025-01-01&date_to=2025-01-31
```

---

## Notes & Best Practices

### Performance Considerations
- Use pagination for large datasets
- Filter data by date ranges to reduce payload size
- Implement caching for frequently accessed data

### Security Considerations
- Always validate input data
- Implement rate limiting for payroll processing
- Use secure file storage for attachments
- Audit sensitive operations (payroll, employee data changes)

### Integration Tips
- Use webhooks for real-time notifications
- Implement proper error handling and retry mechanisms
- Follow RESTful principles for API design
- Use consistent date formats (ISO 8601)

### Testing
- Test payroll calculations with various scenarios
- Verify permission enforcement on all endpoints
- Test edge cases (leave balance overflow, negative salaries)
- Validate data integrity after CRUD operations

---

## Support & Troubleshooting

For technical support or bug reports, please contact the development team or refer to the project's issue tracking system.