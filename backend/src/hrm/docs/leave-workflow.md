# Leave Request and Approval Workflow Documentation

## Overview
This system implements a comprehensive leave request and approval workflow with multi-level approvals, delegation support, and business day calculations (excluding Friday and Saturday weekends).

## Workflow Features

### 1. **Automatic Business Day Calculation**
- Calculates business days automatically excluding Friday and Saturday
- No manual `days_count` input required
- Accurate leave balance validation based on business days

### 2. **Multi-Level Approval System**
- **Single-level approval**: For short leaves (≤3 days)
- **Multi-level approval**: For long leaves (>3 days) or specific leave types
- **Auto-approval**: For very short leaves based on designation settings

### 3. **Approval Level Determination**
- **Leave Duration**:
  - ≤3 days: Single level (reporting manager)
  - >7 days: 2 levels
  - >15 days or Maternity leave: 3 levels
- **Leave Types Requiring Multi-Level**: Maternity, Study leave
- **Employee Designation**: Senior levels always require multi-level approval

### 4. **Approval Chain**
- Follows employee reporting manager hierarchy
- Falls back to HR approvers if chain is insufficient
- Maximum 5 levels to prevent infinite loops

## API Endpoints

### Leave Request Management

#### 1. **Create Leave Request**
```http
POST /hrm/leave-requests
Authorization: Bearer <token>
Permissions: leave.create

Request Body:
{
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "leave_type": "annual",
  "reason": "Family vacation",
  "employee_id": 1,
  "branch_id": 1
}

Response:
{
  "id": 123,
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "days_count": 3, // Auto-calculated business days
  "leave_type": "annual",
  "status": "pending",
  "requiresMultiLevelApproval": false,
  "currentApprovalLevel": 1,
  "totalApprovalLevels": 1,
  "currentApproverId": 45 // Reporting Manager ID
}
```

#### 2. **Create Own Leave Request** (Employee endpoint)
```http
POST /hrm/leave-requests/my-leave-request
Authorization: Bearer <token>

# Same request body as above
```

#### 3. **Initialize Approval Workflow** (Manual)
```http
POST /hrm/leave-requests/{id}/initialize-workflow
Authorization: Bearer <token>
Permissions: leave.update
```

#### 4. **Get Approval Status**
```http
GET /hrm/leave-requests/{id}/approval-status
Authorization: Bearer <token>
Permissions: leave.view

Response:
{
  "leaveRequest": { /* full leave request details */ },
  "approvalHistory": [
    {
      "id": 1,
      "approvalLevel": 1,
      "approver": { "id": 45, "name": "John Manager" },
      "status": "approved",
      "approvalDate": "2024-01-15T10:30:00Z",
      "approverComments": "Approved"
    }
  ],
  "currentStatus": {
    "status": "approved",
    "currentApprovalLevel": 1,
    "totalApprovalLevels": 1,
    "completedApprovalLevels": 1,
    "currentApproverId": null,
    "requiresMultiLevelApproval": false,
    "isFullyApproved": true
  }
}
```

### Leave Approval Management

#### 5. **Approve Leave Request**
```http
POST /hrm/leave-approvals/{leaveRequestId}/approve
Authorization: Bearer <token>
Permissions: leave.approve

Request Body:
{
  "approverNotes": "Approved as requested. Enjoy your leave!"
}

Response:
{
  "success": true,
  "message": "Leave request fully approved",
  "data": {
    "id": 123,
    "status": "approved",
    "approved_date": "2024-01-15T10:30:00Z",
    "approver_notes": "Approved as requested. Enjoy your leave!"
  }
}
```

#### 6. **Reject Leave Request**
```http
POST /hrm/leave-approvals/{leaveRequestId}/reject
Authorization: Bearer <token>
Permissions: leave.approve

Request Body:
{
  "rejectionReason": "Insufficient staff coverage during requested period"
}

Response:
{
  "success": true,
  "message": "Leave request rejected",
  "data": {
    "id": 123,
    "status": "rejected",
    "rejection_reason": "Insufficient staff coverage during requested period"
  }
}
```

#### 7. **Get Pending Approvals**
```http
GET /hrm/leave-approvals/pending
Authorization: Bearer <token>
Permissions: leave.view

Response:
{
  "success": true,
  "data": [
    {
      "id": 789,
      "leaveRequest": {
        "id": 123,
        "employee": {
          "id": 1,
          "name": "Jane Doe",
          "designation": "Software Developer"
        },
        "start_date": "2024-02-01",
        "end_date": "2024-02-05",
        "days_count": 3,
        "leave_type": "annual",
        "reason": "Family vacation"
      },
      "approvalLevel": 1,
      "isFinalApproval": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### 8. **Get Approval History**
```http
GET /hrm/leave-approvals/{leaveRequestId}/history
Authorization: Bearer <token>
Permissions: leave.view

Response:
{
  "success": true,
  "message": "Approval history retrieved successfully",
  "data": [
    {
      "id": 789,
      "approvalLevel": 1,
      "approver": {
        "id": 45,
        "name": "John Manager",
        "email": "john.manager@company.com"
      },
      "status": "approved",
      "approvalDate": "2024-01-15T10:30:00Z",
      "approverComments": "Approved as requested"
    }
  ]
}
```

### Dashboard and Statistics

#### 9. **Get Dashboard Stats**
```http
GET /hrm/leave-approvals/dashboard/stats
Authorization: Bearer <token>
Permissions: leave.view

Response:
{
  "success": true,
  "data": {
    "pendingCount": 5,
    "urgentCount": 2, // Leave starting in ≤3 days
    "todayCount": 1,  // Leave starting today
    "thisWeekCount": 3 // Leave starting this week
  }
}
```

## Workflow States

### Leave Status Flow
```
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED
APPROVED → CANCELLED (only before start date)
```

### Approval Status Flow
```
PENDING → APPROVED
PENDING → REJECTED
```

## Business Day Calculation Examples

### Example 1: Standard Work Week
- **Period**: Feb 1-5, 2024
- **Calendar Days**: 5
- **Business Days**: 3 (Thursday, Sunday, Monday)
- **Weekends**: 2 (Friday, Saturday)
- **Leave Days Charged**: 3

### Example 2: Weekend Leave
- **Period**: Feb 2-3, 2024
- **Calendar Days**: 2
- **Business Days**: 0 (Friday, Saturday are weekends)
- **Leave Days Charged**: 0

### Example 3: Mixed Period
- **Period**: Feb 1-8, 2024
- **Calendar Days**: 8
- **Business Days**: 5 (excluding 3 weekend days)
- **Leave Days Charged**: 5

## Approval Scenarios

### Scenario 1: Short Leave (Auto-Approved)
- **Duration**: 2 days
- **Employee**: Developer with auto-approve settings
- **Workflow**: Auto-approved, no manual approval needed

### Scenario 2: Single-Level Approval
- **Duration**: 3 days
- **Employee**: Regular employee
- **Workflow**: Reporting Manager approval only

### Scenario 3: Multi-Level Approval
- **Duration**: 10 days
- **Employee**: Manager
- **Workflow**:
  1. Level 1: Direct Manager
  2. Level 2: Department Head

### Scenario 4: Delegated Approval
- **Duration**: 5 days
- **Manager**: On vacation with active delegation
- **Workflow**: Delegated approver handles approval

## Configuration Requirements

### Designation Settings
- `autoApproveLeaveDays`: Maximum days for auto-approval
- `canApproveLeave`: Whether employee can approve leaves
- `level`: Seniority level for approval requirements

### Employee Setup
- Reporting manager assignment
- Designation with proper settings
- Branch assignment for HR approver fallback

## Error Handling

### Common Errors
- **Insufficient Leave Balance**: Employee has insufficient leave days
- **Overlapping Leave**: Employee already has leave for same period
- **Unauthorized Approval**: Approver not in approval chain
- **Invalid Dates**: Start date after end date
- **Leave in Past**: Cannot create leave for past dates

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Insufficient annual leave balance",
  "error": "Bad Request"
}
```

## Integration Points

### Attendance Integration
- Approved leaves automatically marked as "ON_LEAVE" in attendance
- Business day calculation ensures accurate attendance tracking

### Notification System
- Email notifications to approvers
- SMS notifications for urgent requests
- Dashboard alerts for pending approvals

### Payroll Integration
- Leave balance updates reflected in payroll calculations
- Leave encashment calculations based on business days

## Security Considerations

- Employees can only request their own leave (except HR/Admin)
- Approvers can only approve assigned requests
- Delegation requires explicit setup and activation
- All actions logged for audit trail