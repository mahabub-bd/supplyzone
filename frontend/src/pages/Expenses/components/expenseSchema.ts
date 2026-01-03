// src/pages/expenses/components/expenseSchema.ts
import { z } from "zod";

export const expenseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),

    amount: z.number().min(1, "Amount must be greater than 0"),

    category_id: z.number().min(1, "Category is required"),
    branch_id: z.number().min(1, "Branch is required"),

    payment_method: z.enum(["cash", "bank"], {
        message: "Payment method is required",
    }),

    account_code: z.string().min(1, "Account is required"),


});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
