import { z } from "zod";
import { QuotationStatus } from "../../../types/quotation";

export const quotationItemSchema = z.object({
  product_id: z.coerce.number().min(0, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive").optional(),
  discount_percentage: z.coerce
    .number()
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100")
    .optional(),
}).refine((data) => data.product_id > 0, {
  message: "Product is required",
  path: ["product_id"],
});

export const quotationSchema = z.object({
  items: z.array(quotationItemSchema).min(1, "At least 1 item is required"),
  discount_type: z.enum(["fixed", "percentage"]).default("fixed"),
  discount_value: z.coerce
    .number()
    .min(0, "Discount value cannot be negative")
    .default(0),
  tax_percentage: z.coerce
    .number()
    .min(0, "Tax percentage cannot be negative")
    .max(100, "Tax percentage cannot exceed 100")
    .default(0),
  customer_id: z.coerce.number().min(1, "Customer is required"),
  quotation_no: z.string().optional(),
  branch_id: z.coerce.number().min(1, "Branch is required"),
  valid_until: z.string().min(1, "Valid until date is required"),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(QuotationStatus).default(QuotationStatus.DRAFT),
}).superRefine((data, ctx) => {
  const validItems = data.items.filter(item => item.product_id > 0);
  if (validItems.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one item with a selected product is required",
      path: ["items"],
    });
  }
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;