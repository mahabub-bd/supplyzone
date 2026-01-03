import { z } from "zod";

export const bulkAttendanceSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  jsonData: z
    .string()
    .min(1, "Attendance data is required")
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      },
      {
        message: "JSON data must be a valid array of attendance records",
      }
    ),
});

export type BulkAttendanceFormType = z.infer<typeof bulkAttendanceSchema>;
