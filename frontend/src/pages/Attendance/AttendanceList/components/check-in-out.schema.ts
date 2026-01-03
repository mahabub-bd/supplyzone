import { z } from "zod";

export const checkInOutSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  branch_id: z.string().min(1, "Branch is required"),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
}).refine(
  (data) => data.check_in_time || data.check_out_time,
  {
    message: "Either check-in time or check-out time is required",
    path: ["check_in_time"],
  }
);

export type CheckInOutFormType = z.infer<typeof checkInOutSchema>;
