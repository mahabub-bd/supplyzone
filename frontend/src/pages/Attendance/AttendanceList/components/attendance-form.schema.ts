import { z } from "zod";

const statusOptions = [
  "present",
  "absent",
  "late",
  "half_day",
  "leave",
] as const;

export const attendanceFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  status: z.enum(statusOptions, {
    message: "Status is required",
  }),
  notes: z.string().optional(),
});

export type AttendanceFormType = z.infer<typeof attendanceFormSchema>;

export const statusSelectOptions = statusOptions.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
}));
