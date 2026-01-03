import { Calendar, Edit, Mail, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/common/Loading";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useGetDepartmentEmployeeCountQuery,
  useGetDepartmentWithEmployeesQuery,
 
} from "../../../features/department/departmentApi";
import { useGetEmployeesQuery } from "../../../features/employee/employeeApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { formatDate, getEmployeeStatusColor, getEmployeeTypeColor, getStatusColor } from "../../../utlis";

export default function DepartmentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const departmentId = id;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const canUpdate = useHasPermission("department.update");
  const canViewEmployees = useHasPermission("employee.view");

  const {
    data: departmentData,
    isLoading,
    error,
  } = useGetDepartmentWithEmployeesQuery(departmentId!, {
    skip: !departmentId,
  });

  const { data: employeeCountData } = useGetDepartmentEmployeeCountQuery(
    departmentId!,
    {
      skip: !departmentId,
    }
  );

  // Get all employees to get department employee count if not included in department data
  const { data: allEmployeesData } = useGetEmployeesQuery(
    {
      department_id: Number(departmentId),
    },
    {
      skip: !departmentId || !!departmentData?.data?.employees,
    }
  );

  const department = departmentData?.data;
  const employeeCount = employeeCountData?.data;
  const employees = department?.employees || allEmployeesData?.data || [];

  if (isLoading) return <Loading message="Loading department profile..." />;
  if (error || !department) {
    return (
      <div className="p-6">
        <div className="text-red-500">Failed to load department profile.</div>
        <Button onClick={() => navigate("/departments")} className="mt-4">
          Back to Departments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {department.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {department.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Code: {department.code}
            </p>
            <div className="flex gap-2 mt-1">
              <Badge color={getStatusColor(department.status)} size="sm">
                {department.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/departments")}
          >
            Back to Departments
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Department Info */}
        <div className="space-y-6">
          {/* Department Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Department Information
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {department.description && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {department.description}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                {department.manager_name && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Manager:</span>
                    <span>{department.manager_name}</span>
                  </div>
                )}
                {department.manager_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Manager Email:</span>
                    <span>{department.manager_email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(department.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {department.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notes
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {department.notes}
                </p>
              </div>
            </div>
          )}

          {/* Employee Count Card */}
          {employeeCount && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Employee Statistics
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      Total Employees:
                    </span>
                  </div>
                  <Badge color="primary" size="sm">
                    {employeeCount?.total_employees || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-sm font-medium">Active:</span>
                  </div>
                  <Badge color="success" size="sm">
                    {employeeCount?.active_employees || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium">Inactive:</span>
                  </div>
                  <Badge color="warning" size="sm">
                    {employeeCount?.inactive_employees || 0}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Employee List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employees List */}
          {canViewEmployees && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Department Employees
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {employees.length} employee
                      {employees.length !== 1 ? "s" : ""} in this department
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/employees?department_id=${departmentId}`)
                    }
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </div>

              {employees.length > 0 ? (
                <div className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader>Name</TableCell>
                          <TableCell isHeader>Code</TableCell>
                          <TableCell isHeader>Email</TableCell>
                          <TableCell isHeader>Designation</TableCell>
                          <TableCell isHeader>Status</TableCell>
                          <TableCell isHeader>Type</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map((employee) => (
                          <TableRow
                            key={employee.id}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => {
                              navigate(`/employees/${employee.id}`);
                            }}
                          >
                            <TableCell className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </TableCell>
                            <TableCell>{employee.employee_code}</TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>
                              {employee.designation?.title || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                color={getEmployeeStatusColor(employee.status)}
                                size="sm"
                              >
                                {employee.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                color={getEmployeeTypeColor(
                                  employee.employee_type
                                )}
                                size="sm"
                                variant="light"
                              >
                                {employee.employee_type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No employees found in this department</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - TODO: Create DepartmentFormModal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Department</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Department editing functionality will be implemented soon.
            </p>
            <Button onClick={() => setIsEditModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
