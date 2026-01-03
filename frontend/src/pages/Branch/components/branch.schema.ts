import { z } from "zod";

export const branchSchema = z.object({
  code: z.string().min(1, "Branch code is required"),
  name: z.string().min(1, "Branch name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  is_active: z.boolean(),
  default_warehouse_id: z.string().optional().nullable(),
});

export type BranchFormType = z.infer<typeof branchSchema>;
