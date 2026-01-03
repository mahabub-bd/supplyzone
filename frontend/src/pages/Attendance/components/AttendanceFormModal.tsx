import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import DatePicker from "../../../components/form/date-picker";
import {
  FormField,
  SelectField,
} from "../../../components/form/form-elements/SelectFiled";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useUpdateAttendanceMutation } from "../../../features/attendance/attendanceApi";
import { AttendanceRecord } from "../../../types";

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord | null;
  onSuccess?: () => void;
}

const attendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  status: z.enum(["present", "absent", "late", "half_day", "leave"]),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

const statusOptions = [
  { id: "present", name: "Present" },
  { id: "absent", name: "Absent" },
  { id: "late", name: "Late" },
  { id: "half_day", name: "Half Day" },
  { id: "leave", name: "Leave" },
];

export default function AttendanceFormModal({
  isOpen,
  onClose,
  attendance,
  onSuccess,
}: AttendanceFormModalProps) {
  const [attendanceDate, setAttendanceDate] = useState<Date | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [breakStartDate, setBreakStartDate] = useState<Date | null>(null);
  const [breakEndDate, setBreakEndDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  });

  const statusValue = watch("status");

  const [updateAttendance, { isLoading }] = useUpdateAttendanceMutation();

  const parseDateTime = (
    timeString: string | null | undefined,
    baseDate?: string
  ): Date | null => {
    if (!timeString) return null;

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
      const date = baseDate || new Date().toISOString().split("T")[0];
      const full = `${date}T${timeString}`;
      const d = new Date(full);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(timeString);
    return isNaN(d.getTime()) ? null : d;
  };

  const parseDate = (value: string | null | undefined): Date | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    if (!isOpen || !attendance) return;

    setValue("date", attendance.date);
    setValue("status", attendance.status);
    setValue("notes", attendance.notes || "");

    setAttendanceDate(parseDate(attendance.date));
    setCheckInDate(parseDateTime(attendance.check_in, attendance.date));
    setCheckOutDate(parseDateTime(attendance.check_out, attendance.date));
    setBreakStartDate(parseDateTime(attendance.break_start, attendance.date));
    setBreakEndDate(parseDateTime(attendance.break_end, attendance.date));
  }, [isOpen, attendance?.id]);

  const formatForAPI = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${mi}:${s}`;
  };

  const onSubmit = async (data: AttendanceFormData) => {
    if (!attendance) return;

    try {
      await updateAttendance({
        id: attendance.id,
        date: data.date,
        check_in: formatForAPI(checkInDate),
        check_out: formatForAPI(checkOutDate),
        break_start: formatForAPI(breakStartDate),
        break_end: formatForAPI(breakEndDate),
        status: data.status,
        notes: data.notes || undefined,
      }).unwrap();

      toast.success("Attendance updated successfully");
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update attendance");
    }
  };

  const handleClose = () => {
    reset();
    setAttendanceDate(null);
    setCheckInDate(null);
    setCheckOutDate(null);
    setBreakStartDate(null);
    setBreakEndDate(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Attendance Record"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-white/5">
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Employee Information
          </h3>
          <div className="text-base font-semibold text-gray-900 dark:text-white">
            {attendance?.employee
              ? `${attendance.employee.first_name} ${attendance.employee.last_name}`
              : "Unknown Employee"}
          </div>
          {attendance?.employee?.employee_code && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Code: {attendance.employee.employee_code}
            </div>
          )}
        </div>

        {/* Attendance Date */}
        <DatePicker
          id="attendance-date"
          label="Attendance Date"
          value={attendanceDate}
          onChange={(date) => {
            if (date && !(date instanceof Array)) {
              setAttendanceDate(date);
              setValue("date", date.toISOString().split("T")[0]);
            }
          }}
        />

        {/* Check In & Check Out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            id="check-in"
            label="Check In Time"
            mode="datetime"
            value={checkInDate}
            onChange={(date) =>
              setCheckInDate(date && !(date instanceof Array) ? date : null)
            }
          />

          <DatePicker
            id="check-out"
            label="Check Out Time"
            mode="datetime"
            value={checkOutDate}
            onChange={(date) =>
              setCheckOutDate(date && !(date instanceof Array) ? date : null)
            }
          />
        </div>

        {/* Break times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            id="break-start"
            label="Break Start"
            mode="datetime"
            value={breakStartDate}
            onChange={(date) =>
              setBreakStartDate(date && !(date instanceof Array) ? date : null)
            }
          />

          <DatePicker
            id="break-end"
            label="Break End"
            mode="datetime"
            value={breakEndDate}
            onChange={(date) =>
              setBreakEndDate(date && !(date instanceof Array) ? date : null)
            }
          />
        </div>

        <SelectField
          label="Status"
          data={statusOptions}
          value={statusValue}
          onChange={(value) => setValue("status", value as any)}
          error={errors.status?.message}
        />

        {/* Hours box */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="text-xs text-blue-700 dark:text-blue-400">
              Regular Hours
            </div>
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-300">
              {attendance?.regular_hours || "0.00"} hrs
            </div>
          </div>

          <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
            <div className="text-xs text-orange-700 dark:text-orange-400">
              Overtime Hours
            </div>
            <div className="text-lg font-semibold text-orange-900 dark:text-orange-300">
              {attendance?.overtime_hours || "0.00"} hrs
            </div>
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg dark:bg-[#2a2a2a]"
            placeholder="Additional notes..."
          />
        </FormField>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Attendance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
