import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import DatePicker from "../../../components/form/date-picker";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useGetBranchesQuery } from "../../../features/branch/branchApi";
import { useGetDepartmentsQuery } from "../../../features/department/departmentApi";
import { useGetDesignationsQuery } from "../../../features/designation/designationApi";
import {
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "../../../features/employee/employeeApi";
import {
  useCreateUserMutation,
  useGetUsersQuery,
} from "../../../features/user/userApi";
import {
  CreateEmployeePayload,
  Employee,
  EmployeeStatus,
  EmployeeType,
} from "../../../types";
import { CreateUserPayload } from "../../../types/user";

// Zod schema for employee validation
const employeeSchema = z
  .object({
    employee_code: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    status: z.nativeEnum(EmployeeStatus),
    employee_type: z.nativeEnum(EmployeeType),
    designationId: z.string().min(1, "Designation is required"),
    departmentId: z.string().min(1, "Department is required"),
    base_salary: z.string().min(1, "Base salary is required"),
    branch_id: z.string().min(1, "Branch is required"),
    userId: z.string().optional(),
    notes: z.string().optional(),
    create_user: z.boolean().default(false),
    username: z.string().optional(),
    password: z.string().optional(),
    reportingManagerId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.create_user && !data.userId) {
        return data.username && data.username.length >= 3;
      }
      return true;
    },
    {
      message: "Username is required (minimum 3 characters)",
      path: ["username"],
    }
  )
  .refine(
    (data) => {
      if (data.create_user && !data.userId) {
        return data.password && data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Password is required (minimum 6 characters)",
      path: ["password"],
    }
  );

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
}: Props) {
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();

  // State for date pickers
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [hireDate, setHireDate] = useState<Date | null>(null);

  // Fetch departments, designations, branches, users, and employees
  const { data: departmentsData } = useGetDepartmentsQuery();
  const { data: designationsData } = useGetDesignationsQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const { data: usersData } = useGetUsersQuery();
  const { data: employeesData } = useGetEmployeesQuery({ status: "active" });

  const isEdit = !!employee;
  const departments = departmentsData?.data || [];

  const designations = designationsData?.data?.items || [];
  const branches = branchesData?.data || [];
  const users = usersData?.data || [];
  const allEmployees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema) as Resolver<EmployeeFormData>,
    defaultValues: {
      employee_code: employee?.employee_code || "",
      first_name: employee?.first_name || "",
      last_name: employee?.last_name || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      address: employee?.address || "",
      status: employee?.status || EmployeeStatus.ACTIVE,
      employee_type: employee?.employee_type || EmployeeType.FULL_TIME,
      designationId: employee?.designationId?.toString() || "",
      departmentId: employee?.departmentId?.toString() || "",
      base_salary: employee?.base_salary || "",
      branch_id: employee?.branch?.id?.toString() || "",
      userId: employee?.userId?.toString() || "",
      notes: employee?.notes || "",
      create_user: false,
      username: "",
      password: "",
      reportingManagerId: employee?.reportingManagerId?.toString() || "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        employee_code: employee?.employee_code || "",
        first_name: employee?.first_name || "",
        last_name: employee?.last_name || "",
        email: employee?.email || "",
        phone: employee?.phone || "",
        address: employee?.address || "",
        status: employee?.status || EmployeeStatus.ACTIVE,
        employee_type: employee?.employee_type || EmployeeType.FULL_TIME,
        designationId: employee?.designationId?.toString() || "",
        departmentId: employee?.departmentId?.toString() || "",
        base_salary: employee?.base_salary || "",
        branch_id: employee?.branch?.id?.toString() || "",
        userId: employee?.userId?.toString() || "",
        notes: employee?.notes || "",
        create_user: false,
        username: "",
        password: "",
        reportingManagerId: employee?.reportingManagerId?.toString() || "",
      });

      // Set date picker values with robust date parsing
      if (employee?.date_of_birth) {
        const dob = new Date(employee.date_of_birth);
        setDateOfBirth(isNaN(dob.getTime()) ? null : dob);
      } else {
        setDateOfBirth(null);
      }

      if (employee?.hire_date) {
        const hire = new Date(employee.hire_date);
        setHireDate(isNaN(hire.getTime()) ? null : hire);
      } else {
        setHireDate(null);
      }
    } else {
      // Reset dates when modal closes
      setDateOfBirth(null);
      setHireDate(null);
    }
  }, [isOpen, employee, reset]);

  const createUserCheckbox = watch("create_user");
  const hasExistingUserId = watch("userId");

  const onSubmit = async (data: EmployeeFormData) => {
    // Validate date pickers
    if (!dateOfBirth) {
      toast.error("Date of birth is required");
      return;
    }
    if (!hireDate) {
      toast.error("Hire date is required");
      return;
    }

    let userId = data.userId;

    try {
      // If creating a new user and no existing user ID
      if (data.create_user && !hasExistingUserId) {
        const userPayload: CreateUserPayload = {
          username: data.username!,
          email: data.email,
          full_name: `${data.first_name} ${data.last_name}`,
          phone: data.phone,
          password: data.password!,
          roles: ["employee"], // Default role
          branch_ids: [parseInt(data.branch_id)],
        };

        const userResponse = await createUser(userPayload).unwrap();
        userId = userResponse.data.id.toString();
        toast.success("User created successfully!");
      }

      const payload: CreateEmployeePayload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        date_of_birth: dateOfBirth.toISOString().split("T")[0],
        hire_date: hireDate.toISOString().split("T")[0],
        status: data.status,
        employee_type: data.employee_type,
        designationId: parseInt(data.designationId),
        departmentId: parseInt(data.departmentId),
        base_salary: parseFloat(data.base_salary) || 0,
        branch_id: parseInt(data.branch_id),
        userId: userId && userId !== "" ? parseInt(userId) : undefined,
        notes: data.notes,
        employee_code: data.employee_code || undefined,
        reportingManagerId: data.reportingManagerId
          ? parseInt(data.reportingManagerId)
          : undefined,
      };

      if (isEdit && employee) {
        await updateEmployee({ id: employee.id, ...payload }).unwrap();
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(payload).unwrap();
        toast.success("Employee created successfully!");
      }
      onClose();
    } catch (err: any) {
      console.error("Error submitting employee:", err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl  max-h-[90vh] overflow-y-auto  scrollbar-hide"
      title={isEdit ? "Update Employee" : "Create New Employee"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Employee Code */}
          <FormField label="Employee Code">
            <Input
              {...register("employee_code")}
              placeholder="Enter employee code (optional)"
            />
          </FormField>

          {/* Email */}
          <FormField label="Email *">
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <FormField label="First Name *">
            <Input {...register("first_name")} placeholder="Enter first name" />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.first_name.message}
              </p>
            )}
          </FormField>

          {/* Last Name */}
          <FormField label="Last Name *">
            <Input {...register("last_name")} placeholder="Enter last name" />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.last_name.message}
              </p>
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Phone */}
          <FormField label="Phone *">
            <Input {...register("phone")} placeholder="Enter phone number" />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </FormField>

          {/* Date of Birth */}
          <div>
            <DatePicker
              id="date_of_birth"
              label="Date of Birth "
              value={dateOfBirth}
              onChange={(dates) =>
                setDateOfBirth(Array.isArray(dates) ? dates[0] : dates)
              }
              placeholder="Select date of birth"
              disableFuture={true}
              isRequired={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Hire Date */}
          <div>
            <DatePicker
              id="hire_date"
              label="Hire Date "
              value={hireDate}
              onChange={(dates) =>
                setHireDate(Array.isArray(dates) ? dates[0] : dates)
              }
              placeholder="Select hire date"
              disableFuture={false}
              isRequired={true}
            />
          </div>

          {/* Base Salary */}
          <FormField label="Base Salary *">
            <Input
              {...register("base_salary")}
              type="number"
              step="0.01"
              placeholder="Enter base salary"
            />
            {errors.base_salary && (
              <p className="text-red-500 text-sm mt-1">
                {errors.base_salary.message}
              </p>
            )}
          </FormField>
        </div>

        {/* Address */}
        <FormField label="Address *">
          <textarea
            {...register("address")}
            placeholder="Enter address"
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          {/* Department */}
          <SelectField
            label="Department *"
            data={departments.map((dept) => ({ id: dept.id, name: dept.name }))}
            value={watch("departmentId")}
            onChange={(value) => setValue("departmentId", value)}
          />

          {/* Designation */}
          <SelectField
            label="Designation *"
            data={designations.map((designation) => ({
              id: designation.id,
              name: designation.title,
            }))}
            value={watch("designationId")}
            onChange={(value) => setValue("designationId", value)}
          />

          {/* Branch */}
          <SelectField
            label="Branch *"
            data={branches.map((branch) => ({
              id: branch.id,
              name: branch.name,
            }))}
            value={watch("branch_id")}
            onChange={(value) => setValue("branch_id", value)}
          />
        </div>

        {/* Reporting Manager */}
        <SelectField
          label="Reporting Manager (Optional)"
          data={[
            { id: "", name: "No reporting manager" },
            ...allEmployees
              .filter((emp) => emp.id !== employee?.id) // Exclude current employee from the list
              .map((emp) => ({
                id: emp.id.toString(),
                name: `${emp.first_name} ${emp.last_name} (${emp.employee_code})`,
              })),
          ]}
          value={watch("reportingManagerId") || ""}
          onChange={(value) => setValue("reportingManagerId", value)}
          placeholder="Select reporting manager or leave empty"
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Employee Type */}
          <SelectField
            label="Employee Type *"
            data={[
              { id: EmployeeType.FULL_TIME, name: "Full Time" },
              { id: EmployeeType.PART_TIME, name: "Part Time" },
              { id: EmployeeType.CONTRACT, name: "Contract" },
              { id: EmployeeType.INTERN, name: "Intern" },
            ]}
            value={watch("employee_type")}
            onChange={(value) =>
              setValue("employee_type", value as EmployeeType)
            }
          />

          {/* Status */}
          <SelectField
            label="Status *"
            data={[
              { id: EmployeeStatus.ACTIVE, name: "Active" },
              { id: EmployeeStatus.INACTIVE, name: "Inactive" },
              { id: EmployeeStatus.TERMINATED, name: "Terminated" },
              { id: EmployeeStatus.ON_LEAVE, name: "On Leave" },
            ]}
            value={watch("status")}
            onChange={(value) => setValue("status", value as EmployeeStatus)}
          />
        </div>

        {/* User Creation Section */}
        {!isEdit && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create_user"
                {...register("create_user")}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="create_user"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Create User Account
              </label>
            </div>

            {createUserCheckbox && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FormField label="Username *">
                  <Input
                    {...register("username")}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </FormField>

                <FormField label="Password *">
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </FormField>
              </div>
            )}
          </div>
        )}

        {/* User Selection - Show only when not creating a new user or in edit mode */}
        {(!createUserCheckbox || isEdit) && (
          <SelectField
            label={isEdit ? "User" : "Select Existing User (Optional)"}
            data={[
              { id: "", name: "No user selected" },
              ...users.map((user) => ({
                id: user.id.toString(),
                name: `${user.full_name} (${user.username})`,
              })),
            ]}
            value={watch("userId") || ""}
            onChange={(value) => setValue("userId", value)}
            placeholder={
              isEdit ? "Select user" : "Choose an existing user or leave empty"
            }
            disabled={createUserCheckbox && !isEdit}
          />
        )}

        {/* Notes */}
        <FormField label="Notes">
          <textarea
            {...register("notes")}
            placeholder="Enter any additional notes"
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </FormField>

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating || isCreatingUser}
          >
            {isCreatingUser
              ? "Creating User..."
              : isCreating
              ? "Creating Employee..."
              : isUpdating
              ? "Updating Employee..."
              : isEdit
              ? "Update Employee"
              : "Create Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
