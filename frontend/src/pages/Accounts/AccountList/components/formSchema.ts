import z from "zod";

export const fundTransferSchema = z.object({
  toAccountCode: z.string().min(1, "Please select an account"),
  amount: z.number().positive("Amount must be greater than zero"),
  narration: z.string().optional(),
});
