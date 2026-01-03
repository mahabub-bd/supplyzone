import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import DatePicker from "../../../../components/form/date-picker";
import TimePicker from "../../../../components/form/time-picker";
import {
  FormField,
  SelectField,
} from "../../../../components/form/form-elements/SelectFiled";
import Button from "../../../../components/ui/button/Button";
import { Modal } from "../../../../components/ui/modal";
import { useUpdateAttendanceMutation } from "../../../../features/attendance/attendanceApi";
import { AttendanceRecord } from "../../../../types";

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
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [breakStartDate, setBreakStartDate] = useState<Date | null>(null);
  const [breakEndDate, setBreakEndDate] = useState<Date | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<Date | null>(null);

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

  // Helper function to safely parse datetime (handles both full ISO and time-only strings)
  const parseDateTime = (
    dateString: string | null | undefined
  ): Date | null => {
    if (!dateString) return null;
    try {
      // If it's just time (HH:mm:ss), combine with attendance date
      if (
        dateString.includes(":") &&
        !dateString.includes("T") &&
        !dateString.includes("-")
      ) {
        const attendanceDate =
          attendance?.date || new Date().toISOString().split("T")[0];
        const dateTimeString = `${attendanceDate}T${dateString}`;
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return null;
        return date;
      }

      // For full datetime strings
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  };

  // Helper function to safely parse date
  const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (attendance) {
      const formData = {
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes || "",
      };

      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof AttendanceFormData, value);
      });

      setAttendanceDate(parseDate(attendance.date));

      // Set date picker values
      setCheckInDate(parseDateTime(attendance.check_in));
      setCheckOutDate(parseDateTime(attendance.check_out));
      setBreakStartDate(parseDateTime(attendance.break_start));
      setBreakEndDate(parseDateTime(attendance.break_end));
    }
  }, [attendance, setValue]);

  const onSubmit = async (data: AttendanceFormData) => {
    if (!attendance) return;

    const formatForAPI = (date: Date | null): string | undefined => {
      if (!date) return undefined;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

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
    setCheckInDate(null);
    setCheckOutDate(null);
    setAttendanceDate(null);
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
        {/* Employee Info */}
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

        {/* Date */}
        <DatePicker
          id="attendance-date"
          label="Attendance Date"
          value={attendanceDate}
          onChange={(date) => {
            if (date && !(date instanceof Array)) {
              setAttendanceDate(date); // UI তে দেখানোর জন্য
              setValue("date", date.toISOString().split("T")[0]); // form এ string
            } else {
              setAttendanceDate(null);
              setValue("date", "");
            }
          }}
        />

        {/* Check In & Check Out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TimePicker
              id="check-in-time"
              label="Check In Time"
              placeholder="Select time"
              value={checkInDate}
              onChange={(date) => setCheckInDate(date)}
            />
          </div>

          <div>
            <TimePicker
              id="check-out-time"
              label="Check Out Time"
              placeholder="Select time"
              value={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
            />
          </div>
        </div>

        {/* Break Start & Break End */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TimePicker
              id="break-start"
              label="Break Start"
              placeholder="Select time"
              value={breakStartDate}
              onChange={(date) => setBreakStartDate(date)}
            />
          </div>

          <div>
            <TimePicker
              id="break-end"
              label="Break End"
              placeholder="Select time"
              value={breakEndDate}
              onChange={(date) => setBreakEndDate(date)}
            />
          </div>
        </div>

        {/* Status */}
        <SelectField
          label="Status"
          data={statusOptions}
          value={statusValue}
          onChange={(value) => setValue("status", value as any)}
          error={errors.status?.message}
        />

        {/* Hours Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="text-xs text-blue-700 dark:text-blue-400">
              Regular Hours
            </div>
            <div className="mt-1 text-lg font-semibold text-blue-900 dark:text-blue-300">
              {attendance?.regular_hours || "0.00"} hrs
            </div>
          </div>

          <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
            <div className="text-xs text-orange-700 dark:text-orange-400">
              Overtime Hours
            </div>
            <div className="mt-1 text-lg font-semibold text-orange-900 dark:text-orange-300">
              {attendance?.overtime_hours || "0.00"} hrs
            </div>
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#2a2a2a] dark:border-white/10 dark:text-white"
            placeholder="Add any additional notes..."
          />
        </FormField>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Updating..." : "Update Attendance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
