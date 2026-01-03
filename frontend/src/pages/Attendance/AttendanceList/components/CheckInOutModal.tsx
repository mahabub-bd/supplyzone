import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { SelectField } from "../../../../components/form/form-elements/SelectFiled";
import TimePicker from "../../../../components/form/time-picker";
import Button from "../../../../components/ui/button/Button";
import { Modal } from "../../../../components/ui/modal";

import {
  useCheckInMutation,
  useCheckOutMutation,
} from "../../../../features/attendance/attendanceApi";
import { useGetBranchesQuery } from "../../../../features/branch/branchApi";
import { useGetEmployeesQuery } from "../../../../features/employee/employeeApi";

import { CheckInOutFormType, checkInOutSchema } from "./check-in-out.schema";

interface CheckInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInOutModal({
  isOpen,
  onClose,
}: CheckInOutModalProps) {
  const [mode, setMode] = useState<"check_in" | "check_out">("check_in");

  const { data: employeesData } = useGetEmployeesQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const employees = employeesData?.data || [];
  const branches = branchesData?.data || [];

  // React Hook Form Initialization
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckInOutFormType>({
    resolver: zodResolver(checkInOutSchema),
    defaultValues: {
      employee_id: "",
      branch_id: "",
      check_in_time: "",
      check_out_time: "",
    },
  });

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      reset({
        employee_id: "",
        branch_id: "",
        check_in_time: "",
        check_out_time: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: CheckInOutFormType) => {
    try {
      if (mode === "check_in") {
        if (!values.check_in_time) {
          toast.error("Please enter check-in time");
          return;
        }

        await checkIn({
          employee_id: Number(values.employee_id),
          branch_id: Number(values.branch_id),
          check_in_time: values.check_in_time,
        }).unwrap();

        toast.success("Checked in successfully");
      } else {
        if (!values.check_out_time) {
          toast.error("Please enter check-out time");
          return;
        }

        await checkOut({
          employee_id: Number(values.employee_id),
          branch_id: Number(values.branch_id),
          check_out_time: values.check_out_time,
        }).unwrap();

        toast.success("Checked out successfully");
      }

      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${mode === "check_in" ? "check in" : "check out"}`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      title="Employee Attendance"
    >
      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <Button
          type="button"
          onClick={() => setMode("check_in")}
          variant={mode === "check_in" ? "success" : "secondary"}
          startIcon={<LogIn size={18} />}
          className="flex-1"
        >
          Check In
        </Button>
        <Button
          type="button"
          onClick={() => setMode("check_out")}
          variant={mode === "check_out" ? "destructive" : "secondary"}
          startIcon={<LogOut size={18} />}
          className="flex-1"
        >
          Check Out
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Employee Select */}
        <Controller
          name="employee_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Employee"
              data={employees.map((emp) => ({
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name} - ${emp.employee_code}`,
              }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.employee_id?.message}
            />
          )}
        />

        {/* Branch Select */}
        <Controller
          name="branch_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Branch"
              data={branches}
              value={field.value}
              onChange={field.onChange}
              error={errors.branch_id?.message}
            />
          )}
        />

        {/* Time Input */}
        {mode === "check_in" ? (
          <Controller
            name="check_in_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                id="check-in-time"
                label="Check In Time"
                placeholder="Select time"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  if (date) {
                    field.onChange(date.toISOString());
                  } else {
                    field.onChange("");
                  }
                }}
                error={!!errors.check_in_time}
                hint={errors.check_in_time?.message}
              />
            )}
          />
        ) : (
          <Controller
            name="check_out_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                id="check-out-time"
                label="Check Out Time"
                placeholder="Select time"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  if (date) {
                    field.onChange(date.toISOString());
                  } else {
                    field.onChange("");
                  }
                }}
                error={!!errors.check_out_time}
                hint={errors.check_out_time?.message}
              />
            )}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isCheckingIn || isCheckingOut}
          >
            {isCheckingIn || isCheckingOut
              ? "Processing..."
              : mode === "check_in"
              ? "Check In"
              : "Check Out"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
