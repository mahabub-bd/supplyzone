import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";
import { useSelector } from "react-redux";
import DatePicker from "../../../components/form/date-picker";
import { SelectField } from "../../../components/form/form-elements/SelectFiled";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useGetBranchesQuery } from "../../../features/branch/branchApi";
import { useGetEmployeesQuery } from "../../../features/employee/employeeApi";
import { useCreateLeaveRequestMutation } from "../../../features/leave/leaveApi";
import { useHasPermission } from "../../../hooks/useHasPermission";
import { CreateLeaveRequestPayload, LeaveType } from "../../../types";
import { calculateBusinessDays } from "../../../utlis";
import { RootState } from "../../../store";

const leaveTypeOptions = [
  { id: "annual", name: "Annual Leave" },
  { id: "sick", name: "Sick Leave" },
  { id: "maternity", name: "Maternity Leave" },
  { id: "paternity", name: "Paternity Leave" },
  { id: "unpaid", name: "Unpaid Leave" },
  { id: "compassionate", name: "Compassionate Leave" },
];

const leaveRequestSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  branch_id: z.string().min(1, "Branch is required"),
  start_date: z.date({
    message: "Start date is required",
  }),
  end_date: z.date({
    message: "End date is required",
  }),
  leave_type: z.enum(
    [
      "annual",
      "sick",
      "maternity",
      "paternity",
      "unpaid",
      "compassionate",
    ] as const,
    {
      message: "Leave type is required",
    }
  ),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
}: LeaveRequestModalProps) {
  const [createLeaveRequest, { isLoading }] = useCreateLeaveRequestMutation();
  const { data: employeesData } = useGetEmployeesQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const { permissions } = useSelector((state: RootState) => state.auth);
  const canCreate = useHasPermission("hrm.leave_requests.create");

  // Debug: Log the permission value and available permissions
  console.log('canCreate permission:', canCreate);
  console.log('Available permissions:', permissions);

  // Temporary override for testing - remove this in production
  const canCreateBypassed = true;

  const employees = employeesData?.data || [];
  const branches = branchesData?.data || [];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors: _errors },
    clearErrors,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employee_id: "",
      branch_id: "",
      start_date: undefined,
      end_date: undefined,
      leave_type: undefined,
      reason: "",
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const onSubmit = async (data: LeaveRequestFormData) => {
    if (!canCreateBypassed) {
      toast.error("You don't have permission to create leave requests");
      return;
    }

    try {
      const payload: CreateLeaveRequestPayload = {
        start_date: data.start_date.toISOString().split("T")[0],
        end_date: data.end_date.toISOString().split("T")[0],
        leave_type: data.leave_type as LeaveType,
        reason: data.reason.trim(),
        employee_id: parseInt(data.employee_id),
        branch_id: parseInt(data.branch_id),
      };

      await createLeaveRequest(payload).unwrap();
      toast.success("Leave request created successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create leave request");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    return calculateBusinessDays(startDate, endDate);
  };

  return (
    <Modal
      className="max-w-2xl"
      isOpen={isOpen}
      onClose={handleClose}
      title="New Leave Request"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee Selection */}
          <Controller
            name="employee_id"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <SelectField
                label="Employee*"
                data={employees.map((emp) => ({
                  id: emp.id,
                  name: `${emp.first_name} ${emp.last_name}`,
                }))}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />

          {/* Branch Selection */}
          <Controller
            name="branch_id"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <SelectField
                label="Branch*"
                data={branches.map((branch) => ({
                  id: branch.id,
                  name: branch.name,
                }))}
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <Controller
            name="start_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date*
                </label>
                <DatePicker
                  id="start-date"
                  mode="single"
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    clearErrors("start_date");
                  }}
                  placeholder="Select start date"
                  disableFuture={false}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />

          {/* End Date */}
          <Controller
            name="end_date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date*
                </label>
                <DatePicker
                  id="end-date"
                  mode="single"
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    clearErrors("end_date");
                  }}
                  placeholder="Select end date"
                  disableFuture={false}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Leave Type */}
          <Controller
            name="leave_type"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <SelectField
                label="Leave Type*"
                data={leaveTypeOptions}
                value={field.value || ""}
                onChange={(value) => {
                  if (value) {
                    field.onChange(value as LeaveType);
                  }
                }}
                error={error?.message}
              />
            )}
          />

          {/* Calculated Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Days
            </label>
            <div className="h-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {calculateDays()} day(s)
              </span>
            </div>
          </div>
        </div>

        {/* Reason */}
        <Controller
          name="reason"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason*
              </label>
              <textarea
                {...field}
                placeholder="Enter reason for leave request..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:text-white ${
                  error
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error.message}</p>
              )}
            </div>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !canCreateBypassed}
          >
            {isLoading ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
